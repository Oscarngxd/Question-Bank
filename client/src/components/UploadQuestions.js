import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  IconButton,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  useTheme,
  alpha,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const steps = [
  'Download Template',
  'Prepare Document',
  'Upload & Parse',
  'Review & Adjust',
  'Save to Bank',
];

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

const UploadQuestions = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [activeStep, setActiveStep] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleFileSelect({ target: { files: acceptedFiles } });
      }
    },
  });

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setError(null);
    setUploadSuccess(false);
    setActiveStep(2);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/questions/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParsedQuestions(response.data.questions.map(q => ({
        ...q,
        content: q.content || '',
        type: q.type || 'MC',
        level: q.level || 'Medium',
        topic: q.topic || 'Algebra',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        preview: q.preview
      })));
      setUploadSuccess(true);
      setActiveStep(3);
      setSnackbar({ open: true, message: `Parsed ${response.data.questions.length} questions!`, severity: 'success' });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to parse questions');
      setParsedQuestions([]);
      setSnackbar({ open: true, message: 'Failed to parse questions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/questions/batch', {
        questions: parsedQuestions,
      });
      setSnackbar({ open: true, message: 'Questions saved successfully!', severity: 'success' });
      setActiveStep(4);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save questions');
      setSnackbar({ open: true, message: 'Failed to save questions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:5000/api/questions/template', {
        responseType: 'blob',
        timeout: 10000,
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'math_question_template.docx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Template downloaded!', severity: 'success' });
      setActiveStep(1);
    } catch (error) {
      setError('Failed to download template. Please try again.');
      setSnackbar({ open: true, message: 'Failed to download template', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    if (!content) return null;
    try {
      const parts = content.split(/(\$.*?\$)/g);
      return (
        <Box component="span">
          {parts.map((part, index) => {
            if (part.startsWith('$') && part.endsWith('$')) {
              const math = part.slice(1, -1);
              try {
              return <InlineMath key={index} math={math} />;
              } catch (mathError) {
                return <Typography key={index} color="error" component="span">{part}</Typography>;
              }
            } else {
              return part ? <Typography key={index} component="span">{part}</Typography> : null;
            }
          })}
        </Box>
      );
    } catch (error) {
      return <Typography color="error" component="span">Error rendering content</Typography>;
    }
  };

  const handleQuestionUpdate = (index, field, value) => {
    const updatedQuestions = [...parsedQuestions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setParsedQuestions(updatedQuestions);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Actions at the top */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                  variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Back
          </Button>
          <Button
            variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadTemplate}
            disabled={loading}
                >
                  Download Template
                </Button>
        </Box>

        {/* Upload Area */}
        <Paper
          {...getRootProps()}
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            textAlign: 'center',
            border: `2px dashed ${theme.palette.primary.main}`,
            bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          <input {...getInputProps()} />
          <UploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Drag & drop your .doc or .docx file here, or click to select
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Only Word documents (.doc, .docx) are supported
          </Typography>
                {selectedFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected file: <b>{selectedFile.name}</b>
                  </Typography>
                )}
          {loading && <CircularProgress sx={{ mt: 2 }} />}
            </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Parsed Questions Preview */}
        {parsedQuestions.length > 0 && (
          <Paper elevation={2} sx={{ p: 3, mb: 3, maxHeight: 400, overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Preview & Adjust Parsed Questions ({parsedQuestions.length})
                  </Typography>
                <Grid container spacing={2}>
              {parsedQuestions.map((q, idx) => (
                <Grid item xs={12} key={idx}>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Question {idx + 1}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        {renderContent(q.content)}
                      </Typography>
                      <Grid container spacing={2} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={4}>
                          <TextField
                            select
                            fullWidth
                            label="Source"
                            value={q.source || ''}
                            onChange={e => handleQuestionUpdate(idx, 'source', e.target.value)}
                                >
                            {SOURCES.map(src => (
                              <MenuItem key={src} value={src}>{src}</MenuItem>
                                  ))}
                          </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                          <TextField
                            select
                            fullWidth
                            label="Topic"
                            value={q.topic || ''}
                            onChange={e => handleQuestionUpdate(idx, 'topic', e.target.value)}
                                >
                            {DSE_TOPICS.map(topic => (
                              <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                                  ))}
                          </TextField>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                          <TextField
                            select
                            fullWidth
                            label="Question Type"
                            value={q.type || ''}
                            onChange={e => handleQuestionUpdate(idx, 'type', e.target.value)}
                                >
                            {QUESTION_TYPES.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                                  ))}
                          </TextField>
                            </Grid>
                          </Grid>
                      {q.options && q.options.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Options:
                          </Typography>
                          {q.options.map((opt, i) => (
                            <Typography key={i} variant="body2" sx={{ ml: 2 }}>
                              {String.fromCharCode(65 + i)}. {opt}
                            </Typography>
                          ))}
                        </Box>
                      )}
                      {q.correctAnswer !== undefined && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Correct Answer: {typeof q.correctAnswer === 'number' ? String.fromCharCode(65 + q.correctAnswer) : q.correctAnswer}
                        </Typography>
                      )}
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Marking Scheme"
                        value={q.markingScheme || ''}
                        onChange={e => handleQuestionUpdate(idx, 'markingScheme', e.target.value)}
                        margin="normal"
                        sx={{ mt: 2 }}
                        placeholder="Enter marking scheme here (LaTeX supported)"
                      />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={parsedQuestions.length === 0 || loading}
              >
                Save All Questions
              </Button>
            </Box>
              </Paper>
            )}

        {/* Snackbar for feedback */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default UploadQuestions; 