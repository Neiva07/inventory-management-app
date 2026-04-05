import React, { useMemo, useState } from 'react';
import {
  Building2,
  Grid3X3,
  LogIn,
  LogOut,
  Menu,
  Scale,
  Settings,
  ShoppingCart,
  Users,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from 'context/auth';
import { Button } from 'components/ui';
import logo from '../../../assets/icons/logo.png';

export const Navbar = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = useMemo(
    () => [
      { text: 'Produtos', path: 'products', icon: <Grid3X3 className="h-4 w-4" /> },
      { text: 'Fornecedores', path: 'suppliers', icon: <Users className="h-4 w-4" /> },
      { text: 'Vendas', path: 'orders', icon: <ShoppingCart className="h-4 w-4" /> },
      { text: 'Compras', path: 'inbound-orders', icon: <ShoppingCart className="h-4 w-4" /> },
      { text: 'Contas a Pagar', path: 'supplier-bills', icon: <Building2 className="h-4 w-4" /> },
      { text: 'Parcelas', path: 'installment-payments', icon: <CreditCard className="h-4 w-4" /> },
      { text: 'Clientes', path: 'customers', icon: <Users className="h-4 w-4" /> },
      { text: 'Categoria de Produtos', path: 'productCategories', icon: <Grid3X3 className="h-4 w-4" /> },
      { text: 'Unidades', path: 'units', icon: <Scale className="h-4 w-4" /> },
      { text: 'Configurações', path: 'settings', icon: <Settings className="h-4 w-4" /> },
    ],
    []
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignout = () => {
    auth.logout();
    navigate('login');
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-primary text-primary-foreground shadow-sm">
      <div className="mx-auto flex h-[60px] w-full max-w-[1600px] items-center justify-between gap-3 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-white/10"
          >
            <img src={logo} alt="Logo" className="h-9 w-auto" />
            <span className="hidden text-lg font-semibold md:inline">Stockify</span>
          </button>

          {auth.user ? (
            <nav className="hidden items-center gap-1 md:flex">
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  type="button"
                  variant="ghost"
                  onClick={() => handleNavigation(item.path)}
                  className="h-8 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
                >
                  {item.icon}
                  {item.text}
                </Button>
              ))}
            </nav>
          ) : null}
        </div>

        {auth.user ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
              aria-label="Abrir menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSignout}
              className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" />
              Deslogar
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('login')}
            className="text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
          >
            <LogIn className="h-4 w-4" />
            Logar
          </Button>
        )}
      </div>

      {auth.user && mobileMenuOpen ? (
        <div className="border-t bg-background text-foreground md:hidden">
          <div className="flex flex-col p-2">
            {menuItems.map((item) => (
              <button
                key={item.text}
                type="button"
                onClick={() => handleNavigation(item.path)}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
};
