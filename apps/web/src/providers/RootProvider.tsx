'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@web/providers/AuthProvider';

export function RootProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
