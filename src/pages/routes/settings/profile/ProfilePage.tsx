import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from 'components/ui/form-compat';
import {
  PhotoCameraIcon,
  SaveIcon,
  EditIcon,
} from 'components/ui/icon-compat';
import { useAuth } from '../../../../context/auth';
import { User } from '../../../../model/auth';

export const ProfilePage = () => {
  const { user, isAuthLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    photoURL: '',
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to a storage service
      // For now, we'll just create a local URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          photoURL: result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real app, you would update the user profile in your backend
      // For now, we'll just simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (err) {
      setError('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        photoURL: user.photoURL || '',
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (isAuthLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Alert severity="warning">
        Nenhum usuário encontrado. Faça login novamente.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Perfil do Usuário
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Photo */}
        <Grid item xs={12} md={4}>
          <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" gutterBottom>
              Foto do Perfil
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={formData.photoURL}
                alt={user.fullName}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  fontSize: '3rem',
                  mb: 2,
                }}
              >
                {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </Avatar>
              
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                  component="label"
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handlePhotoUpload}
                  />
                  <PhotoCameraIcon />
                </IconButton>
              )}
            </Box>

            {isEditing && (
              <Typography variant="body2" color="text.secondary">
                Clique no ícone da câmera para alterar a foto
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper elevation={1} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Informações Pessoais
              </Typography>
              
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                  variant="outlined"
                  size="small"
                >
                  Editar
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    onClick={handleCancel}
                    variant="outlined"
                    size="small"
                  >
                    Cancelar
                  </Button>
                  <Button
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    variant="contained"
                    size="small"
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sobrenome"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  size="small"
                  disabled={!isEditing}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>


      </Grid>
    </Box>
  );
}; 
