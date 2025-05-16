import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, IconButton, InputBase, Box, Avatar, Button, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeContext } from '../../App';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Question Bank
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'background.paper', borderRadius: 2, px: 2, mr: 2 }}>
          <SearchIcon color="action" />
          <InputBase placeholder="Search questions..." sx={{ ml: 1, flex: 1 }} />
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          sx={{ mr: 1 }}
          onClick={() => navigate('/add-question')}
        >
          Add Question
        </Button>
        <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
          <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }}>
            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
          </IconButton>
        </Tooltip>
        <IconButton color="primary"><DownloadIcon /></IconButton>
        <Avatar sx={{ ml: 2 }}>U</Avatar>
      </Toolbar>
    </AppBar>
  );
} 