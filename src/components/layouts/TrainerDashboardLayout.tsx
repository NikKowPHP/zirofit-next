"use client";
import React from 'react';
import Link from 'next/link';
import { HomeIcon, UserCircleIcon, UserGroupIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import LogoutButton from '../../components/auth/LogoutButton';
import { usePathname } from 'next/navigation';
import NotificationIndicator from '@/components/notifications/NotificationIndicator';
import { useTheme } from '@/context/ThemeContext';

interface TrainerDashboardLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  userEmail?: string;
}

export default function TrainerDashboardLayout({ children, headerTitle, userEmail }: TrainerDashboardLayoutProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: pathname === '/dashboard' },
    { name: 'Profile Settings', href: '/profile/edit', icon: UserCircleIcon, current: pathname.startsWith('/profile') },
    { name: 'Manage Clients', href: '/clients', icon: UserGroupIcon, current: pathname.startsWith('/clients') },
  ];

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md flex-shrink-0 flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                ZIRO.FIT
              </span>
          </Link>
        </div>
        <nav className="mt-6 px-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md mb-2
                          ${item.current
                            ? 'bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                          }`}
            >
              <item.icon className={`mr-3 h-6 w-6 flex-shrink-0 ${item.current ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'}`} aria-hidden="true" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          {userEmail && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Logged in as: {userEmail}</p>}
          <LogoutButton />
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {headerTitle || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              <NotificationIndicator />
              {userEmail && <span className="text-sm text-gray-600 dark:text-gray-300">{userEmail}</span>}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
