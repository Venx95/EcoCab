
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, MapPin, Car, LogOut, Settings, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

const Navbar = ({ isMenuOpen, setIsMenuOpen }: NavbarProps) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Define nav items based on authentication status
  const getNavItems = () => {
    const items = [
      { name: 'Explore Map', icon: MapPin, path: '/' },
      { name: 'Find Rides', icon: Car, path: '/register-ride' },
    ];
    
    // Add authenticated-only items
    if (user) {
      items.push(
        { name: 'Profile', icon: User, path: '/profile' },
        { name: 'Edit Profile', icon: Edit, path: '/edit-profile' },
        { name: 'Settings', icon: Settings, path: '/settings' }
      );
    }
    
    return items;
  };
  
  const navItems = getNavItems();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 sticky top-0 z-30 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/" : "/login"} className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: 0 }}
            >
              <div className="flex items-center">
                <img src="/assets/logo.svg" alt="Ecocab" className="h-8 w-8" />
              </div>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-eco-600 to-sky-600 text-transparent bg-clip-text">
              Ecocab
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user && navItems.map((item) => (
              <Link 
                key={item.name}
                to={item.path} 
                className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            {user ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </Button>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMenu}>
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <div className="container mx-auto px-4 pb-4 space-y-2">
              {user && navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    className="flex items-center py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
              {user ? (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                >
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navItems.length * 0.05 }}
                >
                  <Button 
                    asChild 
                    variant="default" 
                    className="w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
