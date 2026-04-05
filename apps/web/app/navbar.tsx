'use client';

import { Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '@clerk/nextjs';
import { SignOutButton } from '@clerk/nextjs';
import Image from 'next/image';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  // Authenticated navigation
  const authNavigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Landing', href: '/landing' },
    { name: 'Download', href: '/download' }
  ];
  
  // Unauthenticated navigation
  const unauthNavigation = [
    { name: 'Início', href: '/landing' },
    { name: 'Download', href: '/download' }
  ];
  
  const navigation = isSignedIn ? authNavigation : unauthNavigation;

  return (
    <Disclosure as="nav" className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <a href={isSignedIn ? '/dashboard' : '/landing'}>
                  <Image
                    src="/logo_purple_blue.svg"
                    alt="Stockify Logo"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </a>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      pathname === item.href
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900',
                      'text-sm font-medium transition-colors duration-200'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
                
                {isSignedIn ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex items-center space-x-2 rounded-full bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm transition-colors duration-200">
                        <Image
                          className="h-6 w-6 rounded-full"
                          src={user?.imageUrl || 'https://avatar.vercel.sh/leerob'}
                          height={24}
                          width={24}
                          alt={`${user?.firstName || 'User'} avatar`}
                        />
                        <span className="text-gray-700 font-medium">
                          {user?.firstName || 'Usuário'}
                        </span>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                        <Menu.Item>
                          {({ active }) => (
                            <SignOutButton>
                              <button
                                className={classNames(
                                  active ? 'bg-gray-50' : '',
                                  'flex w-full px-4 py-2 text-sm text-gray-700 transition-colors duration-200'
                                )}
                              >
                                Sair
                              </button>
                            </SignOutButton>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center space-x-4">
                    <a
                      href="/app-sign-in"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                      Entrar
                    </a>
                    <a
                      href="/landing"
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
                    >
                      Começar Gratuitamente
                    </a>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              
              {!isSignedIn && (
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="/app-sign-in"
                    className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-base font-medium text-center hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    Entrar
                  </a>
                </div>
              )}
            </div>
            
            {isSignedIn && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center">
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user?.imageUrl || 'https://avatar.vercel.sh/leerob'}
                    height={32}
                    width={32}
                    alt={`${user?.firstName || 'User'} avatar`}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <SignOutButton>
                    <button className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200">
                      Sair
                    </button>
                  </SignOutButton>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
