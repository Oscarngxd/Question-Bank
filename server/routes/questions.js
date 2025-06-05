const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');
const Question = require('../models/Question');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopPosition, TabStopType } = require('docx');
const docx = require('docx');
const fs = require('fs');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only .doc and .docx files are allowed'));
    }
  }
});

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'question-image-' + uniqueSuffix + ext);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/gif'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg, .jpeg and .gif files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Move all special routes before /:id routes
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          byType: {
            $push: {
              type: '$type',
              count: 1
            }
          },
          byLevel: {
            $push: {
              level: '$level',
              count: 1
            }
          },
          byTopic: {
            $push: {
              topic: '$topic',
              count: 1
            }
          }
        }
      }
    ]);

    // Process the results
    const summary = {
      totalQuestions: stats[0]?.totalQuestions || 0,
      byType: {},
      byLevel: {},
      byTopic: {}
    };

    // Process type statistics
    stats[0]?.byType.forEach(item => {
      summary.byType[item.type] = (summary.byType[item.type] || 0) + item.count;
    });

    // Process level statistics
    stats[0]?.byLevel.forEach(item => {
      summary.byLevel[item.level] = (summary.byLevel[item.level] || 0) + item.count;
    });image.png

    // Process topic statistics
    stats[0]?.byTopic.forEach(item => {
      summary.byTopic[item.topic] = (summary.byTopic[item.topic] || 0) + item.count;
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

router.get('/template', async (req, res) => {
  try {
    // Get module from query parameters
    const { module } = req.query;
    let templateTitle = "Math Question Bank Template";
    let exampleTopics = [];
    
    // Customize template based on selected module
    if (module) {
      switch(module) {
        case 'compulsory':
          templateTitle = "Math Question Bank Template - Compulsory Part";
          exampleTopics = ['Algebra', 'Geometry', 'Trigonometry', 'Functions', 'Coordinate Geometry'];
          break;
        case 'module1':
          templateTitle = "Math Question Bank Template - Module 1 (Calculus & Statistics)";
          exampleTopics = ['Calculus', 'Statistics', 'Probability', 'Differentiation', 'Integration'];
          break;
        case 'module2':
          templateTitle = "Math Question Bank Template - Module 2 (Algebra & Calculus)";
          exampleTopics = ['Advanced Algebra', 'Calculus Methods', 'Mathematical Induction', 'Complex Numbers', 'Vectors'];
          break;
        default:
          exampleTopics = ['Quadratic Equations', 'Trigonometry', 'Calculus'];
      }
    }
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: templateTitle,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          
          // Add module information
          module ? new Paragraph({
            text: `Module: ${module}`,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 }
          }) : null,
          
          new Paragraph({
            text: "Instructions:",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "1. Each question should start with 'Question X' where X is the question number",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "2. Write the question content after the question number",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "3. Specify Source (HKDSE, HKCEE, HKALE, School Exam, School Mock, Textbook) after the question content",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "4. After Source, include additional information based on the source type:",
            spacing: { after: 0 }
          }),
          new Paragraph({
            text: "   - For HKDSE, HKCEE, HKALE: Add Year (e.g., Year: 2022)",
            spacing: { after: 0 }
          }),
          new Paragraph({
            text: "   - For School Exam, School Mock: Add School (e.g., School: School A) and Year (e.g., Year: 2022)",
            spacing: { after: 0 }
          }),
          new Paragraph({
            text: "   - For Textbook: Add Textbook name (e.g., Textbook: Mathematics Extended Part Module 1)",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "5. Specify Topic (e.g., Quadratic Equations, Trigonometry, etc.) after the Source details",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "6. Specify Type (Conventional or MC) after the Topic",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "7. For multiple choice questions, add options with (a), (b), (c), etc.",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "8. End with Correct Answer: [option letter or answer]",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "9. Add a Marking Scheme section after the correct answer for each question.",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Example Questions:",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Question 1",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Solve the quadratic equation: $x^2 + 5x + 6 = 0$\nShow your working and find the values of x.",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Source: HKDSE",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Year: 2022",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Topic: Quadratic Equations",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Type: Conventional",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Correct Answer: x = -2, x = -3",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Marking Scheme: 1. Factorize $x^2 + 5x + 6 = 0$  2. (x+2)(x+3)=0  3. x=-2, -3",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Question 2",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "What is the derivative of $f(x) = 3x^2 + 2x - 1$?",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Source: HKDSE",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Year: 2023",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Topic: Calculus",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Type: Conventional",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Correct Answer: 6x + 2",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Marking Scheme: 1. Differentiate $f(x)$  2. $f'(x) = 6x + 2$",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Question 3",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "In a right-angled triangle, if the hypotenuse is 5 units and one side is 3 units, what is the length of the other side?",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Source: HKCEE",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Year: 2007",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Topic: Geometry",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Type: MC",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "(a) 4 units",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "(b) 6 units",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "(c) 8 units",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "(d) 10 units",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Correct Answer: a",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Marking Scheme: 1. Use Pythagoras' theorem: $c^2 = a^2 + b^2$  2. $5^2 = 3^2 + b^2$  3. $b = 4$ units",
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "Question 4",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Solve the following system of equations:\n$3x + 2y = 12$\n$5x - 3y = 7$",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Source: School Exam",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "School: School A",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Year: 2021",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Topic: Equations of Straight Lines",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Type: Conventional",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Correct Answer: $x = 3, y = 1.5$",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Marking Scheme: 1. Multiply the first equation by 3 to get $9x + 6y = 36$  2. Multiply the second equation by 2 to get $10x - 6y = 14$  3. Add the equations to get $19x = 50$  4. Solve for $x$ to get $x = 50/19 ≈ 2.63$  5. Substitute this value into the first equation to find $y$",
            spacing: { after: 400 }
          }),
          new Paragraph({
            text: "Question 5",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Find the indefinite integral: $\\int x \\cdot \\sin(x) \\, dx$",
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: "Source: Textbook",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Textbook: Mathematics Extended Part Module 1",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Topic: Integration",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Type: Conventional",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Correct Answer: $\\sin(x) - x \\cdot \\cos(x) + C$",
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: "Marking Scheme: 1. Use integration by parts with $u = x$ and $dv = \\sin(x) \\, dx$  2. $u \\cdot v - \\int v \\, du$ with $v = -\\cos(x)$ and $du = dx$  3. $-x \\cdot \\cos(x) - \\int -\\cos(x) \\, dx$  4. $-x \\cdot \\cos(x) + \\int \\cos(x) \\, dx$  5. $-x \\cdot \\cos(x) + \\sin(x) + C$  6. Simplify to get $\\sin(x) - x \\cdot \\cos(x) + C$",
            spacing: { after: 400 }
          })
        ],
      }],
    });

    // Create the document buffer
    const buffer = await docx.Packer.toBuffer(doc);
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=math_question_template.docx');
    
    // Send the buffer
    res.send(buffer);
  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({
      message: 'Error generating template',
      error: error.message
    });
  }
});

