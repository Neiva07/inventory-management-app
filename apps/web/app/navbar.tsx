'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = isSignedIn
    ? [{ name: 'Download', href: '/download' }]
    : [{ name: 'Download', href: '/download' }];

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <a href={isSignedIn ? '/' : '/'}>
              <Image
                src="/logo_purple_blue.svg"
                alt="Stockify Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors duration-200',
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
              </a>
            ))}

            {isSignedIn ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rounded-full bg-secondary px-3 py-2 text-sm transition-colors duration-200 hover:bg-accent"
                >
                  <Image
                    className="h-6 w-6 rounded-full"
                    src={user?.imageUrl || 'https://avatar.vercel.sh/leerob'}
                    height={24}
                    width={24}
                    alt={`${user?.firstName || 'User'} avatar`}
                  />
                  <span className="font-medium">
                    {user?.firstName || 'Usuário'}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg bg-popover py-2 shadow-lg ring-1 ring-border">
                      <SignOutButton>
                        <button
                          className="flex w-full px-4 py-2 text-sm text-popover-foreground hover:bg-accent transition-colors duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Sair
                        </button>
                      </SignOutButton>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/app-sign-in"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Entrar
                </a>
                <a
                  href="/app-sign-in"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-colors duration-200"
                >
                  Começar Gratuitamente
                </a>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-t">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md',
                  pathname === item.href
                    ? 'bg-accent text-blue-600'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </a>
            ))}

            {!isSignedIn && (
              <div className="pt-4 border-t">
                <a
                  href="/app-sign-in"
                  className="block w-full bg-primary text-primary-foreground px-4 py-2 rounded-md text-base font-medium text-center hover:opacity-90 transition-colors duration-200"
                >
                  Entrar
                </a>
              </div>
            )}
          </div>

          {isSignedIn && (
            <div className="border-t bg-muted px-4 py-3">
              <div className="flex items-center">
                <Image
                  className="h-8 w-8 rounded-full"
                  src={user?.imageUrl || 'https://avatar.vercel.sh/leerob'}
                  height={32}
                  width={32}
                  alt={`${user?.firstName || 'User'} avatar`}
                />
                <div className="ml-3">
                  <div className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.emailAddresses[0]?.emailAddress}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <SignOutButton>
                  <button
                    className="block w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-accent rounded-md transition-colors duration-200"
                    onClick={() => setMobileOpen(false)}
                  >
                    Sair
                  </button>
                </SignOutButton>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
