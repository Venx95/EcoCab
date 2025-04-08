
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
  const [currentLocationName, setCurrentLocationName] = useState('');
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
        async (position) => {
          // Use the browser's geolocation API
          const { latitude, longitude } = position.coords;
          
          try {
            // Reverse geocode to get location name
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
            );
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            // Get a readable location name
            const locationName = data.display_name;
            
            setCurrentLocationName(locationName);
            
            // Navigate to booking with current location as pickup and search query as destination
            navigate('/book-ride', { 
              state: { 
                pickupPoint: locationName,
                destination: searchQuery || ''  // Use the search query as destination
              }
            });
            
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            // Fallback to coordinates if reverse geocoding fails
            const coordsString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setCurrentLocationName(coordsString);
            
            navigate('/book-ride', { 
              state: { 
                pickupPoint: coordsString,
                destination: searchQuery || ''
              }
            });
          }
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
    <div className="relative flex flex-col h-[calc(100vh-4rem)]">
      {/* Search Bar at the top - Fixed position */}
      <div className="sticky top-0 z-10 px-4 pt-4 pb-2 bg-background">
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
      
      {/* Map Component taking most of the space */}
      <div className="flex-1 w-full px-4 py-2">
        <MapComponent destination={debouncedMapLocation} height="100%" />
      </div>
    </div>
  );
};

export default Index;
