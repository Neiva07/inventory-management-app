import React from 'react';
import { Trash2 } from 'lucide-react';
import { Switch } from 'components/ui/switch';
import { Alert, AlertDescription } from 'components/ui/alert';
import { Button } from 'components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from 'components/ui/alert-dialog';
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
import { useNavigationMode } from '../../../../context/navigationMode';
import { modKey } from 'lib/platform';
import { useAuth } from '../../../../context/auth';
import { AppSettings, getAppSettings, setAppSettings } from '../../../../model/appSettings';
import type { NavigationMode } from '../../../../lib/navigationKeys';
import { cn } from 'lib/utils';
import { toast } from 'sonner';

export const PreferencesPage = () => {
  const { layout, setLayout, loading } = useUI();
  const { user } = useAuth();
  const { navigationMode, setNavigationMode } = useNavigationMode();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');
  const [language, setLanguage] = React.useState('pt-BR');
  const [timezone, setTimezone] = React.useState('America/Sao_Paulo');
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [resettingLocalData, setResettingLocalData] = React.useState(false);

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

  /** Persist all settings at once so no field is accidentally clobbered. */
  const saveSettings = (overrides: Partial<Omit<AppSettings, 'user_id'>>) => {
    if (!user) return;
    void setAppSettings({
      user_id: user.id,
      layout,
      theme,
      language,
      timezone,
      navigationMode,
      ...overrides,
    });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    saveSettings({ theme: newTheme });
  };

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    saveSettings({ language: newLanguage });
  };

  const handleTimezoneChange = (newTimezone: string) => {
    setTimezone(newTimezone);
    saveSettings({ timezone: newTimezone });
  };

  const handleResetLocalDeviceData = async () => {
    setResettingLocalData(true);
    try {
      await window.electron.resetLocalDeviceData();
    } catch (error) {
      console.error('Failed to reset local device data:', error);
      toast.error('Falha ao resetar os dados locais.');
      setResettingLocalData(false);
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

        {/* Navigation Mode */}
        <div className="col-span-12 md:col-span-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <p className="mb-2 text-base font-medium">
              Navegação entre Campos
            </p>
            <div className="flex gap-3">
              {([
                { value: 'tab' as NavigationMode, label: 'Tab', desc: 'Tab / Shift+Tab' },
                { value: 'enter' as NavigationMode, label: 'Enter', desc: 'Enter / Shift+Enter' },
              ]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNavigationMode(opt.value)}
                  className={cn(
                    'flex-1 rounded-lg border-2 px-4 py-3 text-left transition-all',
                    navigationMode === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/50 hover:bg-muted',
                  )}
                >
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </button>
              ))}
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

        <div className="col-span-12">
          <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-1 text-base font-medium">
                  Resetar somente este dispositivo
                </p>
                <p className="text-sm text-muted-foreground">
                  Remove o banco local, cache e sessão deste computador. A nuvem e outros dispositivos não são apagados.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="w-full gap-2 md:w-auto"
                onClick={() => setResetDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Resetar dados locais
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Alert>
          <AlertDescription>
            <p className="text-sm">
              <strong>Dica:</strong> Use {modKey} + , para acessar as configurações rapidamente.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar dados locais?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação vai apagar somente o banco SQLite local, cache e sessão deste dispositivo. O app será reiniciado e você precisará entrar novamente. Dados já sincronizados na nuvem não serão apagados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resettingLocalData}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={resettingLocalData}
              onClick={(event) => {
                event.preventDefault();
                void handleResetLocalDeviceData();
              }}
            >
              {resettingLocalData ? 'Resetando...' : 'Resetar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
