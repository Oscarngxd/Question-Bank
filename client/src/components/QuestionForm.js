import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Alert,
  Snackbar,
  Container,
  Tooltip,
  useTheme,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';
import './editor.css'; // Import CSS for editor styling
import ReactDOM from 'react-dom';

const MODULES = [
  { id: 'compulsory', name: 'Compulsory Part', description: 'Core mathematics topics' },
  { id: 'module1', name: 'Module 1 (Calculus & Statistics)', description: 'Extended topics in applied mathematics' },
  { id: 'module2', name: 'Module 2 (Algebra & Calculus)', description: 'Advanced topics in pure mathematics' }
];

// Sample data for years, schools, and textbooks - these should come from the database in a real implementation
const YEARS = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'];
const SCHOOLS = ['School A', 'School B', 'School C', 'School D', 'School E'];
const TEXTBOOKS = ['Textbook A', 'Textbook B', 'Textbook C', 'Mathematics Extended Part Module 1', 'Mathematics Extended Part Module 2'];

function renderWithMath(html) {
  if (!html) return [];

  // Create a wrapper to hold the HTML for processing
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // Improved RegEx patterns for LaTeX
  // Note: We're using more comprehensive patterns to catch LaTeX with special characters
  const blockRegex = /\$\$([\s\S]+?)\$\$/g; // Using [\s\S] to match across lines
  const inlineRegex = /\$([^$\n]+?)\$/g;   // Match anything except $ and newline for inline math

  // Function to process a DOM node and replace math expressions with React components
  const processNode = (node, key = 0) => {
    // Array to store the resulting React elements
    const result = [];
    
    // Process all child nodes
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      
      // Text node - check for math expressions
      if (child.nodeType === Node.TEXT_NODE) {
        let text = child.textContent;
        
        // Special handling for LaTeX patterns that might be complex
        // First try to find block math
  let lastIndex = 0;
  let match;
        let segments = [];
        
        // Reset the regex before we use it
        blockRegex.lastIndex = 0;
        
        // Process block math expressions
        while ((match = blockRegex.exec(text)) !== null) {
          // Add text before the math expression
    if (match.index > lastIndex) {
            segments.push({
              type: 'text',
              content: text.slice(lastIndex, match.index)
            });
          }
          // Add the math component
          segments.push({
            type: 'blockMath',
            content: match[1]
          });
    lastIndex = blockRegex.lastIndex;
  }
        
        // Process remaining text for inline math expressions
        if (lastIndex < text.length) {
          let remainingText = text.slice(lastIndex);
          lastIndex = 0;
          
          // Reset the regex before we use it
          inlineRegex.lastIndex = 0;
          
          // Process inline math expressions
          while ((match = inlineRegex.exec(remainingText)) !== null) {
            if (match.index > lastIndex) {
              segments.push({
                type: 'text',
                content: remainingText.slice(lastIndex, match.index)
              });
            }
            segments.push({
              type: 'inlineMath',
              content: match[1]
            });
            lastIndex = inlineRegex.lastIndex;
          }
          
          // Add remaining text
          if (lastIndex < remainingText.length) {
            segments.push({
              type: 'text',
              content: remainingText.slice(lastIndex)
            });
          }
        }
        
        // Now render each segment
        segments.forEach((segment, index) => {
          if (segment.type === 'text') {
            result.push(segment.content);
          } else if (segment.type === 'blockMath') {
            try {
              result.push(<BlockMath key={`block-${key++}`}>{segment.content}</BlockMath>);
            } catch (error) {
              console.error('Error rendering block math:', error);
              result.push(`$$${segment.content}$$`);
            }
          } else if (segment.type === 'inlineMath') {
            try {
              result.push(<InlineMath key={`inline-${key++}`}>{segment.content}</InlineMath>);
            } catch (error) {
              console.error('Error rendering inline math:', error);
              result.push(`$${segment.content}$`);
            }
          }
        });
      }
      // Handle HTML elements
      else if (child.nodeType === Node.ELEMENT_NODE) {
        // Clone the element to manipulate it
        const clone = child.cloneNode(false);
        
        // Process the child's children recursively
        const children = processNode(child, key + 100);
        
        // Create a React element with the same tag and attributes
        const props = { key: `el-${key++}` };
        
        // Copy attributes
        Array.from(clone.attributes).forEach(attr => {
          // Handle special attributes
          if (attr.name === 'class') {
            props.className = attr.value;
          } 
          else if (attr.name === 'style') {
            // Convert style string to React style object
            const styleObj = {};
            const styleStr = attr.value;
            
            // Parse the style string into an object
            styleStr.split(';').forEach(style => {
              if (style.trim()) {
                const [property, value] = style.split(':');
                if (property && value) {
                  // Convert kebab-case to camelCase
                  const camelProperty = property.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                  styleObj[camelProperty] = value.trim();
                }
              }
            });
            
            props.style = styleObj;
          }
          else {
            props[attr.name] = attr.value;
          }
        });
        
        // Special case for tables to ensure they render properly
        if (clone.tagName.toLowerCase() === 'table') {
          props.className = (props.className || '') + ' ck-table resizable';
          // For tables, we'll use dangerouslySetInnerHTML to preserve structure
          try {
            // Process any math inside the table separately
            const processedHtml = child.innerHTML.replace(blockRegex, (match, formula) => {
              try {
                return `<span class="math-block">$$${formula}$$</span>`;
              } catch (error) {
                return match;
              }
            }).replace(inlineRegex, (match, formula) => {
              try {
                return `<span class="math-inline">$${formula}$</span>`;
              } catch (error) {
                return match;
              }
            });
            
            result.push(
              <table {...props} dangerouslySetInnerHTML={{ __html: processedHtml }} />
            );
          } catch (error) {
            console.error('Error processing table:', error);
            result.push(
              <table {...props} dangerouslySetInnerHTML={{ __html: child.innerHTML }} />
            );
          }
        } else {
          // For other elements, create React elements normally
          const element = React.createElement(
            clone.tagName.toLowerCase(),
            props,
            ...children
          );
          result.push(element);
        }
      }
    }
    
    return result;
  };
  
  // Process the entire HTML content
  return <div className="ck-content">{processNode(wrapper)}</div>;
}

