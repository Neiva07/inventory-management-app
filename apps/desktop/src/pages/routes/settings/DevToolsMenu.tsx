import React, { useState } from 'react';
import {
  AlertTriangle,
  Clipboard,
  Croissant,
  Download,
  Gauge,
  Loader2,
  PackageX,
  Receipt,
  RotateCcw,
  Sprout,
  Trash2,
  Wrench,
} from 'lucide-react';
import { Button } from 'components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
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
import { toast } from 'sonner';
import { useAuth } from '../../../context/auth';
import {
  resetUserOnboarding,
  seedOutOfStockProducts,
  seedOverdueBills,
  seedSmallBakery,
  wipeOrganizationData,
} from '../../../model/devTools';
import { isDev } from '../../../lib/env';

type ActionId =
  | 'resetOnboarding'
  | 'wipeOrgData'
  | 'seedSmallBakery'
  | 'seedOverdueBills'
  | 'seedOutOfStock'
  | 'exportCurrentLaunch'
  | 'exportLast24h'
  | 'elevateLogVerbosity'
  | 'copyRuntimeIds';

interface ActionConfig {
  id: ActionId;
  icon: React.ReactNode;
  label: string;
  description: string;
  destructive: boolean;
  confirmTitle?: string;
  confirmDescription?: string;
}

const actionConfigs: ActionConfig[] = [
  {
    id: 'resetOnboarding',
    icon: <RotateCcw className="h-4 w-4 text-amber-600" />,
    label: 'Resetar onboarding',
    description: 'Apaga organização e sessão para refazer o fluxo',
    destructive: true,
    confirmTitle: 'Resetar onboarding?',
    confirmDescription:
      'Esta ação vai apagar a organização atual, todos os seus dados e a sessão de onboarding. O app será recarregado em seguida. Esta ação não pode ser desfeita.',
  },
  {
    id: 'wipeOrgData',
    icon: <Trash2 className="h-4 w-4 text-red-600" />,
    label: 'Limpar organização via sync',
    description: 'Dev-only: enfileira deletes para produtos, clientes, pedidos, etc.',
    destructive: true,
    confirmTitle: 'Limpar organização via sync?',
    confirmDescription:
      'Esta ação de desenvolvimento apaga produtos, clientes, fornecedores, pedidos, entradas, contas e unidades/categorias da organização atual usando deletes sincronizados. A organização e seu acesso são mantidos.',
  },
  {
    id: 'seedSmallBakery',
    icon: <Croissant className="h-4 w-4 text-emerald-600" />,
    label: 'Semear pequena padaria',
    description: 'Cria unidades, categorias, fornecedores, clientes, produtos e pedidos',
    destructive: false,
  },
  {
    id: 'seedOverdueBills',
    icon: <Receipt className="h-4 w-4 text-orange-600" />,
    label: 'Semear contas vencidas',
    description: 'Cria algumas contas a pagar com vencimento no passado',
    destructive: false,
  },
  {
    id: 'seedOutOfStock',
    icon: <PackageX className="h-4 w-4 text-indigo-600" />,
    label: 'Semear produtos em falta',
    description: 'Cria alguns produtos abaixo do estoque mínimo',
    destructive: false,
  },
  {
    id: 'exportCurrentLaunch',
    icon: <Download className="h-4 w-4 text-sky-600" />,
    label: 'Exportar logs do launch atual',
    description: 'Salva um JSON com os logs desta execução',
    destructive: false,
  },
  {
    id: 'exportLast24h',
    icon: <Download className="h-4 w-4 text-cyan-600" />,
    label: 'Exportar logs das últimas 24h',
    description: 'Salva um JSON com diagnósticos recentes',
    destructive: false,
  },
  {
    id: 'elevateLogVerbosity',
    icon: <Gauge className="h-4 w-4 text-violet-600" />,
    label: 'Elevar verbosidade no próximo launch',
    description: 'Marca o próximo início para diagnóstico detalhado',
    destructive: false,
  },
  {
    id: 'copyRuntimeIds',
    icon: <Clipboard className="h-4 w-4 text-slate-600" />,
    label: 'Copiar launchId e deviceId',
    description: 'Copia os identificadores atuais de logging',
    destructive: false,
  },
];

const runLabelMap: Record<ActionId, string> = {
  resetOnboarding: 'Resetando...',
  wipeOrgData: 'Limpando...',
  seedSmallBakery: 'Semeando...',
  seedOverdueBills: 'Semeando...',
  seedOutOfStock: 'Semeando...',
  exportCurrentLaunch: 'Exportando...',
  exportLast24h: 'Exportando...',
  elevateLogVerbosity: 'Atualizando...',
  copyRuntimeIds: 'Copiando...',
};

