'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '@web/hooks/useAuth';

export default function AuthLayout({
  login,
  content,
}: {
  children: ReactNode;
  login: ReactNode;
  content: ReactNode;
}) {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-[432px] flex justify-between items-center w-full">
      <nav className="w-4/12  flex flex-col items-center justify-center my-3">
        <Link
          className="w-full text-center bg-green-300 my-1 p-3 px-5 mx-5 rounded-lg"
          href="/"
        >
          Home Page
        </Link>
        {isAuthenticated() ? (
          <button
            className="w-full text-center bg-green-300 my-1 p-3 px-5 mx-5 rounded-lg"
            onClick={() => logout()}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              className="w-full text-center bg-green-300 my-1 p-3 px-5 mx-5 rounded-lg"
              href="/auth/login"
            >
              Login
            </Link>
            <Link
              className="w-full text-center bg-green-300 my-1 p-3 px-5 mx-5 rounded-lg"
              href="/auth/signup"
            >
              Signup
            </Link>
          </>
        )}
      </nav>
      <div className="w-7/12">{isAuthenticated() ? content : login}</div>
    </div>
  );
}
