import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Box, Toolbar } from '@mui/material';

const SIDEBAR_WIDTH = 220;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.2s',
        }}
      >
        <Topbar />
        <Toolbar /> {/* Spacer for fixed topbar */}
        <Box sx={{ flex: 1, p: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
} 