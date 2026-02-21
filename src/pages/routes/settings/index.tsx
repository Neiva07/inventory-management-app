import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Tune as TuneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { PreferencesPage } from './preferences/PreferencesPage';
import { OrganizationPage } from './organization/OrganizationPage';
import { ProfilePage } from './profile/ProfilePage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const SettingsRouter = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configurações
      </Typography>
      
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="settings tabs"
              variant="fullWidth"
            >
              <Tab 
                icon={<TuneIcon />} 
                label="Preferências" 
                iconPosition="start"
                id="settings-tab-0"
                aria-controls="settings-tabpanel-0"
              />
              <Tab 
                icon={<BusinessIcon />} 
                label="Organização" 
                iconPosition="start"
                id="settings-tab-1"
                aria-controls="settings-tabpanel-1"
              />
              <Tab 
                icon={<PersonIcon />} 
                label="Perfil" 
                iconPosition="start"
                id="settings-tab-2"
                aria-controls="settings-tabpanel-2"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <PreferencesPage />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <OrganizationPage />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <ProfilePage />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}; 