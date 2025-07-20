import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Chip, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Card,
  CardContent,
  Grid,
  Paper,
  Divider,
  Avatar
} from '@mui/material';
import { 
  Add as AddIcon, 
  Close as CloseIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useOnboarding } from '../../context/onboarding';
import { isValidEmail } from '../../lib/email';

interface TeamMember {
  email: string;
  role: string;
  name: string;
}

export const InviteTeamSetup: React.FC = () => {
  const { onboardingData, updateData, onboardingSession } = useOnboarding();
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('operator');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  const teamMembers = onboardingData.invitations || [];

  const addTeamMember = () => {
    // Validate name
    if (!newName.trim()) {
      setNameError('Nome é obrigatório');
      return;
    }
    
    // Validate email
    if (!newEmail.trim()) {
      setEmailError('Email é obrigatório');
      return;
    }
    
    if (!isValidEmail(newEmail.trim())) {
      setEmailError('Digite um email válido');
      return;
    }
    
    if (teamMembers.find(member => member.email === newEmail.trim())) {
      setEmailError('Este email já foi adicionado');
      return;
    }
    
    // Clear any previous errors
    setEmailError('');
    setNameError('');
    
    const newMember = {
      email: newEmail.trim(),
      name: newName.trim(),
      role: newRole,
    };
    
    const updatedInvitations = [...(onboardingData.invitations || []), newMember];
    
    updateData({
      invitations: updatedInvitations,
    });
    
    setNewEmail('');
    setNewName('');
    setNewRole('operator');
  };

  const removeTeamMember = (email: string) => {
    const updatedInvitations = teamMembers.filter(member => member.email !== email);
    
    updateData({
      invitations: updatedInvitations,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return <BusinessIcon sx={{ fontSize: 16 }} />;
      case 'operator':
        return <PersonIcon sx={{ fontSize: 16 }} />;
      case 'viewer':
        return <VisibilityIcon sx={{ fontSize: 16 }} />;
      default:
        return <PersonIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'error';
      case 'operator':
        return 'primary';
      case 'viewer':
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Gerente';
      case 'operator':
        return 'Operador';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ mb: 2 }}>
          <GroupIcon sx={{ fontSize: 64, color: 'primary.main' }} />
        </Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
          Convidar Sua Equipe
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Colabore com sua equipe na gestão do estoque
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto', color: 'text.secondary' }}>
          Convide membros da equipe para colaborar na gestão do seu estoque. 
          Você pode pular esta etapa e convidá-los depois.
        </Typography>
      </Box>

      {/* Add Member Section */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Adicionar Membro da Equipe
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nome Completo"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  // Clear error when user starts typing
                  if (nameError) setNameError('');
                }}
                placeholder="Nome do colega"
                error={!!nameError}
                fullWidth
                size="medium"
              />
              <Box sx={{ minHeight: 20, mt: 0.5 }}>
                {nameError && (
                  <FormHelperText error sx={{ margin: 0 }}>
                    {nameError}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Endereço de Email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  // Clear error when user starts typing
                  if (emailError) setEmailError('');
                }}
                placeholder="colega@empresa.com"
                error={!!emailError}
                fullWidth
                size="medium"
              />
              <Box sx={{ minHeight: 20, mt: 0.5 }}>
                {emailError && (
                  <FormHelperText error sx={{ margin: 0 }}>
                    {emailError}
                  </FormHelperText>
                )}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl sx={{ minWidth: 140 }} size="medium">
              <InputLabel>Função</InputLabel>
              <Select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                label="Função"
              >
                <MenuItem value="manager">Gerente</MenuItem>
                <MenuItem value="operator">Operador</MenuItem>
                <MenuItem value="viewer">Visualizador</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={addTeamMember}
              disabled={!newEmail.trim() || !newName.trim() || !!emailError || !!nameError}
              startIcon={<AddIcon />}
              size="large"
              sx={{ 
                minHeight: 56,
                px: 3
              }}
            >
              Adicionar
            </Button>
          </Box>
        </CardContent>
      </Card>

      {teamMembers.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Membros da Equipe ({teamMembers.length})
          </Typography>
          <Grid container spacing={2}>
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} key={member.email}>
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 2, 
                    borderRadius: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                        <EmailIcon />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                          {member.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {member.email}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRoleIcon(member.role)}
                          <Chip
                            label={getRoleLabel(member.role)}
                            color={getRoleColor(member.role) as any}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => removeTeamMember(member.email)}
                      sx={{ 
                        minWidth: 'auto',
                        p: 1,
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.light' }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Permissions Section */}
      <Card sx={{ borderRadius: 2, bgcolor: 'grey.50' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
            Permissões por Função
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <BusinessIcon sx={{ color: 'error.main', fontSize: 24, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main', mb: 1 }}>
                    Gerente
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acesso completo a todas as funcionalidades, pode gerenciar usuários
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <PersonIcon sx={{ color: 'primary.main', fontSize: 24, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                    Operador
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Criar e editar dados, gerenciamento limitado de usuários
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <VisibilityIcon sx={{ color: 'success.main', fontSize: 24, mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'success.main', mb: 1 }}>
                    Visualizador
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Acesso somente leitura aos dados
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}; 