'use client';

import { FormEvent, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { useAuth } from '@web/hooks/useAuth';
import { LoginForm } from '@web/components/LoginForm';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Если изменение состояния (например, навигация) должно происходить после рендера, перенеси его в useEffect.
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [isAuthenticated()]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(`Invalid email or password: ${err}`);
    }
  };

  return (
    <LoginForm
      {...{ error, handleSubmit, email, setEmail, password, setPassword }}
    />
  );
}
