import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as ArrowBackIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QuestionForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLatexMode, setIsLatexMode] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [question, setQuestion] = useState({
    content: '',
    source: '',
    topic: '',
    type: '',
    options: ['', '', ''],
    correctAnswer: '',
    markingScheme: '',
  });

  const [latexError, setLatexError] = useState(null);

  const SOURCES = ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook'];
  const QUESTION_TYPES = ['Conventional', 'MC'];
  const DSE_TOPICS = [
    'Quadratic Equations', 'Functions and Graphs', 'Equations of Straight Lines',
    'Polynomials', 'Inequalities', 'Exponential and Logarithmic Functions',
    'Trigonometry', 'Permutations and Combinations', 'Binomial Theorem',
    'Sequences', 'Vectors', 'Coordinate Geometry', 'Circles',
    'Statistics', 'Probability', 'Mensuration', 'Transformation',
    'Locus', 'Linear Programming', 'Matrices', 'Complex Numbers',
    'Calculus', 'Limits', 'Differentiation', 'Integration',
    'Applications of Calculus', 'Data Handling', 'Others'
  ];
  const steps = ['Question Details', 'Type & Category', 'Options & Answer'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/questions', question);
      setSnackbar({
        open: true,
        message: 'Question added successfully!',
        severity: 'success',
      });
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error adding question. Please try again.',
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

  const isStepComplete = (step) => {
    switch (step) {
      case 0:
        return question.content.trim() !== '';
      case 1:
        return question.source !== '' && question.topic !== '' && question.type !== '';
      case 2:
        return question.type !== 'MC' || 
          (question.options.every(opt => opt.trim() !== '') && question.correctAnswer !== '');
      default:
        return false;
    }
  };

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
            Add New Question
          </Typography>
        </Box>

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
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isLatexMode}
                      onChange={(e) => setIsLatexMode(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="LaTeX Mode"
                />
                {isLatexMode && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showPreview}
                        onChange={(e) => setShowPreview(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Show Preview"
                  />
                )}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={6}
                label={isLatexMode ? "Question Content (LaTeX)" : "Question Content"}
                value={question.content}
                onChange={handleContentChange}
                margin="normal"
                required
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontFamily: isLatexMode ? 'monospace' : 'inherit',
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                  },
                }}
                placeholder={isLatexMode ? "Enter your LaTeX equation (e.g., \\frac{x}{2} + 5 = 10)" : "Enter your question here..."}
                error={!!latexError}
                helperText={latexError}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label={isLatexMode ? "Marking Scheme (LaTeX supported)" : "Marking Scheme"}
                value={question.markingScheme}
                onChange={e => setQuestion({ ...question, markingScheme: e.target.value })}
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    fontFamily: isLatexMode ? 'monospace' : 'inherit',
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                  },
                }}
                placeholder={isLatexMode ? "Enter marking scheme in LaTeX or plain text" : "Enter marking scheme here..."}
              />

              {isLatexMode && showPreview && question.content && (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: 3, 
                    mt: 2, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Preview:
                  </Typography>
                  <Box sx={{ overflow: 'auto', maxWidth: '100%' }}>
                    {handleLatexPreview(question.content)}
                  </Box>
                </Paper>
              )}

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

          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel sx={{ color: theme.palette.text.secondary }}>
                  Source
                </InputLabel>
                <Select
                  value={question.source}
                  label="Source"
                  onChange={(e) => setQuestion({ ...question, source: e.target.value })}
                >
                  {SOURCES.map((src) => (
                    <MenuItem key={src} value={src}>{src}</MenuItem>
                  ))}
                </Select>
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
                  {DSE_TOPICS.map((topic) => (
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

          {activeStep === 2 && question.type === 'MC' && (
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
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default QuestionForm; 