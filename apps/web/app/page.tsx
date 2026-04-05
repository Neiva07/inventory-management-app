'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IndexPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      // Redirect authenticated users to dashboard
      router.push('/dashboard');
    } else {
      // Redirect unauthenticated users to landing page
      router.push('/landing');
    }
  }, [isSignedIn, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}
