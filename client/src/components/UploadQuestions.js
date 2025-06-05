import React, { useState, useEffect } from 'react';
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
  'Select Module',
  'Download Template',
  'Prepare Document',
  'Upload & Parse',
  'Review & Adjust',
  'Save to Bank',
];

const MODULES = [
  { id: 'compulsory', name: 'Compulsory Part', description: 'Core mathematics topics required for all students' },
  { id: 'module1', name: 'Module 1 (Calculus & Statistics)', description: 'Extended topics focused on applied mathematics' },
  { id: 'module2', name: 'Module 2 (Algebra & Calculus)', description: 'Advanced topics in pure mathematics' }
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
  const [selectedModule, setSelectedModule] = useState('');
  const [moduleError, setModuleError] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    sources: [],
    types: [],
    topics: [],
    years: [],
    schools: [],
    textbooks: []
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop: async (acceptedFiles) => {
      if (!selectedModule) {
        setModuleError('Please select a module before uploading');
        setSnackbar({ 
          open: true, 
          message: 'You must select a module before uploading files', 
          severity: 'error' 
        });
        return;
      }
      
      if (acceptedFiles.length > 0) {
        await handleFileSelect({ target: { files: acceptedFiles } });
      }
    },
    disabled: !selectedModule
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    // If any of the filterOptions arrays are empty after loading, provide defaults
    const needsDefaults = 
      !filterOptions.sources.length || 
      !filterOptions.types.length || 
      !filterOptions.topics.length;
      
    if (needsDefaults && !loading) {
      console.log('Setting default filter options');
      setFilterOptions(prev => ({
        sources: prev.sources.length ? prev.sources : ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook'],
        types: prev.types.length ? prev.types : ['Conventional', 'MC'],
        topics: prev.topics.length ? prev.topics : ['Quadratic Equations', 'Calculus', 'Geometry', 'Integration', 'Differentiation'],
        years: prev.years.length ? prev.years : ['2020', '2021', '2022', '2023'],
        schools: prev.schools.length ? prev.schools : ['School A', 'School B', 'School C'],
        textbooks: prev.textbooks.length ? prev.textbooks : ['Textbook A', 'Mathematics Extended Part Module 1', 'Mathematics Extended Part Module 2']
      }));
    }
  }, [filterOptions, loading]);
  
  // Force refresh filter options when parsedQuestions change
  useEffect(() => {
    if (parsedQuestions.length > 0) {
      console.log('Ensuring filter options are up to date with parsed questions');
      
      // Extract unique values from parsed questions
      const extractedSources = [...new Set(parsedQuestions.map(q => q.source).filter(Boolean))];
      const extractedYears = [...new Set(parsedQuestions.map(q => q.year).filter(Boolean))];
      const extractedSchools = [...new Set(parsedQuestions.map(q => q.school).filter(Boolean))];
      const extractedTextbooks = [...new Set(parsedQuestions.map(q => q.textbook).filter(Boolean))];
      const extractedTopics = [...new Set(parsedQuestions.map(q => q.topic).filter(Boolean))];
      
      // Update filter options with values from parsed questions
      setFilterOptions(prev => ({
        sources: [...new Set([...prev.sources, ...extractedSources])],
        years: [...new Set([...prev.years, ...extractedYears])],
        schools: [...new Set([...prev.schools, ...extractedSchools])],
        textbooks: [...new Set([...prev.textbooks, ...extractedTextbooks])],
        topics: [...new Set([...prev.topics, ...extractedTopics])],
        types: prev.types
      }));
    }
  }, [parsedQuestions]);

  const fetchFilterOptions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/questions/filter-options');
      // Ensure we're not overwriting with empty arrays if there's no data
      setFilterOptions(prev => ({
        sources: response.data.sources?.length ? response.data.sources : prev.sources,
        types: response.data.types?.length ? response.data.types : prev.types,
        topics: response.data.topics?.length ? response.data.topics : prev.topics,
        years: response.data.years?.length ? response.data.years : prev.years,
        schools: response.data.schools?.length ? response.data.schools : prev.schools,
        textbooks: response.data.textbooks?.length ? response.data.textbooks : prev.textbooks
      }));
      
      // Set default values if empty
      if (!response.data.sources?.length) {
        setFilterOptions(prev => ({
          ...prev,
          sources: ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook']
        }));
      }
      if (!response.data.types?.length) {
        setFilterOptions(prev => ({
          ...prev,
          types: ['Conventional', 'MC']
        }));
      }
    } catch (err) {
      console.error('Error fetching filter options:', err);
      
      // Fallback to default values if API call fails
      setFilterOptions({
        sources: ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook'],
        types: ['Conventional', 'MC'],
        topics: ['Quadratic Equations', 'Calculus', 'Geometry', 'Integration', 'Differentiation'],
        years: ['2020', '2021', '2022', '2023'],
        schools: ['School A', 'School B', 'School C'],
        textbooks: ['Textbook A', 'Mathematics Extended Part Module 1', 'Mathematics Extended Part Module 2']
      });
      
      setSnackbar({
        open: true,
        message: 'Failed to load filter options, using defaults',
        severity: 'warning'
      });
    }
  };

  const handleFileSelect = async (event) => {
    if (!selectedModule) {
      setModuleError('Please select a module before uploading');
      setSnackbar({ 
        open: true, 
        message: 'You must select a module before uploading files', 
        severity: 'error' 
      });
      return;
    }
    
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);
    setError(null);
    setUploadSuccess(false);
    setActiveStep(3);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', selectedModule);

    try {
      const response = await axios.post('http://localhost:5000/api/questions/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // First fetch the latest filter options to ensure dropdowns are populated
      await fetchFilterOptions();

      // Map and enhance the parsed questions data
      const parsedData = response.data.questions.map(q => ({
        ...q,
        content: q.content || '',
        type: q.type || 'Conventional',
        level: q.level || 'Medium',
        topic: q.topic || 'Algebra',
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        preview: q.preview,
        module: selectedModule,
        // Ensure these values are strings not undefined
        source: q.source || '',
        year: q.year || '',
        school: q.school || '',
        textbook: q.textbook || ''
      }));

      console.log('Parsed questions with field values:', parsedData);
      setParsedQuestions(parsedData);
      
      // Add any new values from the parsed data to our filter options
      const newSources = [...new Set(parsedData.map(q => q.source).filter(Boolean))];
      const newYears = [...new Set(parsedData.map(q => q.year).filter(Boolean))];
      const newSchools = [...new Set(parsedData.map(q => q.school).filter(Boolean))];
      const newTextbooks = [...new Set(parsedData.map(q => q.textbook).filter(Boolean))];
      const newTopics = [...new Set(parsedData.map(q => q.topic).filter(Boolean))];
      
      if (newSources.length || newYears.length || newSchools.length || newTextbooks.length || newTopics.length) {
        setFilterOptions(prev => ({
          sources: [...new Set([...prev.sources, ...newSources])],
          years: [...new Set([...prev.years, ...newYears])],
          schools: [...new Set([...prev.schools, ...newSchools])],
          textbooks: [...new Set([...prev.textbooks, ...newTextbooks])],
          topics: [...new Set([...prev.topics, ...newTopics])],
          types: prev.types
        }));
      }
      
      setUploadSuccess(true);
      setActiveStep(4);
      setSnackbar({ open: true, message: `Parsed ${parsedData.length} questions!`, severity: 'success' });
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
        module: selectedModule
      });
      setSnackbar({ open: true, message: 'Questions saved successfully!', severity: 'success' });
      setActiveStep(5);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save questions');
      setSnackbar({ open: true, message: 'Failed to save questions', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async () => {
    if (!selectedModule) {
      setModuleError('Please select a module before downloading the template');
      setSnackbar({ 
        open: true, 
        message: 'You must select a module before downloading the template', 
        severity: 'error' 
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/api/questions/template?module=${selectedModule}`, {
        responseType: 'blob',
        timeout: 10000,
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `math_question_template_${selectedModule}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSnackbar({ open: true, message: 'Template downloaded!', severity: 'success' });
      setActiveStep(2);
    } catch (error) {
      setError('Failed to download template. Please try again.');
      setSnackbar({ open: true, message: 'Failed to download template', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleChange = (event) => {
    setSelectedModule(event.target.value);
    setModuleError('');
    if (event.target.value) {
      setActiveStep(1);
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

  // Helper function to determine which additional fields to show based on source
  const getSourceType = (source) => {
    if (['HKDSE', 'HKCEE', 'HKALE'].includes(source)) {
      return 'exam';
    } else if (['School Exam', 'School Mock'].includes(source)) {
      return 'school';
    } else if (source === 'Textbook') {
      return 'textbook';
    }
    return '';
  };

  const handleQuestionUpdate = (index, field, value) => {
    const updatedQuestions = [...parsedQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    
    // Reset dependent fields when source changes
    if (field === 'source') {
      updatedQuestions[index].year = '';
      updatedQuestions[index].school = '';
      updatedQuestions[index].textbook = '';
    }
    
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
          {selectedModule && (
          <Button
            variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadTemplate}
              disabled={loading || !selectedModule}
                >
                  Download Template
                </Button>
          )}
        </Box>

        {/* Module selection section */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Select Module
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Please select the module these questions belong to. This helps organize the question bank and ensures proper categorization.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {MODULES.map((module) => (
              <Box
                key={module.id}
                component="label"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1,
                  border: '1px solid',
                  borderColor: selectedModule === module.id 
                    ? theme.palette.primary.main 
                    : theme.palette.divider,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: selectedModule === module.id 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
              >
                <input
                  type="radio"
                  name="module"
                  value={module.id}
                  checked={selectedModule === module.id}
                  onChange={handleModuleChange}
                  style={{ marginRight: '12px' }}
                />
                <Box>
                  <Typography variant="subtitle1">{module.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {module.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          
          {moduleError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {moduleError}
            </Alert>
          )}
            </Paper>

        {/* Upload Area - only show if module is selected */}
        {selectedModule && (
          <Paper
            {...getRootProps()}
            elevation={3}
            sx={{
              p: 4,
              mb: 4,
              textAlign: 'center',
              border: `2px dashed ${theme.palette.primary.main}`,
              bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
              cursor: selectedModule ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
              opacity: selectedModule ? 1 : 0.7,
            }}
          >
            <input {...getInputProps()} disabled={!selectedModule} />
            <UploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {selectedModule ? 'Drag & Drop or Click to Upload' : 'Please select a module first'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Only .doc and .docx files are supported. Questions will be parsed according to the template format.
            </Typography>
          </Paper>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}

        {/* Parsed Questions Preview */}
        {parsedQuestions.length > 0 && (
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3,
              width: '100%'
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Preview & Adjust Parsed Questions ({parsedQuestions.length})
                  </Typography>
            
            {/* Quick explanation text */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review and adjust the parsed questions before saving them to the database. 
              Make sure all fields are correctly set, especially Source, Topic, and Type.
            </Typography>
            
            <Grid container spacing={3}>
              {parsedQuestions.map((q, idx) => (
                <Grid item xs={12} key={idx}>
                  <Card variant="outlined" sx={{ mb: 2, p: 1 }}>
                        <CardContent>
                      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
                        Question {idx + 1}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 1 }}>
                        {renderContent(q.content)}
                      </Typography>
                      <Grid container spacing={3} sx={{ mb: 1 }}>
                            <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" gutterBottom sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
                            Source Information
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            label="Source"
                            value={q.source || ''}
                            onChange={e => handleQuestionUpdate(idx, 'source', e.target.value)}
                            sx={{ mb: 2 }}
                                >
                            <MenuItem value="">Select Source</MenuItem>
                            {console.log(`Source options for question ${idx}:`, filterOptions.sources, 'Selected:', q.source)}
                            {filterOptions.sources.map(src => (
                              <MenuItem key={src} value={src}>{src}</MenuItem>
                                  ))}
                          </TextField>
                          
                          {/* Dynamic fields based on source selection directly under source */}
                          {getSourceType(q.source) === 'exam' && (
                            <TextField
                              select
                              size="small"
                              label="Year"
                              value={q.year || ''}
                              onChange={e => handleQuestionUpdate(idx, 'year', e.target.value)}
                              sx={{ 
                                ml: 2, 
                                width: 'calc(100% - 16px)',
                                mb: 2,
                                '& .MuiInputLabel-root': {
                                  fontSize: '0.85rem',
                                },
                                '& .MuiSelect-select': {
                                  fontSize: '0.9rem',
                                }
                              }}
                            >
                              <MenuItem value="">Select Year</MenuItem>
                              {console.log(`Year options for question ${idx}:`, filterOptions.years, 'Selected:', q.year)}
                              {filterOptions.years.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                              ))}
                            </TextField>
                          )}
                          
                          {getSourceType(q.source) === 'school' && (
                            <>
                              <TextField
                                select
                                size="small"
                                label="School"
                                value={q.school || ''}
                                onChange={e => handleQuestionUpdate(idx, 'school', e.target.value)}
                                sx={{ 
                                  ml: 2, 
                                  width: 'calc(100% - 16px)',
                                  mb: 2,
                                  '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                  },
                                  '& .MuiSelect-select': {
                                    fontSize: '0.9rem',
                                  }
                                }}
                              >
                                <MenuItem value="">Select School</MenuItem>
                                {filterOptions.schools.map(school => (
                                  <MenuItem key={school} value={school}>{school}</MenuItem>
                                ))}
                              </TextField>
                              <TextField
                                select
                                size="small"
                                label="Year"
                                value={q.year || ''}
                                onChange={e => handleQuestionUpdate(idx, 'year', e.target.value)}
                                sx={{ 
                                  ml: 2, 
                                  width: 'calc(100% - 16px)',
                                  mb: 2,
                                  '& .MuiInputLabel-root': {
                                    fontSize: '0.85rem',
                                  },
                                  '& .MuiSelect-select': {
                                    fontSize: '0.9rem',
                                  }
                                }}
                              >
                                <MenuItem value="">Select Year</MenuItem>
                                {filterOptions.years.map(year => (
                                  <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                              </TextField>
                            </>
                          )}
                          
                          {getSourceType(q.source) === 'textbook' && (
                            <TextField
                              select
                              size="small"
                              label="Textbook"
                              value={q.textbook || ''}
                              onChange={e => handleQuestionUpdate(idx, 'textbook', e.target.value)}
                              sx={{ 
                                ml: 2, 
                                width: 'calc(100% - 16px)',
                                mb: 2,
                                '& .MuiInputLabel-root': {
                                  fontSize: '0.85rem',
                                },
                                '& .MuiSelect-select': {
                                  fontSize: '0.9rem',
                                }
                              }}
                            >
                              <MenuItem value="">Select Textbook</MenuItem>
                              {filterOptions.textbooks.map(book => (
                                <MenuItem key={book} value={book}>{book}</MenuItem>
                              ))}
                            </TextField>
                          )}
                            </Grid>
                        
                            <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" gutterBottom sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
                            Question Details
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            label="Topic"
                            value={q.topic || ''}
                            onChange={e => handleQuestionUpdate(idx, 'topic', e.target.value)}
                            sx={{ mb: 2 }}
                                >
                            <MenuItem value="">Select Topic</MenuItem>
                            {filterOptions.topics.map(topic => (
                              <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                                  ))}
                          </TextField>
                        
                          <TextField
                            select
                            fullWidth
                            label="Question Type"
                            value={q.type || ''}
                            onChange={e => handleQuestionUpdate(idx, 'type', e.target.value)}
                                >
                            <MenuItem value="">Select Type</MenuItem>
                            {filterOptions.types.map(type => (
                              <MenuItem key={type} value={type}>{type}</MenuItem>
                                  ))}
                          </TextField>
                            </Grid>
                        
                        <Grid item xs={12} sm={4}>
                          <Typography variant="subtitle2" gutterBottom sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1 }}>
                            Answer Information
                          </Typography>
                          
                          {q.options && q.options.length > 0 && (
                            <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                              <Typography variant="body2" fontWeight="500" color="text.secondary" sx={{ mb: 1 }}>
                                Options:
                          </Typography>
                          {q.options.map((opt, i) => (
                                <Typography key={i} variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                                  <strong>{String.fromCharCode(65 + i)}.</strong> {opt}
                            </Typography>
                          ))}
                        </Box>
                      )}
                          
                      {q.correctAnswer !== undefined && (
                            <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.success.main }}>
                          Correct Answer: {typeof q.correctAnswer === 'number' ? String.fromCharCode(65 + q.correctAnswer) : q.correctAnswer}
                        </Typography>
                      )}
                        </Grid>
                      </Grid>
                      
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