
import { ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useUserProvider } from '@/hooks/useUser';
import { User } from '@/types/auth-types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useUserProvider();
  
  // Convert return types to match expected interface
  const wrappedAuth = {
    ...auth,
    login: async (email: string, password: string): Promise<void> => {
      await auth.login(email, password);
      return;
    },
    signup: async (email: string, password: string, name: string, phoneNumber?: string): Promise<void> => {
      await auth.signup(email, password, name, phoneNumber);
      return;
    },
    updateProfile: async (userData: Partial<User>): Promise<void> => {
      await auth.updateProfile(userData);
      return;
    }
  };
  
  return (
    <AuthContext.Provider value={wrappedAuth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
