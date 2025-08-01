'use client';
import Link from 'next/link';
import { useAuth } from '@web/hooks/useAuth';

export const Links = () => {
  const { isAuthenticated, logout, authState, setAuthState } = useAuth();

  const loginWithGoogle = async () => {
    try {
      if (authState.api && setAuthState) {
        const { accessToken } = (await authState.api.get(
          `/api/auth/google/login`
        )) as { accessToken: string };
        setAuthState((prevState) => ({ ...prevState, accessToken }));
      }
    } catch (error) {
      console.log(error);
    }
  };
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
          <button
            className="bg-green-600 text-white rounded-xl mt-6 py-3.5 px-8 text-left"
            onClick={loginWithGoogle}
          >
            Sign In With Goggle
          </button>
        </>
      )}
    </div>
  );
};
