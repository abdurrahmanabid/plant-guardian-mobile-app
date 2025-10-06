import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
  };
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    loading: true,
    error: null,
  });

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const token = await AsyncStorage.getItem('Login');
      if (!token) {
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
          error: null,
        });
        return;
      }

      // You can add API call here to verify token if needed
      setAuthState({
        isLoggedIn: true,
        user: null, // Will be fetched separately
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: 'Failed to check authentication status',
      });
    }
  };

  const login = async (token: string) => {
    try {
      await AsyncStorage.setItem('Login', token);
      setAuthState(prev => ({
        ...prev,
        isLoggedIn: true,
        error: null,
      }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to save login token',
      }));
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('Login');
      await api.get('/user/signout');
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Failed to logout',
      }));
    }
  };

  const setUser = (user: User | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
    }));
  };

  const setError = (error: string | null) => {
    setAuthState(prev => ({
      ...prev,
      error,
    }));
  };

  const setLoading = (loading: boolean) => {
    setAuthState(prev => ({
      ...prev,
      loading,
    }));
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return {
    ...authState,
    login,
    logout,
    setUser,
    setError,
    setLoading,
    checkAuthStatus,
  };
}
