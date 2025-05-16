import React, { useState } from 'react';
import { Card, CardContent, Box, Chip, IconButton, Typography, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, CardActions, useTheme, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { InlineMath, BlockMath } from 'react-katex';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'katex/dist/katex.min.css';
import { QUESTION_TYPES, API_BASE_URL } from '../config';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function renderWithMath(content) {
  // Split by $$ for block math, $ for inline math
  const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('$$') && part.endsWith('$$')) {
      return <BlockMath key={idx} math={part.slice(2, -2)} />;
    } else if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={idx} math={part.slice(1, -1)} />;
    } else {
      return <Typography key={idx} component="span">{part}</Typography>;
    }
  });
}

const QuestionCard = ({ question, selected, onSelect, onEdit, onDelete }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const getTypeLabel = (type) => {
    return QUESTION_TYPES[type] || type;
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  const handleEdit = () => {
    navigate(`/add-question?id=${question._id}`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/questions/${question._id}`);
      if (onDelete) onDelete(question._id);
      setDeleteOpen(false);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        if (onDelete) onDelete(question._id);
        setDeleteOpen(false);
      } else {
        console.error('Error deleting question:', err);
        alert('Failed to delete question. Please try again.');
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

  const renderOptions = () => {
    // Only show options for MC questions
    if (question.type !== 'MC' || !question.options) return null;

    return (
      <Box sx={{ mt: 2 }}>
        {question.options.map((option, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              {String.fromCharCode(65 + index)}.
            </Typography>
            {renderContent(option)}
          </Box>
        ))}
      </Box>
    );
  };

  const renderAnswer = () => {
    if (!question.answer) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Answer:
        </Typography>
        {renderContent(question.answer)}
      </Box>
    );
  };

  const renderMarkingScheme = () => {
    if (!question.markingScheme) return null;
    return (
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Marking Scheme</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            {question.markingScheme.split('\n').map((line, idx) => (
              <div key={idx}>{renderContent(line)}</div>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      <Card
        elevation={2}
        sx={{
          position: 'relative',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4],
          },
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.paper',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Checkbox
              checked={selected}
              onChange={onSelect}
              sx={{ mr: 1 }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Chip
                  label={question.type === 'MC' ? 'Multiple Choice' : 'Conventional'}
                  size="small"
                  color={question.type === 'MC' ? 'primary' : 'secondary'}
                  sx={{ borderRadius: 2, fontWeight: 500 }}
                />
                <Chip
                  label={question.source}
                  size="small"
                  color="info"
                  sx={{ borderRadius: 2, fontWeight: 500 }}
                />
                <Chip
                  label={question.topic}
                  size="small"
                  color="success"
                  sx={{ borderRadius: 2, fontWeight: 500 }}
                />
              </Box>
              <Typography variant="body1" component="div" sx={{ mb: 2 }}>
                {renderContent(question.content)}
              </Typography>
              {renderOptions()}
              {renderAnswer()}
              {renderMarkingScheme()}
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
          <Tooltip title="Copy">
            <IconButton size="small" onClick={() => navigator.clipboard.writeText(question.content)}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => setDeleteOpen(true)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Preview Question</DialogTitle>
        <DialogContent>
          <Typography variant="body1">{renderWithMath(question.content)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Delete Question</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuestionCard; 