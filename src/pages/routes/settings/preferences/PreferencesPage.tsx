import React from 'react';
import { 
  Box, 
  Typography, 
  Switch, 
  FormControlLabel, 
  FormGroup,
  Divider,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  TextField,
} from '@mui/material';
import { useUI } from '../../../../context/ui';
import { useAuth } from '../../../../context/auth';
import { getAppSettings, setAppSettings } from '../../../../model/appSettings';

export const PreferencesPage = () => {
  const { layout, setLayout, loading } = useUI();
  const { user } = useAuth();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [language, setLanguage] = React.useState('pt-BR');
  const [timezone, setTimezone] = React.useState('America/Sao_Paulo');

  // Load user preferences
  React.useEffect(() => {
    if (user) {
      getAppSettings(user.id).then((settings) => {
        if (settings) {
          setTheme(settings.theme || 'light');
          setLanguage(settings.language || 'pt-BR');
          setTimezone(settings.timezone || 'America/Sao_Paulo');
        }
      });
    }
  }, [user]);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (user) {
      setAppSettings({ 
        user_id: user.id, 
        layout, 
        theme: newTheme,
        language,
        timezone,
      });
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (user) {
      setAppSettings({ 
        user_id: user.id, 
        layout, 
        theme,
        language: newLanguage,
        timezone,
      });
    }
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    if (user) {
      setAppSettings({ 
        user_id: user.id, 
        layout, 
        theme,
        language,
        timezone: newTimezone,
      });
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Preferências do Sistema
      </Typography>
      
      <Grid container spacing={3}>
        {/* Layout Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Layout de Navegação
            </Typography>
            <FormGroup>
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
            </FormGroup>
          </Paper>
        </Grid>

        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Tema
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Tema</InputLabel>
              <Select
                value={theme}
                label="Tema"
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark')}
              >
                <MenuItem value="light">Claro</MenuItem>
                <MenuItem value="dark">Escuro</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Language Settings - Display Only */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Idioma
            </Typography>
            <TextField
              fullWidth
              label="Idioma"
              value={language}
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Paper>
        </Grid>

        {/* Timezone Settings - Display Only */}
        <Grid item xs={12} md={6}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Fuso Horário
            </Typography>
            <TextField
              fullWidth
              label="Fuso Horário"
              value={timezone}
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Box mt={3}>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Dica:</strong> Use Ctrl/Cmd + , para acessar as configurações rapidamente.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
}; 