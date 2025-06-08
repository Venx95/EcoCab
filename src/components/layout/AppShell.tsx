
import { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from "sonner";
import { motion } from "framer-motion";
import BottomNavigation from './BottomNavigation';
import { useLocation } from 'react-router-dom';

interface AppShellProps {
  children: ReactNode;
}

const AppShell = ({ children }: AppShellProps) => {
  const location = useLocation();
  // Only hide navbar on login and signup pages
  const hideNavbar = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 container mx-auto px-4 py-2 pb-20"
      >
        {children}
      </motion.main>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      {/* Always show bottom navigation except on login/signup */}
      {!hideNavbar && <BottomNavigation />}
    </div>
  );
};

export default AppShell;
