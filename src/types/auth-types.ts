
// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
}

// State for authentication
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// Auth context type
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}
