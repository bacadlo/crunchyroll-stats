'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WatchHistoryResponse } from '@/types/watch-history';

interface AuthenticatedAppContextValue {
  historyData: WatchHistoryResponse | null;
  displayEmail: string;
  isLoading: boolean;
  isRefreshing: boolean;
  loadingMessage: string;
  error: string;
  refreshData: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthenticatedAppContext = createContext<AuthenticatedAppContextValue | null>(null);

export function useAuthenticatedApp() {
  const context = useContext(AuthenticatedAppContext);
  if (!context) {
    throw new Error('useAuthenticatedApp must be used within AuthenticatedAppProvider');
  }
  return context;
}

export function AuthenticatedAppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<WatchHistoryResponse | null>(null);
  const [displayEmail, setDisplayEmail] = useState('');

  useEffect(() => {
    setDisplayEmail(localStorage.getItem('cr_display_email') || '');
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Fetching your history...');
  const [error, setError] = useState('');
  const initialFetchRef = useRef(false);

  const logout = useCallback(async () => {
    localStorage.removeItem('cr_display_email');
    const csrfRes = await fetch('/api/csrf');
    const { csrfToken } = await csrfRes.json();
    await fetch('/api/auth', {
      method: 'DELETE',
      headers: { 'X-CSRF-Token': csrfToken },
    });
    router.push('/login');
  }, [router]);

  const fetchAllData = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const historyRes = await fetch('/api/watch-history');

        if (historyRes.status === 401) {
          await logout();
          return;
        }

        if (!historyRes.ok) {
          const errorData = await historyRes.json();
          throw new Error(errorData.error || 'Failed to fetch watch history');
        }

        const historyResult = (await historyRes.json()) as WatchHistoryResponse;
        setHistoryData(historyResult);

        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [logout]
  );

  useEffect(() => {
    if (initialFetchRef.current) {
      return;
    }
    initialFetchRef.current = true;
    fetchAllData(false);
  }, [fetchAllData]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingMessage('Fetching account history...');
      return;
    }

    const timer = setTimeout(() => {
      setLoadingMessage('Analyzing anime stats...');
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const value = useMemo<AuthenticatedAppContextValue>(
    () => ({
      historyData,
      displayEmail,
      isLoading,
      isRefreshing,
      loadingMessage,
      error,
      refreshData: () => fetchAllData(true),
      logout,
    }),
    [historyData, displayEmail, isLoading, isRefreshing, loadingMessage, error, fetchAllData, logout]
  );

  return (
    <AuthenticatedAppContext.Provider value={value}>
      {children}
    </AuthenticatedAppContext.Provider>
  );
}
