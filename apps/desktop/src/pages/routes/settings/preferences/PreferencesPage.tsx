import React from 'react';
import { Switch } from 'components/ui/switch';
import { Separator } from 'components/ui/separator';
import { Alert, AlertDescription } from 'components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select';
import { Input } from 'components/ui/input';
import { Field, FieldLabel } from 'components/ui/field';
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
    <div>
      <h3 className="mb-2 scroll-m-20 text-xl font-semibold tracking-tight">
        Preferências do Sistema
      </h3>

      <div className="grid grid-cols-12 gap-6">
        {/* Layout Settings */}
        <div className="col-span-12 md:col-span-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Layout de Navegação
            </p>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <Switch
                  checked={layout === 'navbar'}
                  onCheckedChange={() => setLayout(layout === 'navbar' ? 'sidebar' : 'navbar')}
                  disabled={loading}
                />
                {layout === 'navbar' ? 'Navbar' : 'Sidebar'}
              </label>
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="col-span-12 md:col-span-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Tema
            </p>
            <Field>
              <FieldLabel>Tema</FieldLabel>
              <Select
                value={theme}
                onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Claro</SelectItem>
                  <SelectItem value="dark">Escuro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        {/* Language Settings - Display Only */}
        <div className="col-span-12 md:col-span-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Idioma
            </p>
            <Field>
              <FieldLabel>Idioma</FieldLabel>
              <Input value={language} readOnly />
            </Field>
          </div>
        </div>

        {/* Timezone Settings - Display Only */}
        <div className="col-span-12 md:col-span-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Fuso Horário
            </p>
            <Field>
              <FieldLabel>Fuso Horário</FieldLabel>
              <Input value={timezone} readOnly />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Alert>
          <AlertDescription>
            <p className="text-sm">
              <strong>Dica:</strong> Use Ctrl/Cmd + , para acessar as configurações rapidamente.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};
