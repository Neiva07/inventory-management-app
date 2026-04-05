'use client';

import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels, Switch, Select, SelectItem } from '@tremor/react';
import { useUser } from '@clerk/nextjs';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('pt-BR');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="mb-8">
          <Title className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Configurações
          </Title>
          <Text className="text-xl text-gray-600 mt-2">
            Gerencie suas preferências e configurações da conta
          </Text>
        </div>

        <TabGroup>
          <TabList className="mt-8">
            <Tab>Geral</Tab>
            <Tab>Notificações</Tab>
            <Tab>Aparência</Tab>
            <Tab>Conta</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-lg font-medium">Idioma</Text>
                      <Text className="text-gray-500">Escolha o idioma da interface</Text>
                    </div>
                    <Select
                      value={language}
                      onValueChange={setLanguage}
                      className="w-48"
                    >
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </Select>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-lg font-medium">Fuso Horário</Text>
                      <Text className="text-gray-500">Ajuste o fuso horário local</Text>
                    </div>
                    <Select
                      value="America/Sao_Paulo"
                      className="w-48"
                    >
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-4)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+1)</SelectItem>
                    </Select>
                  </div>
                </Card>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-lg font-medium">Notificações por Email</Text>
                      <Text className="text-gray-500">Receba atualizações importantes por email</Text>
                    </div>
                    <Switch
                      checked={notifications}
                      onChange={setNotifications}
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-lg font-medium">Alertas de Estoque</Text>
                      <Text className="text-gray-500">Notificações quando produtos estiverem com estoque baixo</Text>
                    </div>
                    <Switch
                      checked={notifications}
                      onChange={setNotifications}
                    />
                  </div>
                </Card>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-lg font-medium">Modo Escuro</Text>
                      <Text className="text-gray-500">Ative o tema escuro da interface</Text>
                    </div>
                    <Switch
                      checked={darkMode}
                      onChange={setDarkMode}
                    />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Text className="text-lg font-medium">Tamanho da Fonte</Text>
                      <Text className="text-gray-500">Ajuste o tamanho do texto da interface</Text>
                    </div>
                    <Select
                      value="medium"
                      className="w-48"
                    >
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </Select>
                  </div>
                </Card>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Text className="text-lg font-medium">Informações da Conta</Text>
                      <div className="mt-4 space-y-2">
                        <Text className="text-gray-600">Nome: {user?.firstName} {user?.lastName}</Text>
                        <Text className="text-gray-600">Email: {user?.emailAddresses[0]?.emailAddress}</Text>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Text className="text-lg font-medium">Segurança</Text>
                      <div className="mt-4 space-y-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                          Alterar Senha
                        </button>
                        <button className="ml-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                          Autenticação em Duas Etapas
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </main>
    </div>
  );
} 