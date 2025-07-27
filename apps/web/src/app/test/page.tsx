'use client';
import Test from '@web/components/test';
import { useAuth } from '@web/hooks/useAuth';

const TestPage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <h2 className="bg-blue-500 p-3 rounded-lg w-full text-center text-white">
        Test Page
      </h2>
      {isAuthenticated() && <Test />}
    </>
  );
};

export default TestPage;