router.get('/filter', async (req, res) => {
  try {
    const { type, source, topic, search, module, year, school, textbook } = req.query;
    let query = {};

    if (type) query.type = type;
    if (source) query.source = source;
    if (topic) query.topic = topic;
    if (year) query.year = year;
    if (school) query.school = school;
    if (textbook) query.textbook = textbook;
    
    // Add module filtering - directly filter by module field
    if (module) {
      // Add the module field to the query directly
      query.module = module;
      
      // We can keep topic suggestions by module as supplementary filters
      // but the primary filter should be the module field
      /* 
      // These were the old topic-based filters which we've replaced
      switch(module) {
        case 'compulsory':
          // For compulsory, filter to include basic topics
          query.topic = { $in: [
            'Algebra', 'Geometry', 'Trigonometry', 'Functions', 
            'Coordinate Geometry', 'Quadratic Equations', 'Polynomials'
          ]};
          break;
        case 'module1':
          // For module1, filter to include calculus and statistics topics
          query.topic = { $in: [
            'Calculus', 'Statistics', 'Probability', 'Differentiation',
            'Integration', 'Applications of Calculus', 'Data Handling'
          ]};
          break;
        case 'module2':
          // For module2, filter to include advanced algebra and calculus
          query.topic = { $in: [
            'Calculus', 'Advanced Algebra', 'Vectors', 'Complex Numbers',
            'Matrices', 'Mathematical Induction', 'Limits'
          ]};
          break;
      }
      */
    }

    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { markingScheme: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query).sort({ createdAt: -1 });
    res.json({ questions });
  } catch (error) {
    console.error('Error filtering questions:', error);
    res.status(500).json({ message: 'Error filtering questions', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(400).json({ message: 'Error creating question', error: error.message });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { questions, module } = req.body;
    
    if (!module) {
      return res.status(400).json({ message: 'Module selection is required' });
    }
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Invalid questions format' });
    }

    // Add module to each question if not already present
    const questionsWithModule = questions.map(q => ({
      ...q,
      module: q.module || module
    }));

    // Use individual save() instead of insertMany() to trigger pre-save hooks
    const savedQuestions = [];
    
    for (const questionData of questionsWithModule) {
      const question = new Question(questionData);
      await question.save(); // This will trigger the pre-save hook for tag generation
      savedQuestions.push(question);
    }

    res.status(200).json({
      message: 'Questions saved successfully',
      count: savedQuestions.length,
      questions: savedQuestions
    });
  } catch (error) {
    console.error('Error saving questions:', error);
    res.status(500).json({
      message: 'Error saving questions',
      error: error.message
    });
  }
});

router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No question IDs provided' });
    }
    const result = await Question.deleteMany({ _id: { $in: ids } });
    res.json({ 
      message: 'Questions deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting questions:', error);
    res.status(500).json({ message: 'Error deleting questions', error: error.message });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert Word document to text
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const text = result.value;
    console.log('Raw text:', text); // For debugging

    // Split text into questions (using double newlines as separator)
    const questionTexts = text.split('\n\n').filter(q => q.trim());

    const questions = [];
    
    for (const questionText of questionTexts) {
      // Split into lines and trim whitespace
      const lines = questionText.split('\n').map(line => line.trim());
      
      // Initialize variables
      let content = '';
      let source = '';
      let topic = '';
      let type = '';
      let options = [];
      let correctAnswer = '';
      let inOptions = false;
      let markingScheme = '';
      
      // Process each line
      for (const line of lines) {
        // Skip empty lines
        if (!line) continue;

        // Check if this line is a question number
        const questionMatch = line.match(/^Question\s+(\d+)/);
        if (questionMatch) {
          // If we already have content, save the previous question
          if (content) {
      const question = new Question({
              content: content.trim(),
              source: source,
              topic: topic,
        type: type,
              options: options,
              correctAnswer: correctAnswer,
              markingScheme: markingScheme
      });
      await question.save();
      questions.push(question);
          }
          
          // Reset for new question
          content = '';
          source = '';
          topic = '';
          type = '';
          options = [];
          correctAnswer = '';
          inOptions = false;
          markingScheme = '';
          continue;
        }

        // Process metadata fields first
        if (line.startsWith('Source:')) {
          source = line.replace('Source:', '').trim();
        } else if (line.startsWith('Topic:')) {
          topic = line.replace('Topic:', '').trim();
        } else if (line.startsWith('Type:')) {
          const typeValue = line.replace('Type:', '').trim().toLowerCase();
          // Map 'conventional' to 'SQ' (Short Question)
          type = typeValue === 'conventional' ? 'SQ' : typeValue;
          if (type === 'MC') {
            inOptions = true;
          }
          continue; // Skip adding this line to content
        } else if (line.startsWith('Correct Answer:')) {
          correctAnswer = line.replace('Correct Answer:', '').trim();
          if (type === 'MC') {
            correctAnswer = correctAnswer.toLowerCase();
          }
          // After correct answer, save the question
          const question = new Question({
            content: content.trim(),
            source: source,
            topic: topic,
            type: type,
            options: options,
            correctAnswer: correctAnswer,
            markingScheme: markingScheme
          });
          await question.save();
          questions.push(question);
          // Reset for next question
          content = '';
          source = '';
          topic = '';
          type = '';
          options = [];
          correctAnswer = '';
          inOptions = false;
          markingScheme = '';
          continue; // Skip adding this line to content
        } else if (inOptions && line.match(/^\([a-zA-Z]\)/)) {
          // For MC questions, collect options
          const match = line.match(/^\((.*?)\)\s*(.*)/);
          if (match) {
            options.push({
              letter: match[1],
              text: match[2].trim()
            });
          }
          continue; // Skip adding option lines to content
        } else if (line.startsWith('Marking Scheme:')) {
          markingScheme = line.replace('Marking Scheme:', '').trim();
          continue;
        }

        // If we get here, it's a content line
        if (content) content += '\n';
        content += line;
      }

      // Save the last question if we have content
      if (content) {
        const question = new Question({
          content: content.trim(),
          source: source,
          topic: topic,
          type: type,
          options: options,
          correctAnswer: correctAnswer,
          markingScheme: markingScheme
        });
        await question.save();
        questions.push(question);
      }
    }

    res.status(200).json({
      message: 'Questions uploaded successfully',
      count: questions.length,
      questions: questions
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({
      message: 'Error processing file',
      error: error.message
    });
  }
});

