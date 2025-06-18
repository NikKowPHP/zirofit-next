// src/components/layouts/PublicLayout.tsx
"use client"; // This component now uses a hook, so it must be a client component.

import React, { useState } from 'react';
import Link from 'next/link';
// import Image from 'next/image'; // For logo
import { useTheme } from '../../context/ThemeContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <header className="bg-white/80 dark:bg-gray-800/80 shadow-sm sticky top-0 z-50 backdrop-blur-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">ZIRO.FIT</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4 ">
                <Link href="/auth/login" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
                <Link href="/trainers" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                  Find Trainers
                </Link>
              </div>
            </div>
            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/trainers" className="block text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium">Find Trainers</Link>
            <Link href="/auth/login" className="block text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 py-2 rounded-md text-base font-medium">Login</Link>
            <Link href="/auth/register" className="block text-white bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 px-3 py-2 rounded-md text-base font-medium">Sign Up</Link>
          </div>
        </div>
      )}

      <main className="flex-grow bg-white dark:bg-gray-900">
        {children}
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} ZIRO.FIT. All rights reserved.
          </p>
          {/* Add more footer content similar to Laravel welcome page later */}
        </div>
      </footer>
    </div>
  );
}
