
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md dark:bg-gray-900/80 sticky top-0 z-30 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-16">
          {/* Logo Centered */}
          <Link to="/" className="flex items-center space-x-2">
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
        </div>
      </div>
    </header>
  );
};

export default Navbar;
