
import { User } from '@/types/auth-types';

// Mock authentication for demo purposes
export const login = async (email: string, password: string): Promise<User> => {
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
  
  return mockUser;
};

// Login with Google
export const loginWithGoogle = async (): Promise<User> => {
  // Mock Google authentication
  const mockUser: User = {
    id: 'google_' + Math.random().toString(36).substring(2, 9),
    name: 'Google User',
    email: 'user@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/personas/svg?seed=google',
  };
  
  localStorage.setItem('ecocab_user', JSON.stringify(mockUser));
  
  return mockUser;
};

// Login with Facebook
export const loginWithFacebook = async (): Promise<User> => {
  // Mock Facebook authentication
  const mockUser: User = {
    id: 'facebook_' + Math.random().toString(36).substring(2, 9),
    name: 'Facebook User',
    email: 'user@facebook.com',
    photoURL: 'https://api.dicebear.com/7.x/personas/svg?seed=facebook',
  };
  
  localStorage.setItem('ecocab_user', JSON.stringify(mockUser));
  
  return mockUser;
};

// Sign up
export const signup = async (email: string, password: string, name: string): Promise<User> => {
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
  
  return mockUser;
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('ecocab_user');
};

// Update user profile
export const updateProfile = async (currentUser: User, userData: Partial<User>): Promise<User> => {
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  
  const updatedUser = {
    ...currentUser,
    ...userData,
  };
  
  localStorage.setItem('ecocab_user', JSON.stringify(updatedUser));
  
  return updatedUser;
};

// Get stored user
export const getStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('ecocab_user');
  return storedUser ? JSON.parse(storedUser) : null;
};
