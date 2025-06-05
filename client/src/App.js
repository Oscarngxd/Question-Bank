import React, { createContext, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import MainLayout from './components/Layout/MainLayout';
import QuestionList from './components/QuestionList';
import QuestionForm from './components/QuestionForm';
import UploadQuestions from './components/UploadQuestions';
import ModuleSelectionPage from './components/ModuleSelectionPage';
import FeedbackForm from './components/FeedbackForm';

// Create a context for theme management
export const ThemeContext = createContext({
  mode: 'light',
  toggleTheme: () => {},
});

function App() {
  const [mode, setMode] = useState('light');

  // Theme toggle function
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Memoize the theme object to prevent unnecessary re-renders
  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  // Memoize the context value
  const contextValue = useMemo(() => ({
    mode,
    toggleTheme,
  }), [mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<ModuleSelectionPage />} />
              <Route path="/questions" element={<QuestionList />} />
              <Route path="/questions/compulsory" element={<QuestionList module="compulsory" />} />
              <Route path="/questions/module1" element={<QuestionList module="module1" />} />
              <Route path="/questions/module2" element={<QuestionList module="module2" />} />
              <Route path="/add-question" element={<QuestionForm />} />
              <Route path="/upload" element={<UploadQuestions />} />
              {/* Feedback route */}
              <Route path="/feedback" element={<FeedbackForm />} />
            </Routes>
          </MainLayout>
      </Router>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
