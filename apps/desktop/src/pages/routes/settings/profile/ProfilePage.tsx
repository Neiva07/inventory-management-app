import React, { useState, useEffect } from 'react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Spinner } from 'components/ui/spinner';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from 'components/ui/avatar';
import { Field, FieldLabel } from 'components/ui/field';
import { Camera, Save, Pencil } from 'lucide-react';
import { useAuth } from '../../../../context/auth';
import { User } from '../../../../model/auth';

export const ProfilePage = () => {
  const { user, isAuthLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    photoURL: '',
  });

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
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Nenhum usuário encontrado. Faça login novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <h3 className="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">
        Perfil do Usuário
      </h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Photo */}
        <div className="col-span-12 md:col-span-4">
          <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
            <p className="mb-2 text-base font-medium">
              Foto do Perfil
            </p>

            <div className="relative inline-block">
              <Avatar className="mb-4 size-[120px] text-3xl">
                <AvatarImage src={formData.photoURL} alt={user.fullName} />
                <AvatarFallback>
                  {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                <label className="absolute bottom-2 right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handlePhotoUpload}
                  />
                  <Camera className="size-4" />
                </label>
              )}
            </div>

            {isEditing && (
              <p className="text-sm text-muted-foreground">
                Clique no ícone da câmera para alterar a foto
              </p>
            )}
          </div>
        </div>

        {/* Profile Information */}
        <div className="col-span-12 md:col-span-8">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-medium">
                Informações Pessoais
              </p>

              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Pencil className="size-4" />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    size="sm"
                  >
                    <Save className="size-4" />
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Nome</FieldLabel>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Sobrenome</FieldLabel>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </div>
              <div className="col-span-12 md:col-span-6">
                <Field>
                  <FieldLabel>Telefone</FieldLabel>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    disabled={!isEditing}
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
