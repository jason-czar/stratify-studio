
import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';

export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md px-4">
        <AuthForm />
      </div>
    </div>
  );
}
