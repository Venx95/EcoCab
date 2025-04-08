
import { useState } from 'react';
import { Navigation, Search } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRidesContext } from '@/providers/RidesProvider';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLocation, setMapLocation] = useState('');
  const { searchRides } = useRidesContext();
  const navigate = useNavigate();
  
  // Debounce the map location update to avoid too many API calls
  const debouncedMapLocation = useDebounce(mapLocation, 800);
  
  const handleMapSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setMapLocation(value); // Update map location when search changes
  };
  
  const handleGetCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Use the browser's geolocation API
          const { latitude, longitude } = position.coords;
          
          // For demonstration, we'll just log the coordinates
          console.log(`Current location: ${latitude}, ${longitude}`);
          
          // In a real app, you would use reverse geocoding to get address
          // For now, just set the coordinates in the search query
          const currentLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setSearchQuery(currentLocation);
          setMapLocation(currentLocation);
          
          // Navigate to booking with current location as pickup and search query as destination
          navigate('/book-ride', { 
            state: { 
              pickupPoint: currentLocation,
              destination: searchQuery || currentLocation  // If no destination entered, use current location
            }
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your current location. Please check your browser settings.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  
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
              onChange={handleMapSearch}
              className="pr-10 bg-white/90 backdrop-blur-md border-none shadow-lg"
            />
            <div className="absolute right-3 top-2.5">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <Button 
            variant="default" 
            className="rounded-full w-10 h-10 p-0 flex-shrink-0"
            onClick={handleGetCurrentLocation}
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Map Component */}
      <div className="h-[calc(100%-60px)] w-full">
        <MapComponent destination={debouncedMapLocation} />
      </div>
    </div>
  );
};

export default Index;
