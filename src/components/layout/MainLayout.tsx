
import React from 'react';
import { NavBar } from './NavBar';
import { WelcomeDialog } from '@/components/onboarding/WelcomeDialog';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 bg-background">
        {children}
      </main>
      {user && <WelcomeDialog />}
    </div>
  );
}
