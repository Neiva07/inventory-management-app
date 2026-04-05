'use client';

import { Title, Text, Button } from '@tremor/react';
import { ArrowRightIcon, PlayIcon, CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import { ChartBarIcon, DevicePhoneMobileIcon, CogIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import PricingSection from '../components/landing/PricingSection';
import HeroSection from '../components/landing/HeroSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Title className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Tudo que você precisa em um só lugar
            </Title>
            <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma solução completa para gerenciar seu inventário de forma eficiente e inteligente
            </Text>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <Title className="text-xl font-semibold mb-3">Analytics Avançados</Title>
              <Text className="text-gray-600">
                Visualize dados em tempo real com gráficos interativos e relatórios detalhados
              </Text>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <DevicePhoneMobileIcon className="h-6 w-6 text-white" />
              </div>
              <Title className="text-xl font-semibold mb-3">App Mobile</Title>
              <Text className="text-gray-600">
                Acesse seu inventário de qualquer lugar com nosso aplicativo móvel
              </Text>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <CogIcon className="h-6 w-6 text-white" />
              </div>
              <Title className="text-xl font-semibold mb-3">Integração Fácil</Title>
              <Text className="text-gray-600">
                Conecte com seus sistemas existentes através de APIs simples
              </Text>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <Title className="text-xl font-semibold mb-3">Segurança Total</Title>
              <Text className="text-gray-600">
                Seus dados protegidos com criptografia de ponta a ponta
              </Text>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Title className="text-3xl font-bold text-gray-900 mb-4">
              Confiado por empresas em todo o Brasil
            </Title>
            <Text className="text-lg text-gray-600">
              Mais de 1.000 empresas já confiam em nossa solução
            </Text>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1.000+</div>
              <Text className="text-gray-600">Empresas Ativas</Text>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50.000+</div>
              <Text className="text-gray-600">Produtos Gerenciados</Text>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
              <Text className="text-gray-600">Uptime Garantido</Text>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Product Showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Title className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Dashboard Intuitivo
              </Title>
              <Text className="text-xl text-gray-600 mb-8">
                Visualize todos os dados importantes em um só lugar. Nosso dashboard 
                oferece uma visão clara e organizada do seu inventário.
              </Text>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckIcon className="h-6 w-6 text-green-500 mr-3" />
                  <Text className="text-gray-700">Relatórios em tempo real</Text>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-6 w-6 text-green-500 mr-3" />
                  <Text className="text-gray-700">Alertas automáticos de estoque</Text>
                </div>
                <div className="flex items-center">
                  <CheckIcon className="h-6 w-6 text-green-500 mr-3" />
                  <Text className="text-gray-700">Análise de tendências</Text>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 h-80 flex items-center justify-center">
                <Text className="text-gray-500 text-center">
                  Dashboard Preview
                  <br />
                  (Screenshot do sistema)
                </Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <Title className="text-4xl font-bold text-white mb-6">
            Comece a gerenciar seu inventário hoje
          </Title>
          <Text className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já transformaram sua gestão de estoque
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="px-8 py-4 text-lg font-semibold bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              Teste Gratuito por 14 Dias
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 rounded-xl"
            >
              Falar com Vendas
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Image
                src="/logo_purple_blue.svg"
                alt="Stockify Logo"
                width={120}
                height={120}
                className="h-12 w-auto mb-4"
              />
              <Text className="text-gray-400">
                A solução completa para gestão de inventário
              </Text>
            </div>
            <div>
              <Title className="text-lg font-semibold mb-4">Produto</Title>
              <div className="space-y-2">
                <Text className="text-gray-400 hover:text-white cursor-pointer">Recursos</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Preços</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Integrações</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">API</Text>
              </div>
            </div>
            <div>
              <Title className="text-lg font-semibold mb-4">Empresa</Title>
              <div className="space-y-2">
                <Text className="text-gray-400 hover:text-white cursor-pointer">Sobre</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Blog</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Carreiras</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Contato</Text>
              </div>
            </div>
            <div>
              <Title className="text-lg font-semibold mb-4">Suporte</Title>
              <div className="space-y-2">
                <Text className="text-gray-400 hover:text-white cursor-pointer">Central de Ajuda</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Documentação</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Status</Text>
                <Text className="text-gray-400 hover:text-white cursor-pointer">Comunidade</Text>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <Text className="text-gray-400">
              © 2024 Stockify. Todos os direitos reservados.
            </Text>
          </div>
        </div>
      </footer>
    </div>
  );
} 