'use client';
import { FC, useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useAuth } from '@web/hooks/useAuth';

const Test: FC = () => {
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { authState, isAuthenticated } = useAuth();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Не делать запрос, если пользователь не аутентифицирован.
    if (!isAuthenticated()) {
      return;
    }
    // Предотвращение двойных рендеров (запросов к API) в strict-mode.
    if (isFirstRender.current) {
      const fetchData = async () => {
        try {
          if (authState.api) {
            const response = await authState.api.get('/api/test-data');

            console.log(response.data);
            setData(response.data);
            setError(null);
          }
        } catch (error: unknown) {
          setError(
            error instanceof AxiosError
              ? error.message
              : 'fetch test data error'
          );
          setData(null);
        }
      };
      fetchData();
      isFirstRender.current = false;
    }
  }, []);

  return (
    <>
      <div className="text-2xl text-center">TestComponent</div>
      <div>{data}</div>
    </>
  );
};

export default Test;
