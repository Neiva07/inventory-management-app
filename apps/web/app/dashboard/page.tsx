'use client';

import { Card, Title, Text, Button } from '@tremor/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, useRef } from 'react';

export default function DashboardPage() {
  const { sessionId } = useAuth();
  const { user } = useUser();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasOpenedApp, setHasOpenedApp] = useState(false);
  const hasOpenedAppRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sessionId && !hasOpenedAppRef.current) {
      setCountdown(5);
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (!hasOpenedAppRef.current) {
              open(`inventarum://auth?sessionId=${sessionId}`);
              hasOpenedAppRef.current = true;
              setHasOpenedApp(true);
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="p-4 md:p-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8 space-y-4">
            <Title className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Bem-vindo{user?.firstName ? `, ${user?.firstName}` : ''}
            </Title>
            <Text className="text-2xl text-gray-600 max-w-2xl mx-auto">
              Sua solução de gestão de inventário
            </Text>
          </div>
          {countdown !== null && !hasOpenedApp && (
            <div className="mb-8">
              <Text className="text-5xl font-bold text-blue-600 mb-3">
                O aplicativo irá abrir em {countdown}...
              </Text>
            </div>
          )}
          <Text className="text-2xl text-gray-600 max-w-2xl mx-auto mb-8">
            Se não abrir automaticamente, clique no botão abaixo...
          </Text>
          <Card className="p-10 max-w-md w-full bg-white/80 backdrop-blur-md shadow-2xl hover:shadow-3xl transition-all duration-300 border-0 rounded-3xl">
            <Button 
              className="w-full py-8 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] rounded-xl"
              onClick={() => {
                if (sessionId) {
                  if (timerRef.current) clearInterval(timerRef.current);
                  open(`inventarum://auth?sessionId=${sessionId}`);
                  hasOpenedAppRef.current = true;
                  setHasOpenedApp(true);
                  setCountdown(null);
                }
              }}
            >
              ABRIR APLICATIVO
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
} 