// Add debug function to help with troubleshooting
const editorDebug = (editor) => {
  // This helps identify available plugins
  console.log('Editor plugins available:', editor.plugins);
  console.log('Editor config:', editor.config);
};

// Add function to enable table column resizing
const enableTableResizing = (editorElement) => {
  if (!editorElement) return;
  
  // Store column widths for each table
  const tableColumnWidths = new WeakMap();
  
  // Function to save column widths
  const saveTableColumnWidths = (table) => {
    const cells = table.querySelectorAll('th, td');
    const widths = [];
    
    // Group cells by column index
    const columnWidths = {};
    cells.forEach(cell => {
      const columnIndex = cell.cellIndex;
      if (cell.style.width) {
        columnWidths[columnIndex] = cell.style.width;
      }
    });
    
    tableColumnWidths.set(table, columnWidths);
  };
  
  // Function to restore column widths
  const restoreTableColumnWidths = (table) => {
    if (!tableColumnWidths.has(table)) return;
    
    const widths = tableColumnWidths.get(table);
    const rows = table.rows;
    
    // Apply saved widths to all cells in each column
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const cells = rows[rowIndex].cells;
      for (let colIndex = 0; colIndex < cells.length; colIndex++) {
        if (widths[colIndex]) {
          cells[colIndex].style.width = widths[colIndex];
        }
      }
    }
  };
  
  // Find all tables in the editor and add the resizable class
  const tables = editorElement.querySelectorAll('table');
  tables.forEach(table => {
    table.classList.add('resizable');
    // Restore widths if we have them saved
    restoreTableColumnWidths(table);
  });

  // Add event listeners for resizing
  let isResizing = false;
  let currentTd;
  let startX, startWidth;
  
  // Listen for mousedown events on table cells
  editorElement.addEventListener('mousedown', (e) => {
    // Check if we're clicking near the right edge of a cell
    const td = e.target.closest('td, th');
    if (!td) return;
    
    const rect = td.getBoundingClientRect();
    const rightEdge = rect.right - e.clientX < 10;
    
    if (rightEdge) {
      isResizing = true;
      currentTd = td;
      startX = e.clientX;
      startWidth = rect.width;
      
      // Prevent text selection during resize
      e.preventDefault();
    }
  });
  
  // Handle mousemove for resizing
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const width = startWidth + (e.clientX - startX);
    if (width > 30) { // Minimum width
      currentTd.style.width = `${width}px`;
    }
  });
  
  // End resizing on mouseup
  document.addEventListener('mouseup', () => {
    if (isResizing && currentTd) {
      const table = currentTd.closest('table');
      if (table) {
        saveTableColumnWidths(table);
      }
    }
    isResizing = false;
    currentTd = null;
  });
  
  // Set up observer to monitor tables being redrawn
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        // For any new tables or modified tables
        const affectedTables = [];
        
        // Check for directly added tables
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'TABLE') {
            affectedTables.push(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Check for tables inside added elements
            node.querySelectorAll('table').forEach(table => {
              affectedTables.push(table);
            });
          }
        });
        
        // Handle tables that were modified but not directly added
        if (mutation.target.nodeName === 'TABLE') {
          affectedTables.push(mutation.target);
        } else if (mutation.target.nodeType === Node.ELEMENT_NODE) {
          // Check if the modification happened within a table
          const closestTable = mutation.target.closest('table');
          if (closestTable) {
            affectedTables.push(closestTable);
          }
        }
        
        // Restore column widths and ensure tables are resizable
        affectedTables.forEach(table => {
          if (!table.classList.contains('resizable')) {
            table.classList.add('resizable');
          }
          restoreTableColumnWidths(table);
        });
      }
    });
  });
  
  // Observe changes to the editor content
  observer.observe(editorElement, { childList: true, subtree: true });
  
  console.log('Enhanced table resizing enabled for', tables.length, 'tables');
};

