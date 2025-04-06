
import { useState } from 'react';
import { Search, Navigation, Car } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="relative h-[calc(100vh-4rem)]">
      {/* Search Bar at the top */}
      <div className="sticky top-4 z-10 px-4 mb-4">
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
      <div className="h-[calc(100%-120px)] w-full mb-16">
        <MapComponent />
      </div>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
