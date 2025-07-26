'use client';
import { useAuth } from '@web/hooks/useAuth';

export const UserName = () => {
  const { authState, isAuthenticated } = useAuth();
  return (
    <span>
      {isAuthenticated()
        ? `Hello there, ${authState.user?.name}`
        : 'Вы не авторизованы'}
    </span>
  );
};
