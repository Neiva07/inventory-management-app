import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { getOrganization, Organization } from '../../model/organization';
import {
  searchOrganizations,
  createJoinRequest,
  validateInvitationCode,
  useInvitationCode,
} from '../../model/organizationInvite';
import { createUserMembership } from '../../model/userMembership';
import { useAuth } from '../../context/auth';
import { useOnboarding } from '../../context/onboarding';

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
      id={`org-selection-tabpanel-${index}`}
      aria-labelledby={`org-selection-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface OrganizationSelectionProps {
  onOrganizationSelected: () => void;
  onCreateNewOrganization: () => void;
}

export const OrganizationSelection: React.FC<OrganizationSelectionProps> = ({
  onOrganizationSelected,
  onCreateNewOrganization,
}) => {
  const { user } = useAuth();
  const { updateData } = useOnboarding();
  const [tabValue, setTabValue] = useState(0);
  const [invitationCode, setInvitationCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleInvitationCodeSubmit = async () => {
    if (!invitationCode.trim() || !user?.id) {
      setError('Por favor, insira um código de convite');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const invitationCodeRecord = await validateInvitationCode(invitationCode.trim().toUpperCase());
      if (!invitationCodeRecord) {
        setError('Código de convite inválido ou expirado');
        return;
      }

      const organization = await getOrganization(invitationCodeRecord.organizationId);
      if (!organization) {
        setError('Organização do convite não encontrada');
        return;
      }

      await createUserMembership({
        userID: user.id,
        organizationId: organization.id,
        role: invitationCodeRecord.role,
      });

      await useInvitationCode(invitationCodeRecord.id);

      setSuccess(`Convite aceito! Bem-vindo à ${organization.name}`);
      onOrganizationSelected();
    } catch (error) {
      setError('Erro ao validar código de convite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchOrganizations = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchOrganizations(searchTerm.trim());
      // Filter for exact name match for security
      const exactMatches = results.filter(org => 
        org.name.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      setSearchResults(exactMatches);
    } catch (error) {
      setError('Erro ao buscar organizações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (organizationId: string, organizationName: string) => {
    if (!user?.id) return;
    if (!user.email) {
      setError('Não foi possível identificar seu email para enviar a solicitação.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await createJoinRequest(
        organizationId,
        user.id,
        user.email,
        `Solicitação de entrada em ${organizationName}`
      );
      setSuccess(`Solicitação enviada para ${organizationName}. Aguarde a aprovação.`);
    } catch (error) {
      setError('Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewOrganization = () => {
    // Set onboarding data to indicate new organization creation
    updateData({
      organization: {
        name: '',
        domain: '',
        employeeCount: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        organizationPhoneNumber: '',
        organizationEmail: '',
        pocName: '',
        pocRole: '',
        pocPhoneNumber: '',
        pocEmail: '',
      },
    });
    onCreateNewOrganization();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Selecione sua Organização
      </Typography>
      
      <Typography variant="body1" paragraph align="center" color="text.secondary">
        Junte-se a uma organização existente ou crie uma nova
      </Typography>

      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="organization selection tabs">
              <Tab 
                icon={<BusinessIcon />} 
                label="Código de Convite" 
                iconPosition="start"
              />
              <Tab 
                icon={<SearchIcon />} 
                label="Buscar Organização" 
                iconPosition="start"
              />
              <Tab 
                icon={<AddIcon />} 
                label="Criar Nova" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Código de Convite
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              Digite o código de convite fornecido pela sua organização
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <TextField
                fullWidth
                label="Código de Convite"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="ex: ABC123"
                disabled={isLoading}
              />
              <Button
                variant="outlined"
                onClick={handleInvitationCodeSubmit}
                disabled={isLoading || !invitationCode.trim()}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Validar'}
              </Button>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Buscar Organização
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              Procure por organizações públicas para solicitar entrada
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
              <TextField
                fullWidth
                label="Nome da Organização"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome da organização"
                disabled={isLoading}
              />
              <Button
                variant="outlined"
                onClick={handleSearchOrganizations}
                disabled={isLoading || !searchTerm.trim()}
                startIcon={<SearchIcon />}
                sx={{ minWidth: 120 }}
              >
                Buscar
              </Button>
            </Box>

            {searchResults.length > 0 && (
              <List>
                {searchResults.map((org) => (
                  <ListItem key={org.id} divider>
                    <ListItemText
                      primary={org.name}
                      secondary={org.domain ? `Domínio: ${org.domain}` : 'Sem domínio'}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleJoinRequest(org.id, org.name)}
                        disabled={isLoading}
                        startIcon={<GroupIcon />}
                      >
                        Solicitar Entrada
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}

            {searchResults.length === 0 && hasSearched && !isLoading && (
              <Alert severity="info">
                Nenhuma organização encontrada com esse nome
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Criar Nova Organização
            </Typography>
            <Typography variant="body2" paragraph color="text.secondary">
              Crie uma nova organização e comece a gerenciar seu estoque
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateNewOrganization}
              startIcon={<AddIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Criar Nova Organização
            </Button>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}; 
