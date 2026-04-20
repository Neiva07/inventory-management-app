import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleHelp, Plus, Search } from 'lucide-react';

import { ShadcnFoundationSmoke } from 'components/ui/ShadcnFoundationSmoke';
import { OfflineIndicator } from 'components/OfflineIndicator';
import {
  Button,
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'components/ui';

type GuideProps = {
  title: string;
  description: string;
  link1: string;
  link2?: string;
  createButtonText?: string;
};

const GuideCard = ({ title, description, link1, link2, createButtonText }: GuideProps) => {
  const navigate = useNavigate();

  return (
    <Card className="flex h-full flex-col border transition-transform duration-200 hover:-translate-y-1 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-4">
        <button
          type="button"
          onClick={() => navigate(link1)}
          className="flex flex-1 flex-col items-start text-left"
        >
          <h2 className="mb-2 text-xl font-semibold text-primary">{title}</h2>
          <p className="min-h-[3em] text-sm leading-6 text-muted-foreground">{description}</p>
        </button>

        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => navigate(link1)}
            className="text-primary"
          >
            <Search className="h-4 w-4" />
            Consultar
          </Button>
          {link2 ? (
            <Button type="button" size="sm" variant="outline" onClick={() => navigate(link2)}>
              <Plus className="h-4 w-4" />
              {createButtonText ?? 'Cadastrar'}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export const Home = () => {
  const handleShowHelp = () => {
    const f1Event = new KeyboardEvent('keydown', {
      key: 'F1',
      code: 'F1',
      keyCode: 112,
      which: 112,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(f1Event);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4">
      <OfflineIndicator />
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-3xl font-bold text-primary">Painel de Controle</h1>
          <p className="text-base text-muted-foreground">
            Gerencie seu inventário de forma eficiente
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="icon" onClick={handleShowHelp}>
                <CircleHelp className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Atalhos do Teclado (F1)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <GuideCard title="Produtos" description="Cadastre, consulte, edite e delete seus produtos" link1="products" link2="products/create" />
        <GuideCard title="Fornecedores" description="Cadastre, consulte, edite e delete seus fornecedores" link1="suppliers" link2="suppliers/create" />
        <GuideCard title="Clientes" description="Cadastre, consulte, edite e delete seus clientes" link1="customers" link2="customers/create" />
        <GuideCard title="Vendas" description="Crie, consulte, edite e delete suas vendas" link1="orders" link2="orders/create" />
        <GuideCard title="Compras" description="Crie, consulte, edite e delete suas compras" link1="inbound-orders" link2="inbound-orders/create" />
        <GuideCard title="Contas a Pagar" description="Gerencie suas contas a pagar e parcelamentos" link1="supplier-bills" link2="installment-payments" createButtonText="Parcelas" />
        <GuideCard title="Categoria de Produtos" description="Cadastre e consulte as categorias de produtos" link1="productCategories" />
        <GuideCard title="Unidade de Produtos" description="Cadastre e consulte suas unidades de produtos" link1="units" />
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div style={{ display: 'none' }}>
          <ShadcnFoundationSmoke />
        </div>
      )}
    </div>
  );
};
