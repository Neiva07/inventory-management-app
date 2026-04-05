'use client';

import { Card, Title, Text } from '@tremor/react';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Gerente de Operações',
    company: 'TechCorp Brasil',
    content: 'O Stockify revolucionou nossa gestão de estoque. Agora temos controle total e visibilidade em tempo real.',
    rating: 5
  },
  {
    name: 'João Santos',
    role: 'Diretor de Logística',
    company: 'LogiExpress',
    content: 'A integração foi simples e os relatórios são incríveis. Economizamos 30% em perdas de estoque.',
    rating: 5
  },
  {
    name: 'Ana Costa',
    role: 'CEO',
    company: 'StartupXYZ',
    content: 'Perfeito para nossa startup. Interface intuitiva e suporte excepcional. Recomendo fortemente!',
    rating: 5
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Title className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            O que nossos clientes dizem
          </Title>
          <Text className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empresas de todos os tamanhos confiam no Stockify para gerenciar seu inventário
          </Text>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-8 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
              <Text className="text-gray-700 mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </Text>
              <div>
                <Title className="text-lg font-semibold text-gray-900">
                  {testimonial.name}
                </Title>
                <Text className="text-gray-600">
                  {testimonial.role} • {testimonial.company}
                </Text>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 