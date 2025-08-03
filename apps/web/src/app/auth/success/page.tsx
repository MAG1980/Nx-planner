'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const userId= searchParams.get('userId');
  return (
    <>
      <h1 className="text-center text-4xl">Success,{userId}!</h1>
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
