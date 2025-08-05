'use client';
import Link from 'next/link';
import { useAuth } from '@web/hooks/useAuth';

export const Links = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col">
      <a href="#commands"> What&apos;s next? </a>
      <Link href="/dashboard"> Go to Dashboard! </Link>
      <Link href="/test">Test Page</Link>
      {isAuthenticated() ? (
        <button
          className="bg-white text-gray-600 rounded-xl mt-6 py-3.5 px-8 text-left"
          onClick={() => logout()}
        >
          Logout
        </button>
      ) : (
        <>
          <Link href="/auth/login"> Login </Link>
          <Link
            className="bg-green-600 text-white rounded-xl mt-6 py-3.5 px-8 text-left"
            href="/api/auth/google/login"
          >
            Sign In With Goggle
          </Link>
        </>
      )}
    </div>
  );
};