router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Get module from form data
    const { module } = req.body;
    
    if (!module) {
      return res.status(400).json({ message: 'Module selection is required' });
    }

    // Convert Word document to text
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const text = result.value;
    console.log('--- RAW EXTRACTED TEXT ---');
    console.log(text);
    console.log('--------------------------');

    // Split into lines and log each line for debugging
    const lines = text.split(/\r?\n/).map(line => line.trim());
    console.log('--- PARSED LINES ---');
    lines.forEach((line, i) => console.log(`${i}: ${line}`));
    console.log('-------------------');
    
    const questions = [];
    let currentQuestion = null;
    let collectingContent = false;
    let contentLines = [];
    let collectingMarkingScheme = false;
    let markingSchemeLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`Processing line ${i}: "${line}"`);
      
      // Start a new question when 'Question' is found
      if (line.startsWith('Question')) {
        console.log('Found new question:', line);
        if (currentQuestion) {
          // Save previous question's content and marking scheme
          if (collectingContent) {
            currentQuestion.content = contentLines
              .filter(line => line.trim())
              .join('\n')
              .trim();
          }
          if (collectingMarkingScheme) {
            console.log('Saving marking scheme for previous question:', markingSchemeLines);
            currentQuestion.markingScheme = markingSchemeLines
              .filter(line => line.trim())
              .join('\n')
              .trim();
          }
          questions.push(currentQuestion);
        }
        
        // Start new question
        currentQuestion = {
          questionNumber: line.replace('Question', '').trim(),
          content: '',
          source: '',
          topic: '',
          type: '',
          year: '',     // Add year
          school: '',   // Add school
          textbook: '', // Add textbook
          options: [],
          correctAnswer: '',
          preview: {
            formattedContent: '',
            formattedOptions: []
          },
          markingScheme: '',
          module: module // Set the module from the form data
        };
        // Reset content collection for new question
        collectingContent = true;
        contentLines = [];
        collectingMarkingScheme = false;
        markingSchemeLines = [];
        console.log('Started collecting content for new question');
        continue;
      }

      // Skip lines before first question
      if (!currentQuestion) continue;

      // Handle marking scheme
      if (line.startsWith('Marking Scheme:')) {
        console.log('Found marking scheme start:', line);
        // Save any collected content before starting marking scheme
        if (collectingContent) {
          console.log('Saving content before marking scheme:', contentLines);
          currentQuestion.content = contentLines
            .filter(line => line.trim())
            .join('\n')
            .trim();
          collectingContent = false;
        }
        collectingMarkingScheme = true;
        markingSchemeLines = [line.replace('Marking Scheme:', '').trim()];
        continue;
      }

      // Handle metadata fields
      if (line.startsWith('Source:') || line.startsWith('Topic:') || line.startsWith('Type:') || 
          line.startsWith('Correct Answer:') || line.startsWith('Year:') || 
          line.startsWith('School:') || line.startsWith('Textbook:')) {
        // Save any collected content before metadata
        if (collectingContent) {
          console.log('Saving content before metadata:', contentLines);
          currentQuestion.content = contentLines
            .filter(line => line.trim())
            .join('\n')
            .trim();
          collectingContent = false;
        }
        // Handle marking scheme if we were collecting it
        if (collectingMarkingScheme) {
          console.log('Found metadata while collecting marking scheme');
          currentQuestion.markingScheme = markingSchemeLines
            .filter(line => line.trim())
            .join('\n')
            .trim();
          collectingMarkingScheme = false;
          markingSchemeLines = [];
        }
        // Process metadata as usual
        if (line.startsWith('Source:')) {
          currentQuestion.source = line.replace('Source:', '').trim();
        } else if (line.startsWith('Topic:')) {
          currentQuestion.topic = line.replace('Topic:', '').trim();
        } else if (line.startsWith('Type:')) {
          currentQuestion.type = line.replace('Type:', '').trim();
        } else if (line.startsWith('Year:')) {
          currentQuestion.year = line.replace('Year:', '').trim();
        } else if (line.startsWith('School:')) {
          currentQuestion.school = line.replace('School:', '').trim();
        } else if (line.startsWith('Textbook:')) {
          currentQuestion.textbook = line.replace('Textbook:', '').trim();
        } else if (line.startsWith('Correct Answer:')) {
          const answer = line.replace('Correct Answer:', '').trim();
          if (currentQuestion.type === 'MC') {
            currentQuestion.correctAnswer = answer.toLowerCase().charCodeAt(0) - 97;
            currentQuestion.preview.correctAnswerLabel = answer.toLowerCase();
          } else {
            currentQuestion.correctAnswer = answer;
            currentQuestion.preview.correctAnswerLabel = answer;
          }
        }
        continue;
      }

      // Handle MC options
      if (line.match(/^\([a-zA-Z]\)/)) {
        console.log('Found MC option:', line);
        // Only set type to MC if not already set
        if (!currentQuestion.type || currentQuestion.type.toLowerCase() !== 'conventional') {
          currentQuestion.type = 'MC';
        }
        // Collect all options until a non-option or end
        let optIdx = i;
        const formattedOptions = [];
        currentQuestion.options = [];
        let foundOption = false;
        
        while (optIdx < lines.length) {
          const optLine = lines[optIdx];
          if (!optLine) { // skip blank lines
            optIdx++;
            continue;
          }
          const match = optLine.match(/^\((.*?)\)\s*(.*)/);
          if (match) {
            console.log('Processing MC option:', optLine);
            foundOption = true;
            const optionLabel = match[1].trim();
            const optionText = match[2].trim();
            currentQuestion.options.push(optionText);
            formattedOptions.push({ label: optionLabel, text: optionText });
            optIdx++;
          } else {
            break; // stop if not an option line
          }
        }
        
        if (foundOption) {
          console.log('Collected MC options:', formattedOptions);
          currentQuestion.preview.formattedOptions = formattedOptions;
          i = optIdx - 1; // Update the main loop index
        }
        continue;
      }

      // Collect content if we're not collecting marking scheme
      if (collectingContent && !collectingMarkingScheme) {
        console.log('Collecting content line:', line);
        contentLines.push(line);
      }

      // Collect marking scheme if we're in marking scheme mode
      if (collectingMarkingScheme) {
        console.log('Collecting marking scheme line:', line);
        markingSchemeLines.push(line);
      }
    }

    // Handle the last question
    if (currentQuestion) {
      if (collectingMarkingScheme) {
        console.log('Saving marking scheme for last question:', markingSchemeLines);
        currentQuestion.markingScheme = markingSchemeLines
          .filter(line => line.trim())
          .join('\n')
          .trim();
      }
      questions.push(currentQuestion);
    }

    console.log('--- FINAL PARSED QUESTIONS ---');
    questions.forEach((q, i) => {
      console.log(`Question ${i + 1}:`);
      console.log('Content:', q.content);
      console.log('Marking Scheme:', q.markingScheme);
    });
    console.log('----------------------------');

    res.status(200).json({
      message: 'Document parsed successfully',
      questions: questions.map(q => ({
        ...q,
        displayText: `Question ${q.questionNumber}\n\n${q.content}\n\n${q.preview.formattedOptions.map(opt => `(${opt.label}) ${opt.text}`).join('\n')}\n\nCorrect Answer: ${q.preview.correctAnswerLabel}`
      }))
    });
  } catch (error) {
    console.error('Error parsing file:', error);
    res.status(500).json({
      message: 'Error parsing file',
      error: error.message
    });
  }
});

