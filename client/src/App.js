import React, { createContext, useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import MainLayout from './components/Layout/MainLayout';
import QuestionList from './components/QuestionList';
import QuestionForm from './components/QuestionForm';
import UploadQuestions from './components/UploadQuestions';

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
              <Route path="/" element={<QuestionList />} />
              <Route path="/questions" element={<QuestionList />} />
              <Route path="/add-question" element={<QuestionForm />} />
              <Route path="/upload" element={<UploadQuestions />} />
              {/* Add more routes as needed */}
            </Routes>
          </MainLayout>
      </Router>
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
