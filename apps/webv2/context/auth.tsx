'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, ApiError } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'console-ai-token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedToken = localStorage.getItem(STORAGE_KEY);
        if (savedToken) {
          try {
            // Verify token is still valid
            const data = await authApi.getMe(savedToken);
            setToken(savedToken);
            setUser(data.user);
            setError(null);
          } catch {
            // Token is invalid, clear it
            localStorage.removeItem(STORAGE_KEY);
            setToken(null);
            setUser(null);
          }
        } else {
          // No token in storage, ensure auth is cleared
          setToken(null);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.signin(email, password);
      const newToken = response.token;
      setToken(newToken);
      setUser(response.user);
      localStorage.setItem(STORAGE_KEY, newToken);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to sign in';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.signup(email, password, name);
      const newToken = response.token;
      setToken(newToken);
      setUser(response.user);
      localStorage.setItem(STORAGE_KEY, newToken);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to sign up';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signin, signup, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
