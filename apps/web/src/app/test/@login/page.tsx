'use client';

import { FormEvent, useState } from 'react';

import { useAuth } from '@web/hooks/useAuth';
import { LoginForm } from '@web/components/LoginForm';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(`Invalid email or password: ${err}`);
    }
  };

  return (
    <div className="py-5">
      <LoginForm
        {...{ error, handleSubmit, email, setEmail, password, setPassword }}
      />
    </div>
  );
}