// Function to enable table resizing for preview tables
const enablePreviewTableResizing = () => {
  // Enable resizing for all tables in the preview sections
  const previewDivs = document.querySelectorAll('.ck-content');
  previewDivs.forEach(div => {
    enableTableResizing(div);
  });
  
  // Set up an observer to handle new preview tables
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        const tables = mutation.target.querySelectorAll('table:not(.resizable)');
        tables.forEach(table => {
          table.classList.add('resizable', 'ck-table');
        });
        
        // Find math placeholders and process them
        renderMathInElement(mutation.target);
      }
    });
  });
  
  // Observe changes to preview areas
  previewDivs.forEach(div => {
    observer.observe(div, { childList: true, subtree: true });
    
    // Initial rendering of math in the preview
    renderMathInElement(div);
  });
};

// Helper function to manually render math elements
const renderMathInElement = (element) => {
  if (!element) return;
  
  // Process any math blocks
  const mathBlocks = element.querySelectorAll('.math-block');
  mathBlocks.forEach(block => {
    try {
      const formula = block.textContent;
      if (formula && formula.startsWith('$$') && formula.endsWith('$$')) {
        const cleanFormula = formula.slice(2, -2); // Remove $$ markers
        ReactDOM.render(<BlockMath>{cleanFormula}</BlockMath>, block);
      }
    } catch (error) {
      console.error('Error rendering math block:', error);
    }
  });
  
  // Process any inline math
  const mathInlines = element.querySelectorAll('.math-inline');
  mathInlines.forEach(inline => {
    try {
      const formula = inline.textContent;
      if (formula && formula.startsWith('$') && formula.endsWith('$')) {
        const cleanFormula = formula.slice(1, -1); // Remove $ markers
        ReactDOM.render(<InlineMath>{cleanFormula}</InlineMath>, inline);
      }
    } catch (error) {
      console.error('Error rendering inline math:', error);
    }
  });
  
  // Special handling for tables - we need to find any LaTeX within table cells
  const tables = element.querySelectorAll('table');
  tables.forEach(table => {
    const cells = table.querySelectorAll('td, th');
    cells.forEach(cell => {
      const html = cell.innerHTML;
      
      // Look for LaTeX patterns in the cell content
      if (html && (html.includes('$$') || html.includes('$'))) {
        try {
          // Process block math in tables
          let processedHtml = html.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
            return `<span class="katex-display"><span class="katex-math">$$${formula}$$</span></span>`;
          });
          
          // Process inline math in tables
          processedHtml = processedHtml.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
            return `<span class="katex-inline"><span class="katex-math">$${formula}$</span></span>`;
          });
          
          if (html !== processedHtml) {
            cell.innerHTML = processedHtml;
            
            // Now find and render the math placeholders
            const katexElements = cell.querySelectorAll('.katex-math');
            katexElements.forEach(katexEl => {
              const content = katexEl.textContent;
              if (content.startsWith('$$') && content.endsWith('$$')) {
                try {
                  const cleanFormula = content.slice(2, -2);
                  ReactDOM.render(<BlockMath>{cleanFormula}</BlockMath>, katexEl.parentElement);
                } catch (error) {
                  console.error('Error rendering block math in table:', error);
                }
              } else if (content.startsWith('$') && content.endsWith('$')) {
                try {
                  const cleanFormula = content.slice(1, -1);
                  ReactDOM.render(<InlineMath>{cleanFormula}</InlineMath>, katexEl.parentElement);
                } catch (error) {
                  console.error('Error rendering inline math in table:', error);
                }
              }
            });
          }
        } catch (error) {
          console.error('Error processing LaTeX in table cell:', error);
        }
      }
    });
  });
};

const QuestionForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLatexMode, setIsLatexMode] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionId, setQuestionId] = useState(null);
  
  const [question, setQuestion] = useState({
    content: '',
    source: '',
    topic: '',
    type: '',
    options: ['', '', ''],
    correctAnswer: '',
    markingScheme: '',
    module: '',
    year: '',         // Added for year
    school: '',       // Added for school
    textbook: '',     // Added for textbook
  });

  const [latexError, setLatexError] = useState(null);

  const QUESTION_TYPES = ['Conventional', 'MC'];
  const steps = ['Module Selection', 'Question Details', 'Type & Category', 'Options & Answer'];

  // Add state for filter options
  const [filterOptions, setFilterOptions] = useState({
    sources: [],
    types: [],
    topics: [],
    years: [],
    schools: [],
    textbooks: []
  });

  // Add state for tracking marking scheme editor initialization
  const [markingSchemeEditor, setMarkingSchemeEditor] = useState(null);
  
  // Refs for the toolbar containers
  const markingSchemeToolbarRef = useRef(null);
  const markingSchemeEditorInstance = useRef(null);

  // Check if we're editing an existing question
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    
    if (id) {
      setIsEditing(true);
      setQuestionId(id);
      fetchQuestion(id);
    }
  }, [location.search]);

  // Fetch the question data for editing
  const fetchQuestion = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/${id}`);
      const questionData = response.data;
      
      // Convert options array format if needed
      const formattedOptions = Array.isArray(questionData.options) 
        ? questionData.options 
        : [];
      
      setQuestion({
        ...questionData,
        options: formattedOptions.length > 0 ? formattedOptions : ['', '', '']
      });
      
      // Move past the module selection step for editing
      setActiveStep(1);
      
      setSnackbar({
        open: true,
        message: 'Question loaded for editing',
        severity: 'info'
      });
    } catch (error) {
      console.error('Error fetching question:', error);
      setSnackbar({
        open: true,
        message: 'Error loading question. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch filter options when component mounts
    fetchFilterOptions();
  }, []);

  // Fetch filter options from the server
  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/filter-options`);
      setFilterOptions(response.data);
    } catch (err) {
      console.error('Error fetching filter options:', err);
      setSnackbar({
        open: true,
        message: 'Failed to load filter options',
        severity: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Update existing question
        await axios.put(`${API_BASE_URL}/questions/${questionId}`, question);
        setSnackbar({
          open: true,
          message: 'Question updated successfully!',
          severity: 'success',
        });
      } else {
        // Create new question
        await axios.post(`${API_BASE_URL}/questions`, question);
      setSnackbar({
        open: true,
        message: 'Question added successfully!',
        severity: 'success',
      });
      }
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error ${isEditing ? 'updating' : 'adding'} question. Please try again.`,
        severity: 'error',
      });
    }
  };

  const handleLatexPreview = (text) => {
    try {
      // Split the text by $$ for display math and $ for inline math
      const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);
      return (
        <Box>
          {parts.map((part, index) => {
            if (part.startsWith('$$') && part.endsWith('$$')) {
              // Display math
              const math = part.slice(2, -2);
              return <BlockMath key={index} math={math} />;
            } else if (part.startsWith('$') && part.endsWith('$')) {
              // Inline math
              const math = part.slice(1, -1);
              return <InlineMath key={index} math={math} />;
            } else {
              // Regular text
              return <Typography key={index} component="span">{part}</Typography>;
            }
          })}
        </Box>
      );
    } catch (error) {
      setLatexError('Invalid LaTeX syntax');
      return <Typography color="error">Error rendering LaTeX</Typography>;
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setQuestion({ ...question, content: newContent });
    setLatexError(null);
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion({ ...question, options: newOptions });
  };

  const addOption = () => {
    setQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ''],
    }));
  };

  const removeOption = (indexToRemove) => {
    setQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, index) => index !== indexToRemove),
      correctAnswer: prev.correctAnswer === indexToRemove ? '' : prev.correctAnswer,
    }));
  };

  // Helper function to determine source type
  const getSourceType = () => {
    if (['HKDSE', 'HKCEE', 'HKALE'].includes(question.source)) {
      return 'exam';
    } else if (['School Exam', 'School Mock'].includes(question.source)) {
      return 'school';
    } else if (question.source === 'Textbook') {
      return 'textbook';
    }
    return '';
  };

  // Update isStepComplete to check source-specific fields
  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return question.module !== '';
      case 1:
        return question.content.trim() !== '';
      case 2: {
        const sourceType = getSourceType();
        const baseFieldsComplete = question.source !== '' && question.topic !== '' && question.type !== '';
        
        if (sourceType === 'exam') {
          return baseFieldsComplete && question.year !== '';
        } else if (sourceType === 'school') {
          return baseFieldsComplete && question.school !== '' && question.year !== '';
        } else if (sourceType === 'textbook') {
          return baseFieldsComplete && question.textbook !== '';
        }
        return baseFieldsComplete;
      }
      case 3:
        return question.type !== 'MC' || 
          (question.options.every(opt => opt.trim() !== '') && question.correctAnswer !== '');
      default:
        return false;
    }
  };

  // Replace the useEffect for attaching the toolbar
  useEffect(() => {
    // Only run when activeStep is 1 (question details) and the editor is available
    if (activeStep === 1 && markingSchemeEditor && markingSchemeToolbarRef.current) {
      try {
        // Wait a brief moment to ensure editor is fully initialized
        setTimeout(() => {
          if (markingSchemeToolbarRef.current && markingSchemeEditor.ui && markingSchemeEditor.ui.view) {
            // Clear existing content
            while (markingSchemeToolbarRef.current.firstChild) {
              markingSchemeToolbarRef.current.removeChild(markingSchemeToolbarRef.current.firstChild);
            }
            
            // Attach toolbar
            markingSchemeToolbarRef.current.appendChild(markingSchemeEditor.ui.view.toolbar.element);
            console.log('Toolbar attached successfully');
          }
        }, 100); // Small delay to ensure editor is fully ready
      } catch (error) {
        console.error('Error attaching toolbar:', error);
      }
    }
  }, [activeStep, markingSchemeEditor]);

  // Enable table resizing in preview sections
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      enablePreviewTableResizing();
      
      // Directly process math in preview areas
      const previewElements = document.querySelectorAll('.ck-content');
      previewElements.forEach(renderMathInElement);
      
      // Special handling for marking scheme preview
      const markingSchemePreview = document.querySelector('.ck-content');
      if (markingSchemePreview && question.markingScheme) {
        renderMathInElement(markingSchemePreview);
      }
    }, 300); // Reduced delay to ensure quick rendering
    
    return () => clearTimeout(timeoutId);
  }, [question.content, question.markingScheme]); // Re-run when content changes

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton 
            onClick={() => navigate('/')} 
            sx={{ mr: 2 }}
            color={theme.palette.mode === 'dark' ? 'inherit' : 'default'}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" color="text.primary">
            {isEditing ? 'Edit Question' : 'Add New Question'}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-label': {
              color: theme.palette.mode === 'dark' ? 'text.primary' : 'inherit',
            },
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={handleSubmit}>
          {activeStep === 0 && (
            <>
                  <Typography variant="h6" gutterBottom>
                    Select Module
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose the module that this question belongs to:
                  </Typography>
                  <FormControl fullWidth required>
                    <InputLabel>Module</InputLabel>
                    <Select
                      value={question.module}
                      label="Module"
                      onChange={(e) => setQuestion({ ...question, module: e.target.value })}
                    >
                      {MODULES.map((module) => (
                        <MenuItem key={module.id} value={module.id}>
                          <Box>
                            <Typography>{module.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {module.description}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}

              {activeStep === 1 && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Question Content
                </Typography>
                <div className="document-editor">
                  <div className="document-editor__toolbar"></div>
                  <div className="document-editor__editable-container">
                    <CKEditor
                      editor={DecoupledEditor}
                      data={question.content}
                      config={{
                        licenseKey: 'GPL',
                        ckfinder: {
                          uploadUrl: `${API_BASE_URL}/questions/upload-image`
                        },
                        toolbar: [
                          'heading', '|', 'bold', 'italic', 'link', '|',
                          'bulletedList', 'numberedList', '|',
                          'blockQuote', 'insertTable', 'imageUpload', '|',
                          'undo', 'redo'
                        ],
                        image: {
                          // Added image editing button
                          toolbar: [
                            'imageTextAlternative', '|',
                            'imageStyle:inline', '|', // Inline images
                            'imageStyle:alignLeft', // Wrapped text
                            'imageStyle:alignRight', '|', // Wrapped text
                            'imageStyle:blockLeft', // Block image alignment
                            'imageStyle:alignCenter', // Block image alignment (centered)
                            'imageStyle:blockRight', '|', // Block image alignment
                            'resizeImage', '|',
                            'imageUpload', 'toggleImageCaption', 'imageEdit'
                          ],
                          
                          // Enable image resizing with dropdown options
                          resizeOptions: [
                            {
                              name: 'resizeImage:original',
                              label: 'Original',
                              value: null
                            },
                            {
                              name: 'resizeImage:50',
                              label: '50%',
                              value: '50'
                            },
                            {
                              name: 'resizeImage:75',
                              label: '75%',
                              value: '75'
                            }
                          ],
                          resizeUnit: '%'
                        },
                        table: {
                          contentToolbar: [
                            'tableColumn', 'tableRow', 'mergeTableCells'
                          ],
                          // Remove unavailable options
                          defaultProperties: {
                            // Make sure tables have borders visible by default
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            borderColor: '#c4c4c4',
                            // Add some minimal padding for better UX
                            padding: '5px'
                          }
                        }
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        console.log('CKEditor content changed:', data);
                        setQuestion(prev => ({ ...prev, content: data }));
                      }}
                      onReady={editor => {
                        console.log('CKEditor is ready to use!');
                        
                        // Debug available plugins
                        editorDebug(editor);
                        
                        // The DecoupledEditor requires attaching the toolbar manually
                        const toolbarContainer = document.querySelector('.document-editor__toolbar');
                        if (toolbarContainer) {
                          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
                        } else {
                          // If toolbar container doesn't exist, append it to the editor
                          const editorElement = document.querySelector('.ck-editor__editable');
                          if (editorElement && editorElement.parentElement) {
                            const toolbarDiv = document.createElement('div');
                            toolbarDiv.className = 'document-editor__toolbar';
                            editorElement.parentElement.insertBefore(toolbarDiv, editorElement);
                            toolbarDiv.appendChild(editor.ui.view.toolbar.element);
                          }
                        }
                        
                        // Log editor instance to console for debugging
                        console.log('CKEditor instance:', editor);
                        
                        // Add a listener for image upload
                        editor.plugins.get('FileRepository').on('uploadComplete', (evt, { data, imageElement }) => {
                          console.log('Image upload complete:', data);
                          console.log('Image element:', imageElement);
                          console.log('Image URL:', data.url);
                        });
                        
                        // Enable custom table column resizing
                        const editorElement = document.querySelector('.document-editor__editable-container .ck-editor__editable');
                        if (editorElement) {
                          // Use MutationObserver to detect when tables are added
                          const observer = new MutationObserver(() => {
                            enableTableResizing(editorElement);
                          });
                          observer.observe(editorElement, { childList: true, subtree: true });
                          
                          // Also enable for existing tables
                          enableTableResizing(editorElement);
                        }
                      }}
                    />
                  </div>
                </div>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Preview:
                </Typography>
                <Paper elevation={1} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${theme.palette.divider}` }}>
                  {renderWithMath(question.content || '')}
                </Paper>
              </Box>

              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Marking Scheme
                </Typography>
                <div className="document-editor marking-scheme-editor">
                  <div className="document-editor__toolbar marking-scheme-toolbar" ref={markingSchemeToolbarRef}></div>
                  <div className="document-editor__editable-container">
                    <CKEditor
                      editor={DecoupledEditor}
                      data={question.markingScheme}
                      config={{
                        licenseKey: 'GPL',
                        ckfinder: {
                          uploadUrl: `${API_BASE_URL}/questions/upload-image`
                        },
                        toolbar: [
                          'heading', '|', 'bold', 'italic', 'link', '|',
                          'bulletedList', 'numberedList', '|',
                          'blockQuote', 'insertTable', 'imageUpload', '|',
                          'undo', 'redo'
                        ],
                        image: {
                          toolbar: [
                            'imageTextAlternative', '|',
                            'imageStyle:inline', '|',
                            'imageStyle:alignLeft',
                            'imageStyle:alignRight', '|',
                            'imageStyle:blockLeft',
                            'imageStyle:alignCenter',
                            'imageStyle:blockRight', '|',
                            'resizeImage'
                          ],
                          resizeOptions: [
                            {
                              name: 'resizeImage:original',
                              label: 'Original',
                              value: null
                            },
                            {
                              name: 'resizeImage:50',
                              label: '50%',
                              value: '50'
                            },
                            {
                              name: 'resizeImage:75',
                              label: '75%',
                              value: '75'
                            }
                          ],
                          resizeUnit: '%'
                        },
                        table: {
                          contentToolbar: [
                            'tableColumn', 'tableRow', 'mergeTableCells'
                          ],
                          // Remove unavailable options
                          defaultProperties: {
                            // Make sure tables have borders visible by default
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            borderColor: '#c4c4c4',
                            // Add some minimal padding for better UX
                            padding: '5px'
                          }
                        }
                      }}
                      onChange={(event, editor) => {
                        const data = editor.getData();
                        setQuestion(prev => ({ ...prev, markingScheme: data }));
                      }}
                      onReady={editor => {
                        // Debug available plugins
                        editorDebug(editor);
                        
                        // Simply store the editor in state - don't try to access properties here
                        setMarkingSchemeEditor(editor);
                        console.log('Marking Scheme CKEditor instance stored in state');
                        
                        // Enable custom table column resizing
                        const editorElement = document.querySelector('.marking-scheme-editor .ck-editor__editable');
                        if (editorElement) {
                          // Use MutationObserver to detect when tables are added
                          const observer = new MutationObserver(() => {
                            enableTableResizing(editorElement);
                          });
                          observer.observe(editorElement, { childList: true, subtree: true });
                          
                          // Also enable for existing tables
                          enableTableResizing(editorElement);
                        }
                      }}
                    />
                  </div>
                </div>
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Marking Scheme Preview:
                </Typography>
                <Paper elevation={1} sx={{ p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', border: `1px solid ${theme.palette.divider}` }}>
                  <div className="ck-content">
                    {renderWithMath(question.markingScheme || '')}
                  </div>
                </Paper>
              </Box>

              {isLatexMode && (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    mt: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    LaTeX Quick Reference:
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" display="block">Fractions:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'\\frac{a}{b}'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">Square root:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'\\sqrt{x}'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">Powers:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'x^2'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">Subscripts:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'x_n'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">Greek letters:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'\\alpha, \\beta, \\pi'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" display="block">Integrals:</Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{'\\int_{a}^{b}'}</Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </>
          )}

              {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>
                  Source
                </InputLabel>
                <Select
                  value={question.source}
                  label="Source"
                      onChange={(e) => setQuestion({ 
                        ...question, 
                        source: e.target.value,
                        // Reset dependent fields when source changes
                        year: '',
                        school: '',
                        textbook: ''
                      })}
                    >
                      {filterOptions.sources.map((source) => (
                        <MenuItem key={source} value={source}>{source}</MenuItem>
                      ))}
                    </Select>
                    
                    {/* Dynamic fields based on source selection - nested inside source FormControl */}
                    <Box sx={{ mt: 2 }}>
                      {getSourceType() === 'exam' && (
                        <FormControl size="small" required sx={{ 
                          ml: 2, 
                          width: 'calc(100% - 16px)',
                          '& .MuiInputLabel-root': {
                            fontSize: '0.85rem',
                          },
                          '& .MuiSelect-select': {
                            fontSize: '0.9rem',
                          }
                        }}>
                          <InputLabel sx={{ color: theme.palette.text.secondary }}>
                            Year
                          </InputLabel>
                          <Select
                            value={question.year}
                            label="Year"
                            onChange={(e) => setQuestion({ ...question, year: e.target.value })}
                >
                            {filterOptions.years.map((year) => (
                              <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
          
                      {getSourceType() === 'school' && (
                        <>
                          <FormControl size="small" required sx={{ 
                            ml: 2, 
                            width: 'calc(100% - 16px)',
                            mb: 2,
                            '& .MuiInputLabel-root': {
                              fontSize: '0.85rem',
                            },
                            '& .MuiSelect-select': {
                              fontSize: '0.9rem',
                            }
                          }}>
                            <InputLabel sx={{ color: theme.palette.text.secondary }}>
                              School
                            </InputLabel>
                            <Select
                              value={question.school}
                              label="School"
                              onChange={(e) => setQuestion({ ...question, school: e.target.value })}
                            >
                              {filterOptions.schools.map((school) => (
                                <MenuItem key={school} value={school}>{school}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl size="small" required sx={{ 
                            ml: 2, 
                            width: 'calc(100% - 16px)',
                            '& .MuiInputLabel-root': {
                              fontSize: '0.85rem',
                            },
                            '& .MuiSelect-select': {
                              fontSize: '0.9rem',
                            }
                          }}>
                            <InputLabel sx={{ color: theme.palette.text.secondary }}>
                              Year
                            </InputLabel>
                            <Select
                              value={question.year}
                              label="Year"
                              onChange={(e) => setQuestion({ ...question, year: e.target.value })}
                            >
                              {filterOptions.years.map((year) => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </>
                      )}
          
                      {getSourceType() === 'textbook' && (
                        <FormControl size="small" required sx={{ 
                          ml: 2, 
                          width: 'calc(100% - 16px)',
                          '& .MuiInputLabel-root': {
                            fontSize: '0.85rem',
                          },
                          '& .MuiSelect-select': {
                            fontSize: '0.9rem',
                          }
                        }}>
                          <InputLabel sx={{ color: theme.palette.text.secondary }}>
                            Textbook
                          </InputLabel>
                          <Select
                            value={question.textbook}
                            label="Textbook"
                            onChange={(e) => setQuestion({ ...question, textbook: e.target.value })}
                          >
                            {filterOptions.textbooks.map((book) => (
                              <MenuItem key={book} value={book}>{book}</MenuItem>
                  ))}
                </Select>
              </FormControl>
                      )}
                    </Box>
                  </FormControl>

              <FormControl fullWidth required>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>
                  Topic
                </InputLabel>
                <Select
                  value={question.topic}
                  label="Topic"
                  onChange={(e) => setQuestion({ ...question, topic: e.target.value })}
                >
                      {filterOptions.topics.map((topic) => (
                    <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>
                  Question Type
                </InputLabel>
                <Select
                  value={question.type}
                  label="Question Type"
                  onChange={(e) => setQuestion({ ...question, type: e.target.value })}
                >
                  {QUESTION_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

              {activeStep === 3 && question.type === 'MC' && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" color="text.primary">
                  Options {isLatexMode && '(LaTeX enabled)'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isLatexMode}
                        onChange={(e) => setIsLatexMode(e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label="LaTeX"
                  />
                  <Tooltip title="Add Option">
                    <IconButton 
                      onClick={addOption} 
                      color="primary" 
                      disabled={question.options.length >= 6}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              {question.options.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Option ${String.fromCharCode(65 + index)}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                      sx={{
                        '& .MuiInputBase-input': {
                          color: theme.palette.text.primary,
                          fontFamily: isLatexMode ? 'monospace' : 'inherit',
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.text.secondary,
                        },
                      }}
                    />
                    {question.options.length > 2 && (
                      <Tooltip title="Remove Option">
                        <IconButton onClick={() => removeOption(index)} color="error">
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                  {isLatexMode && option && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 1,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Preview:
                      </Typography>
                      <Box sx={{ pl: 1 }}>
                        {handleLatexPreview(option)}
                      </Box>
                    </Paper>
                  )}
                </Box>
              ))}

              <FormControl fullWidth required sx={{ mt: 2 }}>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>
                  Correct Answer
                </InputLabel>
                <Select
                  value={question.correctAnswer}
                  label="Correct Answer"
                  onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })}
                >
                  {question.options.map((option, index) => (
                    <MenuItem key={index} value={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>Option {String.fromCharCode(65 + index)}:</Typography>
                        {isLatexMode ? (
                          <Box sx={{ display: 'inline-block' }}>
                            <InlineMath math={option || ' '} />
                          </Box>
                        ) : (
                          <Typography>{option}</Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
              sx={{
                color: theme.palette.mode === 'dark' ? 'text.primary' : undefined,
              }}
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isStepComplete(activeStep)}
              >
                Submit Question
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isStepComplete(activeStep)}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
          </>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuestionForm; 