import React from 'react';
import { X } from 'lucide-react';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from 'components/ui';
import { modKey } from 'lib/platform';

interface GlobalKeyboardHelpProps {
  open: boolean;
  onClose: () => void;
}

const ShortcutItem: React.FC<{ shortcut: string; description: string }> = ({ shortcut, description }) => (
  <div className="mb-1.5 flex items-center last:mb-0">
    <Badge className="mr-2 min-w-[80px] justify-center rounded-md bg-primary px-2 py-1 font-semibold text-primary-foreground">
      {shortcut}
    </Badge>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export const GlobalKeyboardHelp: React.FC<GlobalKeyboardHelpProps> = ({
  open,
  onClose,
}) => {
  const globalShortcuts = [
    { shortcut: 'F1', description: 'Mostrar esta ajuda global' },
    { shortcut: `${modKey} + ,`, description: 'Ir para Configurações' },
    { shortcut: `${modKey} + H`, description: 'Ir para o Painel de Controle' },
  ];

  const navigationShortcuts = [
    { shortcut: `${modKey} + 1`, description: 'Lista de Produtos' },
    { shortcut: `${modKey} + 2`, description: 'Criar Produto' },
    { shortcut: `${modKey} + 3`, description: 'Lista de Vendas' },
    { shortcut: `${modKey} + 4`, description: 'Criar Venda' },
    { shortcut: `${modKey} + 5`, description: 'Lista de Compras' },
    { shortcut: `${modKey} + 6`, description: 'Criar Compra' },
    { shortcut: `${modKey} + 7`, description: 'Contas a Pagar' },
    { shortcut: `${modKey} + 8`, description: 'Parcelas' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        className="relative max-h-[85vh] overflow-y-auto sm:max-w-3xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          aria-label="Fechar ajuda global"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="pr-10">
          <DialogTitle className="text-primary">Atalhos Globais do Teclado</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <section>
            <h3 className="mb-2.5 text-base font-bold text-primary">Atalhos Globais</h3>
            {globalShortcuts.map((item, index) => (
              <ShortcutItem key={index} shortcut={item.shortcut} description={item.description} />
            ))}
          </section>

          <section>
            <h3 className="mb-2.5 text-base font-bold text-primary">Navegação Rápida</h3>
            {navigationShortcuts.map((item, index) => (
              <ShortcutItem key={index} shortcut={item.shortcut} description={item.description} />
            ))}
          </section>
        </div>

        <div className="mt-2 rounded-md border bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Os atalhos globais funcionam de qualquer lugar da aplicação, incluindo quando você está digitando em campos de entrada.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
