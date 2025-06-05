const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: [true, 'Question content is required'],
    trim: true
  },
  module: {
    type: String,
    required: [true, 'Module is required'],
    enum: ['compulsory', 'module1', 'module2'],
    default: 'compulsory'
  },
  source: {
    type: String,
    required: [true, 'Question source is required'],
    enum: ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook'],
    default: 'HKDSE'
  },
  year: {
    type: String,
    trim: true
  },
  school: {
    type: String,
    trim: true
  },
  textbook: {
    type: String,
    trim: true
  },
  type: { 
    type: String, 
    required: [true, 'Question type is required'],
    enum: ['Conventional', 'MC'],
    default: 'Conventional'
  },
  topic: { 
    type: String, 
    required: [true, 'Question topic is required'],
    trim: true
  },
  options: [{
    type: String,
    trim: true
  }],
  correctAnswer: { 
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Correct answer is required']
  },
  markingScheme: {
    type: String,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  timeEstimate: {
    type: Number, // in minutes
    min: 1,
    default: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  },
  lastModifiedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Add indexes for better query performance
questionSchema.index({ type: 1, source: 1, topic: 1, module: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ content: 'text' }); // For text search

// Generate formatted tags based on question metadata
questionSchema.pre('save', function(next) {
  // Create formatted tags like "HKCEE - 2017" or "School Exam - School A - 2012"
  if (!this.tags) {
    this.tags = [];
  }
  
  // Generate source-based tag
  if (this.source) {
    let formattedTag = this.source;
    
    // For school exams, add the school name
    if ((this.source === 'School Exam' || this.source === 'School Mock') && this.school) {
      formattedTag += ' - ' + this.school;
    }
    
    // For textbooks, add the textbook name
    if (this.source === 'Textbook' && this.textbook) {
      formattedTag += ' - ' + this.textbook;
    }
    
    // Add year if available
    if (this.year) {
      formattedTag += ' - ' + this.year;
    }
    
    // Add the formatted tag if it doesn't already exist
    if (!this.tags.includes(formattedTag)) {
      this.tags.push(formattedTag);
    }
    
    // Also add the topic as a tag if not already included
    if (this.topic && !this.tags.includes(this.topic)) {
      this.tags.push(this.topic);
    }
  }
  
  next();
});

// Add validation for MC questions
questionSchema.pre('save', function(next) {
  if (this.type === 'MC') {
    if (!this.options || this.options.length < 2) {
      next(new Error('Multiple choice questions must have at least 2 options'));
    }
    if (typeof this.correctAnswer !== 'number' || 
        this.correctAnswer < 0 || 
        this.correctAnswer >= this.options.length) {
      next(new Error('Invalid correct answer index for multiple choice question'));
    }
  }
  next();
});

module.exports = mongoose.model('Question', questionSchema); 