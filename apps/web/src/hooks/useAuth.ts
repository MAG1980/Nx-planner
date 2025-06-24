import { useContext } from 'react';
import { AuthContext } from '@web/contexts/auth.context';

export function useAuth() {
  return useContext(AuthContext);
}
