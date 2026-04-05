'use client';

import { Title, Text, Button } from '@tremor/react';
import { ArrowRightIcon, PlayIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <Title className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Gestão de Inventário
            <br />
            Simplificada
          </Title>
          <Text className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8">
            Controle total do seu estoque com uma plataforma intuitiva e poderosa. 
            Acompanhe em tempo real, analise dados e tome decisões inteligentes.
          </Text>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              Começar Gratuitamente
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="secondary"
              className="px-8 py-4 text-lg font-semibold border-2 border-gray-300 hover:border-blue-500 transition-all duration-300 rounded-xl"
            >
              <PlayIcon className="mr-2 h-5 w-5" />
              Ver Demonstração
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
} 