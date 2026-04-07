'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppSignInCallback() {
  const { sessionId, isLoaded } = useAuth();
  const [deepLinkTriggered, setDeepLinkTriggered] = useState(false);

  useEffect(() => {
    if (!isLoaded || !sessionId || deepLinkTriggered) return;

    const deepLink = `inventarum://auth?sessionId=${sessionId}`;
    window.location.href = deepLink;
    setDeepLinkTriggered(true);
  }, [isLoaded, sessionId, deepLinkTriggered]);

  const handleOpenApp = () => {
    if (sessionId) {
      window.location.href = `inventarum://auth?sessionId=${sessionId}`;
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Login realizado!</h1>
          <p className="text-muted-foreground">
            O aplicativo Inventarum deve abrir automaticamente.
            Se não abrir, clique no botão abaixo.
          </p>
        </div>

        <Button size="lg" className="gap-2" onClick={handleOpenApp}>
          <ExternalLink className="w-4 h-4" />
          Abrir Inventarum
        </Button>

        <p className="text-xs text-muted-foreground/60">
          Você pode fechar esta aba após abrir o aplicativo.
        </p>
      </div>
    </div>
  );
}
