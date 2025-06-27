import { AxiosError } from 'axios';

export function isAxiosError(
  error: unknown
): error is AxiosError<{ message?: string }> {
  return (error as AxiosError).isAxiosError;
}
