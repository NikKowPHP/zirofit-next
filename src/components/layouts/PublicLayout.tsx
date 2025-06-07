// src/components/layouts/PublicLayout.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // For logo

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                {/* Placeholder for logo, similar to Laravel welcome page */}
                {/* <Image src="/assets/ziro.avif" alt="ZIRO.FIT Logo" width={95} height={36} className="h-9 w-auto" /> */}
                <span className="text-2xl font-bold text-indigo-600">ZIRO.FIT</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <Link href="/auth/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
                <Link href="/trainers" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Find Trainers
                </Link>
              </div>
            </div>
            {/* Mobile menu button can be added later if needed */}
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ZIRO.FIT. All rights reserved.
          </p>
          {/* Add more footer content similar to Laravel welcome page later */}
        </div>
      </footer>
    </div>
  );
}