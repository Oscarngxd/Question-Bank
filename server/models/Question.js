const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: [true, 'Question content is required'],
    trim: true
  },
  source: {
    type: String,
    required: [true, 'Question source is required'],
    enum: ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook'],
    default: 'HKDSE'
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
    enum: [
      'Quadratic Equations', 'Functions and Graphs', 'Equations of Straight Lines',
      'Polynomials', 'Inequalities', 'Exponential and Logarithmic Functions',
      'Trigonometry', 'Permutations and Combinations', 'Binomial Theorem',
      'Sequences', 'Vectors', 'Coordinate Geometry', 'Circles',
      'Statistics', 'Probability', 'Mensuration', 'Transformation',
      'Locus', 'Linear Programming', 'Matrices', 'Complex Numbers',
      'Calculus', 'Limits', 'Differentiation', 'Integration',
      'Applications of Calculus', 'Data Handling', 'Others'
    ],
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
questionSchema.index({ type: 1, source: 1, topic: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ content: 'text' }); // For text search

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