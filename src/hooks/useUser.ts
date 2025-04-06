
import { useState, useEffect, useContext } from 'react';
import { User, AuthState, AuthContextType } from '@/types/auth-types';
import { AuthContext } from '@/contexts/AuthContext';
import * as authService from '@/services/authService';

// Custom hook to use auth context
export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};

// Hook for providing auth state and methods
export const useUserProvider = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = authService.getStoredUser();
    setState({
      user: storedUser,
      loading: false,
      error: null,
    });
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.login(email, password);
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.loginWithGoogle();
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  // Login with Facebook
  const loginWithFacebook = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.loginWithFacebook();
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  // Sign up
  const signup = async (email: string, password: string, name: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.signup(email, password, name);
      setState({
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setState({
      user: null,
      loading: false,
      error: null,
    });
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.user) {
        throw new Error('User not authenticated');
      }
      
      const updatedUser = await authService.updateProfile(state.user, userData);
      
      setState({
        user: updatedUser,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }));
      throw error;
    }
  };

  return {
    ...state,
    login,
    loginWithGoogle,
    loginWithFacebook,
    signup,
    logout,
    updateProfile,
  };
};
