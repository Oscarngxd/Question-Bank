import React from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActionArea, 
  Typography, 
  Box,
  useTheme,
  Paper,
  Divider,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Functions as FunctionsIcon,
  Timeline as TimelineIcon,
  Calculate as CalculateIcon,
  BarChart as BarChartIcon,
  Architecture as ArchitectureIcon,
  DataArray as DataArrayIcon,
  Feedback as FeedbackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ModuleSelectionPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const modules = [
    {
      id: 'compulsory',
      title: 'Compulsory Part',
      description: 'Core mathematics topics required for all students including algebra, geometry, trigonometry, and basic calculus concepts.',
      icon: <CalculateIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />,
      color: theme.palette.primary.main,
      path: '/questions/compulsory',
      topics: ['Algebra', 'Geometry', 'Trigonometry', 'Functions', 'Coordinate Geometry']
    },
    {
      id: 'module1',
      title: 'Module 1 (Calculus & Statistics)',
      description: 'Extended topics focused on applied mathematics, including probability, statistics, and calculus applications.',
      icon: <BarChartIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />,
      color: theme.palette.secondary.main,
      path: '/questions/module1',
      topics: ['Differentiation', 'Integration', 'Probability', 'Statistical Analysis', 'Data Representation']
    },
    {
      id: 'module2',
      title: 'Module 2 (Algebra & Calculus)',
      description: 'Advanced topics in pure mathematics, including advanced algebra, calculus, and mathematical reasoning.',
      icon: <FunctionsIcon sx={{ fontSize: 60, color: theme.palette.info.main }} />,
      color: theme.palette.info.main,
      path: '/questions/module2',
      topics: ['Advanced Algebra', 'Calculus Methods', 'Mathematical Induction', 'Complex Numbers', 'Vectors']
    }
  ];

  const handleModuleSelect = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Question Bank
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
          Select a mathematics module to access specialized question sets aligned with Hong Kong's NSS curriculum.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {modules.map((module) => (
          <Grid item xs={12} md={4} key={module.id}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                borderTop: `4px solid ${module.color}`,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[8],
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleModuleSelect(module.path)}
                sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 2 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  {module.icon}
                </Box>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography gutterBottom variant="h5" component="h2" align="center" fontWeight="bold">
                    {module.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {module.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="subtitle2" color="text.primary" fontWeight="bold" gutterBottom>
                      Key Topics:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {module.topics.map((topic, index) => (
                        <Box
                          key={index}
                          sx={{
                            bgcolor: `${module.color}22`,
                            color: 'text.primary',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontWeight: 'medium',
                          }}
                        >
                          {topic}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper 
        elevation={1} 
        sx={{ 
          mt: 5, 
          p: 3, 
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FeedbackIcon color="action" />
          <Typography variant="body2" color="text.secondary">
            We value your input! Help us improve the Question Bank by sharing your feedback.
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<FeedbackIcon />}
          onClick={() => navigate('/feedback')}
        >
          Provide Feedback
        </Button>
      </Paper>
    </Container>
  );
};

export default ModuleSelectionPage; 