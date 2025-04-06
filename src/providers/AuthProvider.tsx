
import { ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useUserProvider } from '@/hooks/useUser';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useUserProvider();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
