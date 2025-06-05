import React, { useContext, useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Box, Typography, Divider, useTheme, Collapse } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GetAppIcon from '@mui/icons-material/GetApp';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../../App';
import logo from '../../assets/logo.png';

// Define sidebar width constants
const SIDEBAR_WIDTH = 280; // Width when sidebar is expanded
const SIDEBAR_COLLAPSED_WIDTH = 72; // Width when sidebar is collapsed

const menuItems = [
  { label: 'Home', icon: <HomeIcon />, path: '/' },
  { 
    label: 'Questions', 
    icon: <ListAltIcon />, 
    path: '/questions',
    subItems: [
      { label: 'All', path: '/questions' },
      { label: 'Compulsory Part', path: '/questions/compulsory' },
      { label: 'Module 1 (Calculus & Statistics)', path: '/questions/module1' },
      { label: 'Module 2 (Algebra & Calculus)', path: '/questions/module2' },
    ]
  },
  { label: 'Upload', icon: <CloudUploadIcon />, path: '/upload' },
  { label: 'Export', icon: <GetAppIcon />, path: '/export' },
  { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

export default function Sidebar({ open, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode } = useContext(ThemeContext);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // Check if current path is a subpath of the questions path
  const isQuestionsActive = location.pathname.startsWith('/questions');

  // If on a questions page, expand the menu by default
  React.useEffect(() => {
    if (isQuestionsActive) {
      setExpandedMenu('Questions');
    }
  }, [isQuestionsActive]);

  const handleMenuClick = (item) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.label ? null : item.label);
    } else {
      navigate(item.path);
    }
  };

  const getActiveStyles = (isActive) => ({
    borderRadius: 2,
    mx: 1,
    mb: 0.5,
    bgcolor: isActive 
      ? mode === 'dark' 
        ? 'rgba(96, 165, 250, 0.12)' // Light blue with opacity for dark mode
        : '#e3edfa' // Light blue for light mode
      : 'transparent',
    color: isActive ? 'primary.main' : 'inherit',
    fontWeight: isActive ? 600 : 400,
    borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
    '&:hover': {
      bgcolor: mode === 'dark'
        ? 'rgba(96, 165, 250, 0.08)' // Lighter blue with opacity for dark mode
        : '#f0f6ff', // Light blue for light mode
      color: 'primary.main',
      boxShadow: mode === 'dark'
        ? '0 2px 8px rgba(0, 0, 0, 0.2)'
        : '0 2px 8px rgba(37, 99, 235, 0.08)',
    },
    transition: 'background 0.2s, color 0.2s, border 0.2s',
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          borderRight: 'none',
          transition: 'width 0.2s',
          overflowX: 'hidden',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Spacer for AppBar */}
      <Box sx={{ height: 64 }} />
      {/* Sidebar Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'flex-start' : 'center',
          py: 2,
          px: 2,
          mb: 1,
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 8,
              objectFit: 'contain'
            }} 
          />
        </motion.div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ marginLeft: 8 }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 20, letterSpacing: 1 }}>
                Question Bank
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      <Divider sx={{ mb: 1 }} />
      {/* Menu */}
      <List>
        {menuItems.map(item => {
          const isActive = item.subItems 
            ? location.pathname.startsWith(item.path)
            : location.pathname === item.path;
          const isExpanded = expandedMenu === item.label;
          
          return (
            <React.Fragment key={item.label}>
              <motion.div 
                whileHover={{ scale: 1.04 }} 
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ListItem
                  button
                  onClick={() => handleMenuClick(item)}
                  sx={getActiveStyles(isActive)}
                >
                  <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <>
                      <ListItemText primary={item.label} />
                      {item.subItems && (
                        isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                      )}
                    </>
                  )}
                </ListItem>
              </motion.div>
              
              {item.subItems && (
                <Collapse in={isExpanded && open} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <ListItem
                          key={subItem.label}
                          button
                          onClick={() => navigate(subItem.path)}
                          sx={{
                            ...getActiveStyles(isSubActive),
                            pl: 4,
                            py: 0.5,
                          }}
                        >
                          <ListItemText 
                            primary={subItem.label} 
                            primaryTypographyProps={{ 
                              fontSize: '0.9rem',
                              fontWeight: isSubActive ? 600 : 400 
                            }} 
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>
      {/* Toggle Button at Bottom */}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: open ? 'flex-end' : 'center', p: 2 }}>
        <motion.div
          onClick={onToggle}
          style={{ cursor: 'pointer' }}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <IconButton size="small" color="primary">
            <MenuIcon />
          </IconButton>
        </motion.div>
      </Box>
    </Drawer>
  );
} 