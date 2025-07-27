'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@web/hooks/useAuth';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  return (
    <>
      <nav className="flex justify-between my-3">
        <Link className="bg-green-300 p-3 px-5 mx-5 rounded-lg" href="/">
          Home Page
        </Link>
        {isAuthenticated() ? (
          <button
            className="bg-green-300 p-3 px-5 mx-5 rounded-lg"
            onClick={() => logout()}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              className="bg-green-300 p-3 px-5 mx-5 rounded-lg"
              href="/test/login"
            >
              Login
            </Link>
            <Link
              className="bg-green-300 p-3 px-5 mx-5 rounded-lg"
              href="/test/signup"
            >
              Signup
            </Link>
          </>
        )}
      </nav>
      {children}
    </>
  );
}
