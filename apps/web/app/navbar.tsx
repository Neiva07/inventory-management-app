'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useUser, SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const navigation = [
  { name: 'Download', href: '/download' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 py-2 bg-background/60 backdrop-blur">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="relative flex items-center space-x-2">
          <Image
            src="/logo_purple_blue.svg"
            alt="Inventarum"
            width={120}
            height={40}
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center">
          <nav className="mr-8">
            <ul className="flex items-center space-x-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                      pathname === item.href
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-background/80 pl-1 pr-3 py-1 text-sm transition-all duration-200 hover:bg-accent"
              >
                <Image
                  className="h-7 w-7 rounded-full"
                  src={user?.imageUrl || 'https://avatar.vercel.sh/user'}
                  height={28}
                  width={28}
                  alt="Avatar"
                />
                <span className="font-medium text-sm">{user?.firstName || 'Usuário'}</span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                  userMenuOpen && "rotate-180"
                )} />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-xl bg-popover border border-border/50 p-1.5 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                    <hr className="border-border/50 mb-1" />
                    <SignOutButton>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors duration-200"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LogOut className="w-4 h-4" />
                        Sair
                      </button>
                    </SignOutButton>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/app-sign-in"
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Entrar
              </Link>
              <Link
                href="/app-sign-in"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'gap-2'
                )}
              >
                Começar Grátis
              </Link>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger>
              <Menu className="h-6 w-6 text-foreground" />
            </DrawerTrigger>
            <DrawerContent>
              <DrawerTitle>
                <VisuallyHidden>Navegação</VisuallyHidden>
              </DrawerTitle>
              <DrawerDescription>
                <VisuallyHidden>Navegação</VisuallyHidden>
              </DrawerDescription>
              <DrawerHeader className="px-6">
                <Link href="/" className="flex items-center space-x-2">
                  <Image
                    src="/logo_purple_blue.svg"
                    alt="Inventarum"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </Link>
                <nav>
                  <ul className="mt-6 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            'block px-3 py-2.5 rounded-lg text-base font-medium transition-colors',
                            pathname === item.href
                              ? 'bg-accent text-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {isSignedIn && (
                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center gap-3 px-3">
                      <Image
                        className="h-9 w-9 rounded-full"
                        src={user?.imageUrl || 'https://avatar.vercel.sh/user'}
                        height={36}
                        width={36}
                        alt="Avatar"
                      />
                      <div>
                        <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.emailAddresses[0]?.emailAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </DrawerHeader>
              <DrawerFooter>
                {isSignedIn ? (
                  <SignOutButton>
                    <button className={cn(buttonVariants({ variant: 'outline' }), 'w-full gap-2')}>
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </SignOutButton>
                ) : (
                  <>
                    <Link
                      href="/app-sign-in"
                      className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                    >
                      Entrar
                    </Link>
                    <Link
                      href="/app-sign-in"
                      className={cn(buttonVariants({ variant: 'default' }), 'w-full')}
                    >
                      Começar Grátis
                    </Link>
                  </>
                )}
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Scroll border */}
      <hr
        className={cn(
          'absolute w-full bottom-0 transition-opacity duration-300 ease-in-out',
          scrolled ? 'opacity-100' : 'opacity-0'
        )}
      />
    </header>
  );
}
