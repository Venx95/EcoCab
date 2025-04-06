
import { useState, useEffect, createContext, useContext } from 'react';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
}

// State for authentication
interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// Auth context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

// Mock authentication for demo purposes
// In a real app, this would connect to Firebase, Auth0, or a custom backend
export const useUserProvider = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ecocab_user');
    if (storedUser) {
      setState({
        user: JSON.parse(storedUser),
        loading: false,
        error: null,
      });
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Mock API call - would be replaced with actual auth provider
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // For demo, create a mock user
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email,
        photoURL: `https://api.dicebear.com/7.x/personas/svg?seed=${email}`,
      };
      
      // Store user in localStorage for persistence
      localStorage.setItem('ecocab_user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
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
      
      // Mock Google authentication
      const mockUser: User = {
        id: 'google_' + Math.random().toString(36).substring(2, 9),
        name: 'Google User',
        email: 'user@gmail.com',
        photoURL: 'https://api.dicebear.com/7.x/personas/svg?seed=google',
      };
      
      localStorage.setItem('ecocab_user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
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
      
      // Mock Facebook authentication
      const mockUser: User = {
        id: 'facebook_' + Math.random().toString(36).substring(2, 9),
        name: 'Facebook User',
        email: 'user@facebook.com',
        photoURL: 'https://api.dicebear.com/7.x/personas/svg?seed=facebook',
      };
      
      localStorage.setItem('ecocab_user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
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
      
      if (!email || !password || !name) {
        throw new Error('Name, email, and password are required');
      }
      
      // Mock user creation
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substring(2, 9),
        name,
        email,
        photoURL: `https://api.dicebear.com/7.x/personas/svg?seed=${email}`,
      };
      
      localStorage.setItem('ecocab_user', JSON.stringify(mockUser));
      
      setState({
        user: mockUser,
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
    localStorage.removeItem('ecocab_user');
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
      
      const updatedUser = {
        ...state.user,
        ...userData,
      };
      
      localStorage.setItem('ecocab_user', JSON.stringify(updatedUser));
      
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

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within an AuthProvider');
  }
  return context;
};
