'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@web/hooks/useAuth';

const SuccessPage = () => {
  const router = useRouter();
  const { authState, setAuthState } = useAuth();
  const searchParams = useSearchParams();
  const tokenId = searchParams.get('tokenId');
  useEffect(() => {
    try {
      const fetchAccessToken = async (tokenId: string | null) => {
        if (!tokenId || !authState.api || !setAuthState) {
          console.log('tokenId || authState.api || setAuthState is missing!!');
          return;
        }
        const response = (await authState.api?.get(
          `api/auth/oauth-callback?tokenId=${tokenId}`
        )) as {
          data: { accessToken: string };
        };
        if (!response) {
          console.error('No response from the server');
          return;
        }
        const { data } = response;
        // Проверяем, что data есть и в ней есть accessToken
        if (!data?.accessToken) {
          console.error('Response data do not contain access token: ', data);
          return;
        }

        setAuthState((prevState) => ({
          ...prevState,
          accessToken: data.accessToken,
        }));
      };
      fetchAccessToken(tokenId);
    } catch (error) {
      console.log(`Failed to fetch accessToken: ${error}`);
    }
  }, [tokenId, authState?.api, setAuthState]);

  useEffect(() => {
    router.replace('/dashboard');
  }, [authState.accessToken]);

  return (
    <>
      <h1 className="text-center text-4xl">Success,{tokenId}!</h1>
      {authState.accessToken && (
        <div>AccessToken obtained: {authState.accessToken}</div>
      )}
      <Link
        className="bg-green-600 text-white rounded-xl mt-6 py-3.5 px-8 text-left"
        href="/"
      >
        Home Page
      </Link>
    </>
  );
};

export default SuccessPage;
