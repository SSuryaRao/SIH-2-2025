'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authAPI, User, LoginCredentials, RegisterData } from '@/services/api';
import { toast } from 'sonner';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export const useAuth = () => {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const setUser = (user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
      error: null,
    }));
  };

  const getStoredToken = () => {
    return Cookies.get('auth-token') || localStorage.getItem('auth-token');
  };

  const storeToken = (token: string) => {
    try {
      Cookies.set('auth-token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    } catch {
      console.warn('Failed to set cookie, falling back to localStorage');
      localStorage.setItem('auth-token', token);
    }
  };

  const removeToken = () => {
    Cookies.remove('auth-token');
    localStorage.removeItem('auth-token');
  };

  const fetchProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getProfile();
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(credentials);

      if (response.success && response.token && response.user) {
        storeToken(response.token);
        setUser(response.user);

        toast.success('Login successful!');

        // Redirect based on role
        const roleRoutes = {
          admin: '/dashboard/admin',
          staff: '/dashboard/staff',
          warden: '/dashboard/warden',
          student: '/dashboard/student',
        };

        router.push(roleRoutes[response.user.role] || '/dashboard');
        return { success: true };
      } else {
        const errorMessage = response.message || 'Login failed';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);

      if (response.success) {
        toast.success('Registration successful! Please login.');
        router.push('/login');
        return { success: true };
      } else {
        const errorMessage = response.message || 'Registration failed';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      const errorMessage = apiError.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);

    try {
      await authAPI.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  const refreshAuth = () => {
    fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
  };
};