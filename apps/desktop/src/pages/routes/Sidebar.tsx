import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileText,
  Grid3X3,
  HandCoins,
  History,
  LayoutGrid,
  Menu,
  PanelLeftClose,
  Receipt,
  Scale,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  CreditCard,
  ArrowLeftRight,
  CircleDollarSign,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from 'components/ui';
import { cn } from 'lib/utils';
import logo from '../../../assets/icons/logo.png';

const drawerWidth = 270;
const collapsedWidth = 64;

const cadastros = [
  { text: 'Produtos', icon: <LayoutGrid className="h-4 w-4" />, path: '/products/create' },
  { text: 'Clientes', icon: <Users className="h-4 w-4" />, path: '/customers/create' },
  { text: 'Fornecedores', icon: <Users className="h-4 w-4" />, path: '/suppliers/create' },
  { text: 'Funcionários', icon: <Users className="h-4 w-4" />, path: '/employees/create' },
  { text: 'Categoria de Produtos', icon: <Grid3X3 className="h-4 w-4" />, path: '/productCategories' },
  { text: 'Unidades', icon: <Scale className="h-4 w-4" />, path: '/units' },
];

const movimentos = [
  { text: 'Lista de Compras', icon: <FileText className="h-4 w-4" />, path: '/purchase-list' },
  { text: 'Compras de Mercadorias', icon: <ShoppingCart className="h-4 w-4" />, path: '/inbound-orders' },
  { text: 'Requisição de Clientes', icon: <FileText className="h-4 w-4" />, path: '/customer-requests' },
  { text: 'Vendas de Mercadorias', icon: <ShoppingCart className="h-4 w-4" />, path: '/orders' },
  { text: 'Emissão de Recibos', icon: <Receipt className="h-4 w-4" />, path: '/receipts' },
  { text: 'Vales e Adiantamentos', icon: <HandCoins className="h-4 w-4" />, path: '/advances' },
  { text: 'Contas a Receber', icon: <Wallet className="h-4 w-4" />, path: '/accounts-receivable' },
  { text: 'Contas a Pagar', icon: <CircleDollarSign className="h-4 w-4" />, path: '/supplier-bills' },
  { text: 'Movimento Financeiro', icon: <ArrowLeftRight className="h-4 w-4" />, path: '/financial-movements' },
  { text: 'Fluxo das Contas', icon: <Building2 className="h-4 w-4" />, path: '/account-flows' },
  { text: 'Caixa Diário', icon: <CalendarDays className="h-4 w-4" />, path: '/daily-cash' },
  { text: 'Caixa Retroativo', icon: <History className="h-4 w-4" />, path: '/retroactive-cash' },
  { text: 'Fluxo de Caixa', icon: <TrendingUp className="h-4 w-4" />, path: '/cash-flow' },
];

function Section({
  title,
  items,
  open,
  expanded,
  toggle,
  isActive,
  navigate,
}: {
  title: string;
  items: Array<{ text: string; icon: React.ReactNode; path: string }>;
  open: boolean;
  expanded: boolean;
  toggle: () => void;
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}) {
  return (
    <div className="py-1">
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm font-semibold hover:bg-white/10"
      >
        <span className={cn(!open && 'sr-only')}>{title}</span>
        {open ? (expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : null}
      </button>
      {expanded ? (
        <div className="mt-1 space-y-0.5">
          {items.map((item) => (
            <button
              key={item.text}
              type="button"
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-white/10',
                isActive(item.path) && 'bg-primary-foreground/15'
              )}
              title={!open ? item.text : undefined}
            >
              <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>
              {open ? <span className="truncate">{item.text}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [openCadastros, setOpenCadastros] = useState(true);
  const [openMovimentos, setOpenMovimentos] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const width = open ? drawerWidth : collapsedWidth;
  const isActive = (path: string) => location.pathname === path;

  const footerItem = useMemo(
    () => ({ text: 'Configurações', icon: <Settings className="h-4 w-4" />, path: '/settings' }),
    []
  );

  return (
    <div style={{ width }} className="shrink-0">
      <aside
        className="fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-primary text-primary-foreground"
        style={{ width }}
      >
        <div className={cn('flex items-center border-b border-white/15 p-2', open ? 'justify-between' : 'flex-col gap-2')}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={cn('flex min-w-0 items-center rounded-md hover:bg-white/10', open ? 'gap-2 px-1 py-1' : 'justify-center p-1')}
          >
            <img src={logo} alt="Logo" className="h-9 w-auto" />
            {open ? <span className="truncate text-lg font-semibold">Stockify</span> : null}
          </button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((value) => !value)}
            className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            aria-label={open ? 'Recolher menu' : 'Expandir menu'}
          >
            {open ? <PanelLeftClose className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <Section
            title="Cadastros"
            items={cadastros}
            open={open}
            expanded={openCadastros}
            toggle={() => setOpenCadastros((v) => !v)}
            isActive={isActive}
            navigate={navigate}
          />
          <div className="my-2 h-px bg-white/15" />
          <Section
            title="Movimentos"
            items={movimentos}
            open={open}
            expanded={openMovimentos}
            toggle={() => setOpenMovimentos((v) => !v)}
            isActive={isActive}
            navigate={navigate}
          />
        </div>

        <div className="border-t border-white/15 p-2">
          <button
            type="button"
            onClick={() => navigate(footerItem.path)}
            className={cn(
              'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-white/10',
              isActive(footerItem.path) && 'bg-primary-foreground/15'
            )}
            title={!open ? footerItem.text : undefined}
          >
            {footerItem.icon}
            {open ? <span>{footerItem.text}</span> : null}
          </button>
        </div>
      </aside>
    </div>
  );
};
