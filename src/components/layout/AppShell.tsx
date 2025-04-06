
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
  // Only show navbar on login and signup pages
  const showNavbar = location.pathname === '/login' || location.pathname === '/signup';
  
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 container mx-auto px-4 py-2 pb-20"
      >
        {children}
      </motion.main>
      <Toaster position="top-center" />
      {/* Only show bottom navigation if not on login or signup pages */}
      {!showNavbar && <BottomNavigation />}
    </div>
  );
};

export default AppShell;
