import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'components/ui/card';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { cn } from 'lib/utils';
import {
  Search,
  Plus,
  Building2,
  QrCode,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
} from 'lucide-react';
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

type TabId = 'invite' | 'search' | 'create';

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'invite', label: 'Código de Convite', icon: QrCode },
  { id: 'search', label: 'Buscar', icon: Search },
  { id: 'create', label: 'Criar Nova', icon: Plus },
];

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
  const [activeTab, setActiveTab] = useState<TabId>('invite');
  const [invitationCode, setInvitationCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Organization[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const switchTab = (tab: TabId) => {
    setActiveTab(tab);
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
        role: 'operator',
      });

      await useInvitationCode(invitationCodeRecord.id);

      setSuccess(`Convite aceito! Bem-vindo à ${organization.name}`);
      onOrganizationSelected();
    } catch {
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
      const exactMatches = results.filter(org =>
        org.name.toLowerCase() === searchTerm.trim().toLowerCase()
      );
      setSearchResults(exactMatches);
    } catch {
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
        `Solicitação de entrada em ${organizationName}`
      );
      setSuccess(`Solicitação enviada para ${organizationName}. Aguarde a aprovação.`);
    } catch {
      setError('Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewOrganization = () => {
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
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Selecione sua Organização
        </h1>
        <p className="text-muted-foreground mt-2">
          Junte-se a uma organização existente ou crie uma nova
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive mb-4">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 text-green-700 mb-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {/* Invite Code Tab */}
      {activeTab === 'invite' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Código de Convite</CardTitle>
            <CardDescription>
              Digite o código de convite fornecido pela sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                placeholder="ex: ABC123"
                disabled={isLoading}
                className="flex-1 uppercase tracking-widest text-center font-mono text-lg h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleInvitationCodeSubmit()}
              />
              <Button
                onClick={handleInvitationCodeSubmit}
                disabled={isLoading || !invitationCode.trim()}
                className="h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Validar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Tab */}
      {activeTab === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar Organização</CardTitle>
            <CardDescription>
              Procure por organizações públicas para solicitar entrada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome exato da organização"
                disabled={isLoading}
                className="flex-1 h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchOrganizations()}
              />
              <Button
                variant="outline"
                onClick={handleSearchOrganizations}
                disabled={isLoading || !searchTerm.trim()}
                className="h-12 px-6"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{org.name}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleJoinRequest(org.id, org.name)}
                      disabled={isLoading}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Solicitar Entrada
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && hasSearched && !isLoading && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma organização encontrada com esse nome
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Tab */}
      {activeTab === 'create' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Criar Nova Organização</CardTitle>
            <CardDescription>
              Crie uma nova organização e comece a gerenciar seu estoque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Você será o administrador da nova organização e poderá convidar membros depois
              </p>
              <Button
                size="lg"
                onClick={handleCreateNewOrganization}
                className="px-8"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Nova Organização
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
