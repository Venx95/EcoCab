
import { useState } from 'react';
import { Navigation, Search } from 'lucide-react';
import MapComponent from '@/components/MapComponent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { toast } from 'sonner';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLocation, setMapLocation] = useState('');
  const [currentLocationName, setCurrentLocationName] = useState('');
  const navigate = useNavigate();
  
  // Debounce the map location update to avoid too many API calls
  const debouncedMapLocation = useDebounce(mapLocation, 800);
  
  const handleMapSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setMapLocation(value); // Update map location when search changes
  };
  
  // Format address to be more user-friendly (no state, zip, country)
  const formatAddress = (addressComponents: any): string => {
    if (!addressComponents) return "Unknown Location";
    
    const address = addressComponents;
    // Extract only street/road and city, excluding state, pincode and country
    const road = address.road || address.street || '';
    const suburb = address.suburb || address.neighbourhood || address.hamlet || '';
    const city = address.city || address.town || address.village || '';
    
    // Construct a simplified location string with just road/street and city
    if (road && city) {
      return `${road}, ${city}`;
    } else if (suburb && city) {
      return `${suburb}, ${city}`;
    } else if (city) {
      return city;
    } else {
      // Default location as fallback
      return "Vadgaon, Pune";
    }
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
            console.log("Reverse geocoding result:", data);
            
            // Format the address using our helper function
            const simplifiedLocation = formatAddress(data.address);
            
            setCurrentLocationName(simplifiedLocation);
            
            // Navigate to booking with simplified location as pickup and search query as destination
            navigate('/book-ride', { 
              state: { 
                pickupPoint: simplifiedLocation,
                destination: searchQuery || ''  // Use the search query as destination
              }
            });
            
            toast.success(`Location found: ${simplifiedLocation}`);
            
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            // Fallback to default location if reverse geocoding fails
            const defaultLocation = "Vadgaon, Pune";
            setCurrentLocationName(defaultLocation);
            
            navigate('/book-ride', { 
              state: { 
                pickupPoint: defaultLocation,
                destination: searchQuery || ''
              }
            });
            
            toast.info(`Using default location: ${defaultLocation}`);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your current location. Please check your browser settings.");
          
          // Use default location
          const defaultLocation = "Vadgaon, Pune";
          navigate('/book-ride', { 
            state: { 
              pickupPoint: defaultLocation,
              destination: searchQuery || ''
            }
          });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      
      // Use default location
      const defaultLocation = "Vadgaon, Pune";
      navigate('/book-ride', { 
        state: { 
          pickupPoint: defaultLocation,
          destination: searchQuery || ''
        }
      });
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