router.post('/export', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No question IDs provided' });
    }
    const questions = await Question.find({ _id: { $in: ids } });
    res.json(questions);
  } catch (error) {
    console.error('Error exporting questions:', error);
    res.status(500).json({ message: 'Error exporting questions', error: error.message });
  }
});

router.post('/export-word', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No question IDs provided' });
    }
    const questions = await Question.find({ _id: { $in: ids } });
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
    const doc = new Document({
      sections: [
        {
        properties: {},
        children: [
          new Paragraph({
              text: 'Math Worksheet',
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
          }),
            ...questions.map((q, idx) => {
              const children = [
          new Paragraph({
                  text: `${idx + 1}. ${q.content.replace(/\n/g, ' ')}`,
                  spacing: { after: 200 },
                  style: 'questionText',
                })
              ];
              if (q.type === 'MC' && Array.isArray(q.options) && q.options.length > 0) {
                q.options.forEach((opt, i) => {
                  children.push(
          new Paragraph({
                      text: `   (${String.fromCharCode(97 + i)}) ${opt}`,
                      spacing: { after: 100 },
                    })
                  );
                });
                // Add space for answer
                children.push(new Paragraph({ text: 'Answer: __________', spacing: { after: 300 } }));
              } else {
                // For SQ/LQ, add blank lines for answer
                for (let i = 0; i < 3; i++) {
                  children.push(new Paragraph({ text: ' ', spacing: { after: 200 } }));
                }
              }
              return children;
            }).flat()
          ]
        }
      ]
    });
    const buffer = await require('docx').Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename=math_questions.docx');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting questions as Word:', error);
    res.status(500).json({ message: 'Error exporting questions as Word', error: error.message });
  }
});

