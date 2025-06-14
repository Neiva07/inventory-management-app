import React from 'react';
import { Box, Typography } from '@mui/material';

interface PageTitleProps {
  children: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
    <Box sx={{ width: 6, height: 36, bgcolor: 'primary.main', borderRadius: 2, mr: 2 }} />
    <Typography
      variant="h4"
      sx={{
        fontFamily: '"Montserrat", "Inter", "Segoe UI", Arial, sans-serif',
        fontWeight: 600,
        letterSpacing: '-0.5px',
        color: 'primary.main',
        textShadow: '0 2px 8px rgba(26,35,126,0.04)'
      }}
    >
      {children}
    </Typography>
  </Box>
); 