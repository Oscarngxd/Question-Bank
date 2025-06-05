import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  useTheme,
  Rating,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon, Send as SendIcon } from '@mui/icons-material';

const FeedbackForm = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState({
    rating: 4,
    experience: 'positive',
    module: '',
    suggestions: '',
    email: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  const handleRatingChange = (event, newValue) => {
    setFeedback({ ...feedback, rating: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Here you would typically send the feedback to your server
    // For now, we'll just show a success message
    console.log('Feedback submitted:', feedback);
    
    setSnackbar({
      open: true,
      message: 'Thank you for your feedback! We appreciate your input.',
      severity: 'success'
    });
    
    // Clear the form
    setFeedback({
      rating: 4,
      experience: 'positive',
      module: '',
      suggestions: '',
      email: ''
    });
    
    // Navigate back to home after a delay
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3}
        sx={{
          p: 4,
          mt: 4,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            We Value Your Feedback
          </Typography>
        </Box>
        
        <Typography color="text.secondary" paragraph>
          Your feedback helps us improve our Question Bank system. Please share your thoughts and suggestions.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              How would you rate your overall experience?
            </Typography>
            <Rating 
              name="rating"
              value={feedback.rating} 
              onChange={handleRatingChange}
              size="large"
              precision={0.5}
              sx={{ mb: 2 }}
            />
          </Box>
          
          <FormControl component="fieldset" sx={{ mb: 4 }}>
            <FormLabel component="legend">What was your experience with our Question Bank?</FormLabel>
            <RadioGroup
              name="experience"
              value={feedback.experience}
              onChange={handleChange}
              row
            >
              <FormControlLabel value="positive" control={<Radio />} label="Positive" />
              <FormControlLabel value="neutral" control={<Radio />} label="Neutral" />
              <FormControlLabel value="negative" control={<Radio />} label="Negative" />
            </RadioGroup>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 4 }}>
            <FormLabel>Which module did you use the most?</FormLabel>
            <RadioGroup
              name="module"
              value={feedback.module}
              onChange={handleChange}
            >
              <FormControlLabel value="compulsory" control={<Radio />} label="Compulsory Part" />
              <FormControlLabel value="module1" control={<Radio />} label="Module 1 (Calculus & Statistics)" />
              <FormControlLabel value="module2" control={<Radio />} label="Module 2 (Algebra & Calculus)" />
              <FormControlLabel value="all" control={<Radio />} label="All modules equally" />
            </RadioGroup>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="What improvements would you suggest?"
            name="suggestions"
            value={feedback.suggestions}
            onChange={handleChange}
            margin="normal"
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Your email (optional)"
            name="email"
            type="email"
            value={feedback.email}
            onChange={handleChange}
            margin="normal"
            helperText="We'll only use this to follow up on your feedback if needed"
            sx={{ mb: 4 }}
          />
          
          <Button
            type="submit"
            variant="contained"
            size="large"
            endIcon={<SendIcon />}
            sx={{ px: 4, py: 1.5 }}
          >
            Submit Feedback
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FeedbackForm; 