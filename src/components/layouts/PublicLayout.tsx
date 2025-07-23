
"use client"; // This component now uses a hook, so it must be a client component.

import { useState, useEffect } from "react";
import Link from "next/link";
// import Image from 'next/image'; // For logo
import { useTranslations } from "next-intl";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/auth/LogoutButton";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Button } from "../ui/Button";
import { motion } from "framer-motion";
import LanguageSwitcher from "./LanguageSwitcher";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const t = useTranslations("PublicLayout");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    // Initial check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup function to reset on component unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950`}
    >
      <div className="fixed w-full top-0 z-50 px-4 pt-4">
        <header className="max-w-7xl mx-auto bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full ">
          <nav className="px-4 ">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex-shrink-0 flex items-center">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    ZIRO.FIT
                  </span>
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                  {!loading && (
                    <>
                      <Link
                        href="/trainers"
                        className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        {t('findTrainers')}
                      </Link>
                      {user ? (
                        <>
                          <Link
                            href="/dashboard"
                            className="text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            data-testid="dashboard-link"
                          >
                            {t('dashboard')}
                          </Link>
                          <LogoutButton />
                        </>
                      ) : (
                        <>
                          <Button asChild variant="secondary" size="md">
                            <Link href="/auth/login" data-testid="login-link">{t('trainerLogin')}</Link>
                          </Button>
                          <Button asChild variant="primary" size="md">
                            <Link href="/auth/register" data-testid="signup-link">{t('trainerSignUp')}</Link>
                          </Button>
                        </>
                      )}
                      <LanguageSwitcher />
                    </>
                  )}
                </div>
              </div>
              {/* Mobile Menu Button */}
              <div className="-mr-2 flex md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Open main menu</span>
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                </button>
              </div>
            </div>
          </nav>
        </header>
      </div>


      {/* NEW Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl animate-subtle-fade-in-up">
          <button
            onClick={toggleMobileMenu}
            className="absolute top-4 right-4 p-2 text-gray-600 dark:text-gray-300"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>
          
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <div className="absolute top-6 left-6">
              <LanguageSwitcher />
            </div>
            {!loading && (
              <>
                <Link
                  href="/trainers"
                  className="text-2xl font-bold text-gray-800 dark:text-gray-200"
                  onClick={toggleMobileMenu}
                >
                  {t('findTrainers')}
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-2xl font-bold text-gray-800 dark:text-gray-200"
                      onClick={toggleMobileMenu}
                    >
                      {t('dashboard')}
                    </Link>
                    <LogoutButton />
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center space-y-4 pt-8">
                      <Button asChild variant="secondary" size="lg" onClick={toggleMobileMenu}>
                          <Link href="/auth/login" data-testid="login-link">{t('trainerLogin')}</Link>
                      </Button>
                      <Button asChild size="lg" onClick={toggleMobileMenu}>
                          <Link href="/auth/register" data-testid="signup-link">{t('trainerSignUp')}</Link>
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <motion.main 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeInOut", duration: 0.4 }}
        className="flex-grow flex flex-col  "
      >
        {children}
      </motion.main>

      <footer className="bg-neutral-50 dark:bg-black border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t('allRightsReserved', { year: new Date().getFullYear() })}
          </p>
          <nav className="mt-4">
            <div className="flex justify-center space-x-4">
              <Link href="#" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">{t('privacyPolicy')}</Link>
              <Link href="#" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">{t('termsOfService')}</Link>
              <Link href="#" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">{t('contact')}</Link>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
}