router.get('/filter-options', async (req, res) => {
  try {
    // Use aggregation to get unique values for each filter field
    const sources = await Question.distinct('source');
    const types = await Question.distinct('type');
    const topics = await Question.distinct('topic');
    const years = await Question.distinct('year');
    const schools = await Question.distinct('school');
    const textbooks = await Question.distinct('textbook');

    res.json({
      sources,
      types,
      topics,
      years: years.filter(year => year), // Remove empty values
      schools: schools.filter(school => school),
      textbooks: textbooks.filter(textbook => textbook)
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ message: 'Error fetching filter options', error: error.message });
  }
});

// ID-based routes last
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ message: 'Error fetching question', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModifiedBy: 'system' },
      { new: true, runValidators: true }
    );
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(400).json({ message: 'Error updating question', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

// Replace the upload-image route with this fixed version
router.post('/upload-image', imageUpload.single('upload'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        uploaded: 0,
        error: {
          message: 'No image uploaded'
        }
      });
    }

    // Generate URL for the image
    const baseUrl = req.protocol + '://' + req.get('host');
    const imageUrl = baseUrl + '/uploads/' + req.file.filename;
    
    // Return response in CKEditor format
    res.status(200).json({
      uploaded: 1,
      fileName: req.file.filename,
      url: imageUrl
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      uploaded: 0,
      error: {
        message: error.message
      }
    });
  }
});

module.exports = router; 