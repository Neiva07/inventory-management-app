'use client';

import { SignIn } from '@clerk/nextjs'
import { OAuthStrategy } from '@clerk/types'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl scale-125">
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl rounded-3xl border-0"
            }
          }}
          path="/app-sign-in"
          routing="path"
          signInUrl="/app-sign-in"
          signUpUrl="/app-sign-in"
          withSignUp 
          fallbackRedirectUrl="/app-sign-in/callback"
        />
      </div>
    </div>
  );
}