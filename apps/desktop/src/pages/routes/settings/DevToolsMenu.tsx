import React, { useState } from 'react';
import { Loader2, RotateCcw, Wrench } from 'lucide-react';
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
import { useAuth } from '../../../context/auth';
import { resetUserOnboarding } from '../../../model/devTools';

const isDevMode = process.env.NODE_ENV === 'development';

export const DevToolsMenu: React.FC = () => {
  const { user } = useAuth();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  if (!isDevMode) {
    return null;
  }

  const handleResetOnboarding = async () => {
    if (!user?.id) return;
    setResetting(true);
    try {
      await resetUserOnboarding(user.id);
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
      setResetting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Wrench className="h-4 w-4" />
            Dev
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2">
          <div className="mb-2 px-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ferramentas de desenvolvedor
          </div>
          <button
            type="button"
            onClick={() => {
              setPopoverOpen(false);
              setConfirmOpen(true);
            }}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
          >
            <RotateCcw className="h-4 w-4 text-amber-600" />
            <div>
              <div className="font-medium">Resetar onboarding</div>
              <div className="text-xs text-muted-foreground">
                Apaga organização e sessão para refazer o fluxo
              </div>
            </div>
          </button>
        </PopoverContent>
      </Popover>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => !resetting && setConfirmOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar onboarding?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação vai apagar a organização atual, todos os seus dados (produtos,
              clientes, fornecedores, unidades, categorias, etc.) e a sessão de onboarding.
              O app será recarregado em seguida. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void handleResetOnboarding();
              }}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {resetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetando...
                </>
              ) : (
                'Resetar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
