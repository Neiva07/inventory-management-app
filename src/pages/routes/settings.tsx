import React from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, Container } from '@mui/material';
import { useUI } from '../../context/ui';

export const Settings = () => {
  const { layout, setLayout, loading } = useUI();

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Configurações
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Layout de Navegação
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={layout === 'navbar'}
              onChange={() => setLayout(layout === 'navbar' ? 'sidebar' : 'navbar')}
              name="navbarEnabled"
              color="primary"
              disabled={loading}
            />
          }
          label={layout === 'navbar' ? 'Navbar' : 'Sidebar'}
        />
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            (Mais opções de configuração em breve)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
