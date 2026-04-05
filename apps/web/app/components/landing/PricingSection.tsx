'use client';

import { Card, Title, Text, Button } from '@tremor/react';
import { CheckIcon } from '@heroicons/react/24/outline';

const plans = [
  {
    name: 'Starter',
    price: 'R$ 99',
    period: '/mês',
    description: 'Perfeito para pequenas empresas',
    features: [
      'Até 1.000 produtos',
      'Relatórios básicos',
      'Suporte por email',
      'App mobile incluído',
      'Integração com 3 sistemas'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: 'R$ 199',
    period: '/mês',
    description: 'Ideal para empresas em crescimento',
    features: [
      'Até 10.000 produtos',
      'Relatórios avançados',
      'Suporte prioritário',
      'App mobile incluído',
      'Integração ilimitada',
      'API completa',
      'Alertas personalizados'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    description: 'Para grandes corporações',
    features: [
      'Produtos ilimitados',
      'Relatórios customizados',
      'Suporte 24/7',
      'App mobile incluído',
      'Integração ilimitada',
      'API completa',
      'Alertas personalizados',
      'Treinamento dedicado',
      'SLA garantido'
    ],
    popular: false
  }
];

export default function PricingSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Planos que crescem com você
          </Title>
          <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para o tamanho da sua empresa
          </Text>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`p-8 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  Mais Popular
                </div>
              )}
              
              <Title className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </Title>
              <Text className="text-gray-600 mb-6">
                {plan.description}
              </Text>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-gray-600">
                  {plan.period}
                </span>
              </div>
              
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <Text className="text-gray-700">{feature}</Text>
                  </div>
                ))}
              </div>
              
              <Button 
                className={`w-full py-3 font-semibold transition-all duration-300 transform hover:scale-105 rounded-xl ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    : 'border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 bg-white'
                }`}
              >
                {plan.name === 'Enterprise' ? 'Falar com Vendas' : 'Começar Agora'}
              </Button>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Text className="text-gray-600 mb-4">
            Todos os planos incluem teste gratuito de 14 dias
          </Text>
          <Text className="text-sm text-gray-500">
            Sem cartão de crédito • Cancele a qualquer momento
          </Text>
        </div>
      </div>
    </section>
  );
} 