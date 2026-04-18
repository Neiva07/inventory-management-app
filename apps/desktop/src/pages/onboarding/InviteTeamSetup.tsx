import React, { useState } from 'react';
import { Plus, X, Users, User, Building2, Eye, Mail } from 'lucide-react';
import { Card, CardContent } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Button } from 'components/ui/button';
import { cn } from 'lib/utils';
import { useOnboarding } from '../../context/onboarding';
import { isValidEmail } from '../../lib/email';
import { DevFillButton } from '../../dev/useDevFill';
import { makeInviteTeamSetupValues } from '../../dev/formValues';

export const InviteTeamSetup: React.FC = () => {
  const { onboardingData, updateData, setStepValidation } = useOnboarding();
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('operator');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');

  const teamMembers = onboardingData.invitations || [];

  React.useEffect(() => {
    setStepValidation(4, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        return <Building2 className="h-4 w-4" />;
      case 'operator':
        return <User className="h-4 w-4" />;
      case 'viewer':
        return <Eye className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'manager':
        return 'border-red-500 text-red-600';
      case 'operator':
        return 'border-primary text-primary';
      case 'viewer':
        return 'border-emerald-500 text-emerald-600';
      default:
        return 'border-border text-foreground';
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

  const handleDevFill = () => {
    updateData({ invitations: makeInviteTeamSetupValues() });
  };

  return (
    <div>
      {/* Header Section */}
      <div className="text-center mb-8 relative">
        <div className="absolute right-0 top-0">
          <DevFillButton onFill={handleDevFill} />
        </div>
        <div className="mb-4">
          <Users className="h-16 w-16 text-primary mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          Convidar Sua Equipe
        </h2>
        <h3 className="text-lg text-muted-foreground mb-2">
          Colabore com sua equipe na gestão do estoque
        </h3>
        <p className="text-base text-muted-foreground max-w-[600px] mx-auto">
          Convide membros da equipe para colaborar na gestão do seu estoque.
          Você pode pular esta etapa e convidá-los depois.
        </p>
      </div>

      {/* Add Member Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-6">
            Adicionar Membro da Equipe
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Nome Completo
              </label>
              <Input
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (nameError) setNameError('');
                }}
                placeholder="Nome do colega"
                className={cn('h-11', nameError && 'border-red-500 focus-visible:ring-red-500')}
              />
              <div className="min-h-[20px] mt-1">
                {nameError && (
                  <p className="text-sm text-red-500">{nameError}</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Endereço de Email
              </label>
              <Input
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="colega@empresa.com"
                className={cn('h-11', emailError && 'border-red-500 focus-visible:ring-red-500')}
              />
              <div className="min-h-[20px] mt-1">
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="min-w-[140px]">
              <label className="text-sm font-medium mb-1.5 block">
                Função
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="manager">Gerente</option>
                <option value="operator">Operador</option>
                <option value="viewer">Visualizador</option>
              </select>
            </div>
            <div className="pt-6">
              <Button
                onClick={addTeamMember}
                disabled={!newEmail.trim() || !newName.trim() || !!emailError || !!nameError}
                size="lg"
                className="h-11 px-4"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {teamMembers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-6">
            Membros da Equipe ({teamMembers.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {teamMembers.map((member) => (
              <div
                key={member.email}
                className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-0.5 truncate">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-1 truncate">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(member.role)}
                        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(member.role)}`}>
                          {getRoleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeamMember(member.email)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Section */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-6">
            Permissões por Função
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-6 w-6 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-red-500 mb-1">
                  Gerente
                </p>
                <p className="text-sm text-muted-foreground">
                  Acesso completo a todas as funcionalidades, pode gerenciar usuários
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-primary mb-1">
                  Operador
                </p>
                <p className="text-sm text-muted-foreground">
                  Criar e editar dados, gerenciamento limitado de usuários
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="h-6 w-6 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-emerald-600 mb-1">
                  Visualizador
                </p>
                <p className="text-sm text-muted-foreground">
                  Acesso somente leitura aos dados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
