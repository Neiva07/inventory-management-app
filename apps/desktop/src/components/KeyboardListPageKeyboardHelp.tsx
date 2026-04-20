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

interface ShortcutDef {
  shortcut: string;
  description: string;
}

interface KeyboardListPageKeyboardHelpProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  customShortcuts?: ShortcutDef[];
  showInactivate?: boolean;
}

const ShortcutRow: React.FC<{ shortcut: string; description: string }> = ({
  shortcut,
  description,
}) => (
  <div className="mb-1.5 flex items-center last:mb-0">
    <Badge className="mr-2 min-w-[84px] justify-center rounded-md bg-primary px-2 py-1 font-mono font-bold text-primary-foreground">
      {shortcut}
    </Badge>
    <p className="text-sm text-foreground">{description}</p>
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode; accent?: 'primary' | 'secondary' }> = ({
  children,
  accent = 'primary',
}) => (
  <h3
    className={`mb-2 text-base font-bold ${
      accent === 'secondary' ? 'text-foreground' : 'text-primary'
    }`}
  >
    {children}
  </h3>
);

export const KeyboardListPageKeyboardHelp: React.FC<KeyboardListPageKeyboardHelpProps> = ({
  open,
  onClose,
  title = "Atalhos do Teclado - Listagem",
  customShortcuts = [],
  showInactivate = false,
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        className="relative max-h-[85vh] overflow-y-auto sm:max-w-4xl"
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3"
          aria-label="Fechar ajuda"
        >
          <X className="h-4 w-4" />
        </Button>

        <DialogHeader className="pr-10">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="columns-1 md:columns-2 md:gap-4">
          <section className="mb-3 break-inside-avoid">
            <SectionTitle>Busca e Navegação</SectionTitle>
            <ShortcutRow shortcut={`${modKey} + F`} description="Focar campo de busca" />
            <ShortcutRow shortcut="Tab" description="Próximo campo / botão" />
            <ShortcutRow shortcut="Shift + Tab" description="Campo anterior" />
            <ShortcutRow shortcut={`${modKey} + Escape`} description="Limpar filtros e focar busca" />
          </section>

          <section className="mb-3 break-inside-avoid">
            <SectionTitle>Ações Rápidas</SectionTitle>
            <ShortcutRow shortcut={`${modKey} + N`} description="Criar novo item" />
            <ShortcutRow shortcut={`${modKey} + E`} description="Editar item selecionado" />
            <ShortcutRow shortcut={`${modKey} + D`} description="Deletar item selecionado" />
            {showInactivate && (
              <ShortcutRow
                shortcut={`${modKey} + I`}
                description="Alternar status (ativar/inativar) do item selecionado"
              />
            )}
            <ShortcutRow shortcut={`${modKey} + R`} description="Atualizar dados" />
            <ShortcutRow shortcut={`${modKey} + T`} description="Focar primeira linha da tabela" />
          </section>

          <section className="mb-3 break-inside-avoid">
            <SectionTitle>Navegação na Tabela</SectionTitle>
            <ShortcutRow shortcut="Setas" description="Navegar entre linhas" />
            <ShortcutRow shortcut="Enter" description="Editar linha selecionada" />
            <ShortcutRow shortcut="Delete" description="Deletar linha selecionada" />
            <ShortcutRow shortcut="Espaço" description="Selecionar/desselecionar linha" />
            <ShortcutRow shortcut="Home/End" description="Primeira/última linha" />
          </section>

          <section className="mb-3 break-inside-avoid">
            <SectionTitle>Paginação</SectionTitle>
            <ShortcutRow shortcut={`${modKey} + ←`} description="Página anterior" />
            <ShortcutRow shortcut={`${modKey} + →`} description="Próxima página" />
          </section>

          {customShortcuts.length > 0 && (
            <section className="mb-3 break-inside-avoid">
              <SectionTitle>Ações Específicas</SectionTitle>
              {customShortcuts.map((item, index) => (
                <ShortcutRow
                  key={`${item.shortcut}-${index}`}
                  shortcut={item.shortcut}
                  description={item.description}
                />
              ))}
            </section>
          )}

          <section className="mb-3 break-inside-avoid">
            <SectionTitle>Ajuda</SectionTitle>
            <ShortcutRow shortcut="F1" description="Mostrar esta ajuda" />
          </section>
        </div>

        <section className="mt-0.5">
          <SectionTitle accent="secondary">Atalhos Globais</SectionTitle>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <ShortcutRow shortcut="F1" description="Mostrar ajuda global" />
              <ShortcutRow shortcut={`${modKey} + ,`} description="Ir para Configurações" />
              <ShortcutRow shortcut={`${modKey} + H`} description="Ir para o Painel de Controle" />
            </div>
            <div>
              <ShortcutRow shortcut={`${modKey} + 1`} description="Lista de Produtos" />
              <ShortcutRow shortcut={`${modKey} + 2`} description="Criar Produto" />
              <ShortcutRow shortcut={`${modKey} + 3`} description="Lista de Vendas" />
              <ShortcutRow shortcut={`${modKey} + 4`} description="Criar Venda" />
              <ShortcutRow shortcut={`${modKey} + 5`} description="Lista de Compras" />
              <ShortcutRow shortcut={`${modKey} + 6`} description="Criar Compra" />
              <ShortcutRow shortcut={`${modKey} + 7`} description="Contas a Pagar" />
              <ShortcutRow shortcut={`${modKey} + 8`} description="Parcelas" />
            </div>
          </div>
        </section>

        <div className="mt-1.5 rounded-md border bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            <strong>Dica:</strong> Todos os atalhos funcionam de qualquer lugar, incluindo quando você está digitando em campos de entrada.
          </p>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
