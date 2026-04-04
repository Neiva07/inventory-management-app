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

interface ShortcutDef {
  shortcut: string;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  showVariants?: boolean;
  customShortcuts?: ShortcutDef[];
}

const ShortcutRow = ({ shortcut, description }: { shortcut: string; description: string }) => (
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

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  open,
  onClose,
  title = "Atalhos do Teclado",
  showVariants = false,
  customShortcuts = [],
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
            <SectionTitle>Ações do Formulário</SectionTitle>
            <ShortcutRow shortcut="Ctrl/Cmd + Enter" description="Enviar formulário" />
            <ShortcutRow shortcut="Ctrl/Cmd + D" description="Deletar (modo edição)" />
            <ShortcutRow shortcut="Ctrl/Cmd + I" description="Inativar/Ativar" />
            <ShortcutRow shortcut="Ctrl/Cmd + R" description="Resetar formulário" />
            <ShortcutRow shortcut="Ctrl/Cmd + T" description="Alternar modo de criação" />
          </section>

          {showVariants && (
            <section className="mb-3 break-inside-avoid">
              <SectionTitle>Variantes</SectionTitle>
              <ShortcutRow shortcut="Ctrl/Cmd + O" description="Adicionar nova variante" />
              <ShortcutRow shortcut="Ctrl/Cmd + P" description="Adicionar novo preço" />
            </section>
          )}

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
            <SectionTitle>Navegação</SectionTitle>
            <ShortcutRow shortcut="Ctrl/Cmd + ←" description="Voltar à página anterior" />
            <ShortcutRow shortcut="Tab" description="Próximo campo / Selecionar opção no dropdown" />
            <ShortcutRow shortcut="Shift + Tab" description="Campo anterior" />
            <ShortcutRow shortcut="Setas" description="Navegar opções do dropdown" />
            <ShortcutRow shortcut="Enter/Espaço" description="Selecionar opção do dropdown" />
            <ShortcutRow shortcut="Escape" description="Fechar dropdown" />
          </section>

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
              <ShortcutRow shortcut="Ctrl/Cmd + ," description="Ir para Configurações" />
              <ShortcutRow shortcut="Ctrl/Cmd + H" description="Ir para o Painel de Controle" />
            </div>
            <div>
              <ShortcutRow shortcut="Ctrl/Cmd + 1" description="Lista de Produtos" />
              <ShortcutRow shortcut="Ctrl/Cmd + 2" description="Criar Produto" />
              <ShortcutRow shortcut="Ctrl/Cmd + 3" description="Lista de Vendas" />
              <ShortcutRow shortcut="Ctrl/Cmd + 4" description="Criar Venda" />
              <ShortcutRow shortcut="Ctrl/Cmd + 5" description="Lista de Compras" />
              <ShortcutRow shortcut="Ctrl/Cmd + 6" description="Criar Compra" />
              <ShortcutRow shortcut="Ctrl/Cmd + 7" description="Contas a Pagar" />
              <ShortcutRow shortcut="Ctrl/Cmd + 8" description="Parcelas" />
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