export const DevToolsMenu: React.FC = () => {
  const { user, organization } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ActionId | null>(null);
  const [running, setRunning] = useState<ActionId | null>(null);

  if (!isDev) {
    return null;
  }

  const runAction = async (id: ActionId): Promise<void> => {
    if (!user?.id) return;

    setRunning(id);
    try {
      switch (id) {
        case 'resetOnboarding':
          await resetUserOnboarding(user.id);
          window.location.reload();
          return;
        case 'wipeOrgData':
          if (!organization?.id) {
            toast.error('Nenhuma organização ativa para limpar.');
            return;
          }
          await wipeOrganizationData(organization.id);
          window.location.reload();
          return;
        case 'seedSmallBakery':
          if (!organization?.id) {
            toast.error('Nenhuma organização ativa para semear.');
            return;
          }
          await seedSmallBakery({ userId: user.id, organizationId: organization.id });
          toast.success('Dados da pequena padaria semeados');
          window.location.reload();
          return;
        case 'seedOverdueBills':
          if (!organization?.id) {
            toast.error('Nenhuma organização ativa para semear.');
            return;
          }
          await seedOverdueBills({ userId: user.id, organizationId: organization.id });
          toast.success('Contas vencidas semeadas');
          window.location.reload();
          return;
        case 'seedOutOfStock':
          if (!organization?.id) {
            toast.error('Nenhuma organização ativa para semear.');
            return;
          }
          await seedOutOfStockProducts({ userId: user.id, organizationId: organization.id });
          toast.success('Produtos em falta semeados');
          window.location.reload();
          return;
        case 'exportCurrentLaunch': {
          const result = await window.electron.exportDiagnostics({ scope: 'current-launch' });
          if (result.filePath) {
            toast.success('Logs do launch atual exportados');
          }
          return;
        }
        case 'exportLast24h': {
          const result = await window.electron.exportDiagnostics({ scope: 'last-24h' });
          if (result.filePath) {
            toast.success('Logs das últimas 24h exportados');
          }
          return;
        }
        case 'elevateLogVerbosity':
          await window.electron.elevateRuntimeLogVerbosityForNextLaunch();
          toast.success('Verbosidade elevada para o próximo launch');
          return;
        case 'copyRuntimeIds': {
          const context = await window.electron.getLaunchContext();
          await navigator.clipboard.writeText(`launchId=${context.launchId}\ndeviceId=${context.deviceId}`);
          toast.success('IDs de runtime copiados');
          return;
        }
      }
    } catch (error) {
      console.error(`Failed to run dev action ${id}:`, error);
      toast.error('Falha ao executar ação de desenvolvedor');
    } finally {
      setRunning(null);
      setPendingAction(null);
    }
  };

  const handleActionClick = (config: ActionConfig) => {
    setPopoverOpen(false);
    if (config.destructive) {
      setPendingAction(config.id);
    } else {
      void runAction(config.id);
    }
  };

  const handleConfirm = () => {
    if (pendingAction) {
      void runAction(pendingAction);
    }
  };

  const activeConfirmConfig = pendingAction
    ? actionConfigs.find((c) => c.id === pendingAction) ?? null
    : null;

  const isRunning = running !== null;

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wrench className="h-4 w-4" />
            Dev
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-2">
          <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sprout className="h-3 w-3" />
            Ferramentas de desenvolvedor
          </div>
          {actionConfigs.map((config) => (
            <button
              key={config.id}
              type="button"
              onClick={() => handleActionClick(config)}
              disabled={isRunning}
              className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
            >
              <span className="mt-0.5">{config.icon}</span>
              <div>
                <div className="font-medium">{config.label}</div>
                <div className="text-xs text-muted-foreground">{config.description}</div>
              </div>
            </button>
          ))}
          <div className="mt-2 flex items-center gap-1.5 border-t px-2 pt-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            Visível apenas em modo de desenvolvimento
          </div>
        </PopoverContent>
      </Popover>

      <AlertDialog
        open={activeConfirmConfig !== null}
        onOpenChange={(open) => !isRunning && !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{activeConfirmConfig?.confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {activeConfirmConfig?.confirmDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRunning}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirm();
              }}
              disabled={isRunning}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRunning && running ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {runLabelMap[running]}
                </>
              ) : (
                'Confirmar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
