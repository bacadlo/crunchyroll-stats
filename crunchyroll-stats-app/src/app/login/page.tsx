'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BrandLogoIcon } from '@/components/BrandLogoIcon';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  useEffect(() => {
    const remembered = localStorage.getItem('cr_remember_me') === 'true';
    const rememberedEmail = localStorage.getItem('cr_remembered_email') || '';
    if (remembered && rememberedEmail) {
      setRememberMe(true);
      setEmail(rememberedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (rememberMe) {
        localStorage.setItem('cr_remember_me', 'true');
        localStorage.setItem('cr_remembered_email', email);
      } else {
        localStorage.removeItem('cr_remember_me');
        localStorage.removeItem('cr_remembered_email');
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-lg">
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-20px] -z-10 rounded-[2rem] bg-primary-500/20 blur-2xl dark:bg-primary-500/25"
          />
          <Card className="group rounded-3xl border border-primary-500/25 bg-[var(--card)] shadow-[0_0_60px_rgba(249,115,22,0.18)] ring-1 ring-[var(--border)]/60 transition-transform duration-300 hover:scale-[1.01]">
            <CardHeader className="!border-0 px-5 pb-0 pt-8 sm:px-10 sm:pt-10">
              <div className="mb-6 flex flex-col items-center justify-center gap-3">
                <BrandLogoIcon size="md" />
                <span className="heading-font text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">CrunchyStats</span>
              </div>
              <CardTitle className="text-2xl text-center !text-white">Sign In</CardTitle>
              <p className="mt-2 text-center text-sm text-primary-600 dark:text-primary-400">
                Enter your Crunchyroll credentials to continue
              </p>
            </CardHeader>
            <CardContent className="px-5 pb-8 pt-6 sm:px-10 sm:pb-10">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <div className="w-full">
                  <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-20 text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:disabled:bg-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
                  />
                  Remember me
                </label>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 border-t border-[var(--border)] pt-6">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <Link href="/" className="font-medium text-primary-600 hover:text-primary-700">
                    {'<- Back to home'}
                  </Link>
                </p>
              </div>

              <div className="mt-6">
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                  Note: Your credentials are used only for authentication. We do not store your password or data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
