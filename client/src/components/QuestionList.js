import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  Fab,
  CardActions,
  Divider,
  useTheme,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import QuestionGrid from './QuestionGrid';
import QuestionCard from './QuestionCard';
import { 
  API_BASE_URL
} from '../config';

const SOURCES = ['HKDSE', 'HKCEE', 'HKALE', 'School Exam', 'School Mock', 'Textbook'];
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

const QuestionList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [filters, setFilters] = useState({
    type: '',
    source: '',
    topic: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadDialog, setUploadDialog] = useState(false);
  const fileInputRef = React.useRef();

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/questions/filter`, {
        params: filters
      });
      setQuestions(response.data.questions || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to fetch questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      source: '',
      topic: '',
      search: ''
    });
  };

  const handleQuestionSelect = (questionId) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q._id));
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/questions/export', {
        ids: selectedQuestions,
      });
      
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'selected_questions.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Questions exported successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export questions. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleExportWord = async () => {
    try {
      const response = await axios.post('/api/questions/export-word', {
        ids: selectedQuestions,
      }, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'math_questions.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Word file exported successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to export Word file. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('/api/questions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSnackbar({
        open: true,
        message: `Successfully uploaded ${response.data.count} questions!`,
        severity: 'success',
      });

      // Refresh the questions list
      fetchQuestions();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to upload questions',
        severity: 'error',
      });
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredQuestions = questions.filter((question) => {
    return (
      (!filters.type || question.type === filters.type) &&
      (!filters.source || question.source === filters.source) &&
      (!filters.topic || question.topic === filters.topic) &&
      (!filters.search || question.content.includes(filters.search))
    );
  });

  const getTypeLabel = (type) => {
    return type;
  };

  const getLevelColor = (level) => {
    if (theme.palette.mode === 'dark') {
      switch (level) {
        case 'Easy': return 'success';
        case 'Medium': return 'warning';
        case 'Hard': return 'error';
        default: return 'default';
      }
    } else {
      switch (level) {
        case 'Easy': return 'success';
        case 'Medium': return 'warning';
        case 'Hard': return 'error';
        default: return 'default';
      }
    }
  };

  const renderContent = (content) => {
    try {
      // Split the text by $$ for display math and $ for inline math
      const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/g);
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
      return <Typography color="error">Error rendering LaTeX</Typography>;
    }
  };

  const handleEditQuestion = (question) => {
    // Implement edit functionality
    console.log('Edit question:', question);
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      await axios.delete(`${API_BASE_URL}/questions/${questionId}`);
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setQuestions(prev => prev.filter(q => q._id !== questionId));
        setError(null);
      } else {
        console.error('Error deleting question:', err);
        setError('Failed to delete question');
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" color="text.primary">
            Question Bank
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<UploadIcon />}
              onClick={() => navigate('/upload-questions')}
            >
              Upload Questions
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-question')}
            >
              Add Question
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">
                Questions ({filteredQuestions.length})
              </Typography>
              <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
                <IconButton onClick={() => setShowFilters(!showFilters)}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
              {Object.values(filters).some(Boolean) && (
                <Tooltip title="Clear Filters">
                  <IconButton onClick={clearFilters} color="error">
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {selectedQuestions.length > 0 && (
              <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
                  sx={{ mr: 1 }}
              >
                Export ({selectedQuestions.length})
              </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportWord}
                >
                  Export as Word
                </Button>
              </>
            )}
          </Box>

          {showFilters && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Type"
                    value={filters.type}
                    onChange={e => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {['MC', 'Conventional'].map(type => (
                      <MenuItem key={type} value={type}>{type === 'MC' ? 'Multiple Choice' : 'Conventional'}</MenuItem>
                    ))}
                  </TextField>
              </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Source"
                    value={filters.source}
                    onChange={e => setFilters(prev => ({ ...prev, source: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {SOURCES.map(source => (
                      <MenuItem key={source} value={source}>{source}</MenuItem>
                    ))}
                  </TextField>
              </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Topic"
                    value={filters.topic}
                    onChange={e => setFilters(prev => ({ ...prev, topic: e.target.value }))}
                  >
                    <MenuItem value="">All</MenuItem>
                    {DSE_TOPICS.map(topic => (
                      <MenuItem key={topic} value={topic}>{topic}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    value={filters.search}
                    onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {filteredQuestions.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Checkbox
                checked={selectedQuestions.length === filteredQuestions.length}
                indeterminate={selectedQuestions.length > 0 && selectedQuestions.length < filteredQuestions.length}
                onChange={handleSelectAll}
              />
              <Typography variant="body2" color="text.secondary">
                Select All
              </Typography>
            </Box>
          )}
        </Paper>

        {filteredQuestions.length === 0 ? (
          <Box
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 300,
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 1,
              p: 4,
              mt: 4,
            }}
          >
            <Box sx={{ fontSize: 64, mb: 2 }}>📭</Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No questions found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your filters or add a new question to get started.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/add-question')}
              sx={{ mt: 2 }}
            >
              Add Question
            </Button>
            </Box>
        ) : (
            <Grid container spacing={2}>
              {filteredQuestions.map((question) => (
                <Grid item xs={12} key={question._id}>
                <QuestionCard
                  question={question}
                  selected={selectedQuestions.includes(question._id)}
                  onSelect={() => handleQuestionSelect(question._id)}
                  onEdit={() => handleEditQuestion(question)}
                  onDelete={() => handleDeleteQuestion(question._id)}
                            />
                </Grid>
              ))}
            </Grid>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.main',
        }}
        onClick={() => navigate('/add-question')}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default QuestionList; 