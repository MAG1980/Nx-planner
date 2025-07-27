'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@web/hooks/useAuth';
import { isAxiosError } from '@web/lib/guards/axios-error';
import { SignUpForm } from '@web/components/SignUpForm';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { authState, login, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated()) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!authState.api) {
      setError('API is not initialized');
      return;
    }

    try {
      await authState.api.post(
        '/api/auth/signup',
        { name, email, password },
        { withCredentials: true }
      );

      // Автоматически логиним пользователя после регистрации
      await login(email, password); // Используем login из контекста для обновления состояния
      router.push('/dashboard');
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed');
      }
    }
  };

  const props = {
    error,
    handleSubmit,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignUpForm {...props} />;
    </div>
  );
}
