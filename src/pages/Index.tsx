
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Navigation, Car } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Search Bar at the top */}
      <div className="absolute top-4 left-0 right-0 z-10 px-4">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/90 backdrop-blur-md border-none shadow-lg"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          <Button variant="default" className="rounded-full w-10 h-10 p-0 flex-shrink-0">
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Map Component */}
      <div className="h-full w-full">
        <MapComponent />
      </div>
      
      {/* Find Ride Button at the bottom */}
      <div className="absolute bottom-8 left-0 right-0 z-10 px-4">
        <Button 
          variant="default"
          size="lg"
          className="mx-auto flex items-center py-6 px-8 rounded-full shadow-lg bg-primary hover:bg-primary/90 transition-all"
          onClick={() => navigate('/register-ride')}
        >
          <Car className="mr-2 h-5 w-5" />
          <span className="text-lg font-medium">Find a Ride</span>
        </Button>
      </div>
    </div>
  );
};

export default Index;
