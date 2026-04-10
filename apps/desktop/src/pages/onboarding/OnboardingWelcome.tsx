import React from 'react';
import { Building2, Settings, Database, Users, Zap, Shield, TrendingUp, CheckCircle2 } from 'lucide-react';
import { cn } from 'lib/utils';
import { Card, CardContent } from 'components/ui/card';
import logo from '../../../assets/icons/logo.png';

export const OnboardingWelcome: React.FC = () => {

  const features = [
    {
      icon: Building2,
      title: 'Configurar sua organização',
      description: 'Defina o nome, setor, endereço e contatos da sua empresa',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Settings,
      title: 'Dados fiscais',
      description: 'Configure CNPJ, IE, regime tributário e impostos',
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
    },
    {
      icon: Database,
      title: 'Criar dados de exemplo',
      description: 'Comece com produtos e clientes de exemplo',
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      icon: Users,
      title: 'Convidar membros da equipe',
      description: 'Adicione colaboradores com diferentes permissões',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
    },
  ];

  const benefits = [
    { icon: Zap, text: 'Rápido e eficiente' },
    { icon: Shield, text: 'Seguro e confiável' },
    { icon: TrendingUp, text: 'Crescimento garantido' },
  ];

  return (
    <div className="text-center">
      {/* Header Section */}
      <div className="mb-6">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center">
          <img
            src={logo}
            alt="Stockify Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <h3 className="mb-1 text-2xl font-bold text-primary">
          Bem-vindo ao Stockify
        </h3>
        <p className="mb-3 text-base text-muted-foreground">
          Sua solução completa de gestão de estoque
        </p>
        <p className="mx-auto mb-6 max-w-[600px] text-sm text-muted-foreground">
          Vamos configurar tudo em poucos passos para que você possa começar a
          gerenciar seu estoque de forma eficiente e profissional.
        </p>
      </div>

      {/* Benefits */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {benefits.map((benefit, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm text-muted-foreground"
          >
            <benefit.icon className="h-3.5 w-3.5 text-primary" />
            {benefit.text}
          </span>
        ))}
      </div>

      <div className="mx-auto mb-6 h-px w-full bg-border" />

      {/* Features Grid */}
      <h4 className="mb-4 text-lg font-semibold">
        O que vamos configurar:
      </h4>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <CardContent className="p-5 text-center">
                <div
                  className={cn(
                    'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full',
                    feature.bg
                  )}
                >
                  <Icon className={cn('h-6 w-6', feature.color)} />
                </div>
                <h5 className="mb-1 text-sm font-semibold">
                  {feature.title}
                </h5>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Call to Action */}
      <div className="mt-6">
        <h4 className="mb-1 text-lg font-semibold text-primary">
          Pronto para começar?
        </h4>
        <p className="mb-3 text-sm text-muted-foreground">
          Vamos configurar sua organização em poucos passos simples
        </p>
        <div className="flex items-center justify-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-500">
            Clique em &quot;Próximo&quot; para continuar
          </span>
        </div>
      </div>
    </div>
  );
};
