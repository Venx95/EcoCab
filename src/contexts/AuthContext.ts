
import { createContext } from 'react';
import { AuthContextType } from '@/types/auth-types';

// Create the context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
