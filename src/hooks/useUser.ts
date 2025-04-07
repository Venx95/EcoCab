
import { useState, useEffect, useContext } from 'react';
import { User, AuthState, AuthContextType } from '@/types/auth-types';
import { AuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          const mappedUser: User = {
            id: session.user.id,
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            phoneNumber: session.user.phone || session.user.user_metadata.phone_number,
            photoURL: session.user.user_metadata.photo_url,
          };
          setState({
            user: mappedUser,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const mappedUser: User = {
          id: session.user.id,
          name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          phoneNumber: session.user.phone || session.user.user_metadata.phone_number,
          photoURL: session.user.user_metadata.photo_url,
        };
        setState({
          user: mappedUser,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login with email/password
  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const mappedUser: User = {
          id: data.user.id,
          name: data.user.user_metadata.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          phoneNumber: data.user.phone || data.user.user_metadata.phone_number,
          photoURL: data.user.user_metadata.photo_url,
        };
        
        setState({
          user: mappedUser,
          loading: false,
          error: null,
        });
        
        return mappedUser;
      }
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
      
      // This will redirect the user and they'll return after login
      // The session will be picked up by the onAuthStateChange listener
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
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
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      
      if (error) throw error;
      
      // This will redirect the user and they'll return after login
      // The session will be picked up by the onAuthStateChange listener
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
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
  const signup = async (email: string, password: string, name: string, phoneNumber?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone_number: phoneNumber,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        const mappedUser: User = {
          id: data.user.id,
          name: name,
          email: data.user.email || '',
          phoneNumber: phoneNumber,
          photoURL: data.user.user_metadata.photo_url,
        };
        
        // Temporary check to see if email confirmation is required
        if (data.session === null) {
          toast.info("Please check your email for verification link");
        }
        
        setState({
          user: data.session ? mappedUser : null,
          loading: false,
          error: null,
        });
        
        return mappedUser;
      }
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
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (userData: Partial<User>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (!state.user) {
        throw new Error('User not authenticated');
      }
      
      // Update Supabase auth metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone_number: userData.phoneNumber,
          photo_url: userData.photoURL,
        }
      });
      
      if (authError) throw authError;
      
      // Also update the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          phone_number: userData.phoneNumber,
          photo_url: userData.photoURL,
        })
        .eq('id', state.user.id);
        
      if (profileError) throw profileError;
      
      // Update local state
      const updatedUser: User = {
        ...state.user,
        ...userData,
      };
      
      setState({
        user: updatedUser,
        loading: false,
        error: null,
      });
      
      return updatedUser;
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
