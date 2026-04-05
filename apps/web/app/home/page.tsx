'use client';

import { Card, Title, Text, Grid, Col } from '@tremor/react';
import { 
  ArrowRightIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  CubeIcon,
  CurrencyDollarIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const benefits = [
    {
      title: 'Controle em Tempo Real',
      description: 'Acompanhe seu estoque em tempo real, com atualizações instantâneas e relatórios precisos.',
      icon: ChartBarIcon,
    },
    {
      title: 'Mobilidade Total',
      description: 'Acesse seu inventário de qualquer lugar, a qualquer momento, através do nosso aplicativo móvel.',
      icon: DevicePhoneMobileIcon,
    },
    {
      title: 'Automação Inteligente',
      description: 'Automatize processos repetitivos e reduza erros com nossa tecnologia avançada.',
      icon: CloudArrowUpIcon,
    },
  ];

  const features = [
    {
      title: 'Gestão Multi-empresa',
      description: 'Gerencie múltiplas empresas e filiais em uma única plataforma.',
      icon: UserGroupIcon,
    },
    {
      title: 'Integração Global',
      description: 'Conecte-se com fornecedores e parceiros em todo o mundo.',
      icon: GlobeAltIcon,
    },
    {
      title: 'Análise Preditiva',
      description: 'Antecipe tendências e otimize seu estoque com IA avançada.',
      icon: ArrowTrendingUpIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
        <div className="relative px-4 py-32 sm:px-6 sm:py-40 lg:py-48 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Transforme seu Controle de Estoque
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
                Simplifique sua gestão de inventário com uma solução completa, intuitiva e poderosa.
                Aumente sua eficiência e reduza custos operacionais.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Começar Agora
                </button>
                <button className="text-sm font-semibold leading-6 text-white">
                  Ver Demonstração <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Por que escolher o Stockify?
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Uma plataforma completa que revoluciona a forma como você gerencia seu inventário
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <benefit.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {benefit.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{benefit.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Recursos que fazem a diferença
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Tudo que você precisa para uma gestão eficiente do seu inventário
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-56 sm:py-40 lg:px-8">
        <div className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl">
          <div className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Junte-se a milhares de empresas que já transformaram sua gestão de estoque com o Stockify
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Começar Agora
            </button>
            <button className="text-sm font-semibold leading-6 text-gray-900">
              Fale com um consultor <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 