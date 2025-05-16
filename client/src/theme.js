import { createTheme } from '@mui/material/styles';

// Common theme settings that apply to both light and dark modes
const commonSettings = {
  typography: {
    fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    h4: { fontWeight: 600, fontSize: '1.25rem' },
    h5: { fontWeight: 600, fontSize: '1.1rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    body1: { fontSize: '1.1rem' },
    body2: { fontSize: '1rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '10px 20px',
          fontWeight: 600,
          boxShadow: 'none',
          textTransform: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(37, 99, 235, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0px 6px 24px rgba(37, 99, 235, 0.10)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
          },
        },
      },
    },
  },
};

// Light theme specific settings
const lightTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb', // Modern blue
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#fff',
    },
    secondary: {
      main: '#a21caf', // Accent purple
      light: '#c026d3',
      dark: '#86198f',
      contrastText: '#fff',
    },
    success: {
      main: '#14b8a6', // Teal for tags/status
      light: '#2dd4bf',
      dark: '#0f766e',
      contrastText: '#fff',
    },
    background: {
      default: '#f3f4f6', // Light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Slate 800
      secondary: '#64748b', // Slate 500
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  components: {
    ...commonSettings.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...commonSettings.components.MuiCard.styleOverrides.root,
          boxShadow: '0px 2px 12px rgba(30, 41, 59, 0.06)',
        },
      },
    },
  },
});

// Dark theme specific settings
const darkTheme = createTheme({
  ...commonSettings,
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa', // Lighter blue for better visibility
      light: '#93c5fd',
      dark: '#3b82f6',
      contrastText: '#fff',
    },
    secondary: {
      main: '#c026d3', // Lighter purple
      light: '#d946ef',
      dark: '#a21caf',
      contrastText: '#fff',
    },
    success: {
      main: '#2dd4bf', // Lighter teal
      light: '#5eead4',
      dark: '#14b8a6',
      contrastText: '#fff',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f1f5f9', // Slate 100
      secondary: '#cbd5e1', // Slate 300
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  components: {
    ...commonSettings.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...commonSettings.components.MuiCard.styleOverrides.root,
          boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b', // Slate 800
          backgroundImage: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b', // Slate 800
          backgroundImage: 'none',
        },
      },
    },
  },
});

export { lightTheme, darkTheme };
export default lightTheme; // Default to light theme 