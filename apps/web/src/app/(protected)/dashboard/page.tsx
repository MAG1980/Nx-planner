'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@web/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-6 md:grid-cols-12 py-6">
          <h1 className="col-span-6 md:col-span-8 text-center text-3xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h1>
          <div className="col-span-6 md:col-span-4 flex justify-between">
            <Link
              className="basis-2/5 shrink-0 flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              href="/"
            >
              Go to HomePage!
            </Link>
            <button
              onClick={logout}
              className="basis-2/5 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">You are now authenticated!</p>
        </div>
      </div>
    </div>
  );
}
