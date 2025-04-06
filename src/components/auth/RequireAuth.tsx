
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const { user, loading } = useUser();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to the login page if not authenticated, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

export default RequireAuth;
