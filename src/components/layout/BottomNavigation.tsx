
import { useNavigate } from 'react-router-dom';
import { MapPin, BookOpen, MessageSquare, User, PlusCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-border shadow-lg z-20">
      <div className="flex items-center justify-around">
        <button 
          onClick={() => navigate('/register-ride')}
          className="flex flex-col items-center justify-center py-3 w-1/4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <PlusCircle className="h-5 w-5 text-primary" />
          <span className="text-xs mt-1">Publish</span>
        </button>
        
        <button 
          onClick={() => navigate('/book-ride')}
          className="flex flex-col items-center justify-center py-3 w-1/4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-xs mt-1">Book</span>
        </button>
        
        <button 
          onClick={() => navigate('/messages')}
          className="flex flex-col items-center justify-center py-3 w-1/4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="text-xs mt-1">Message</span>
        </button>
        
        <button 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center justify-center py-3 w-1/4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <User className="h-5 w-5 text-primary" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;
