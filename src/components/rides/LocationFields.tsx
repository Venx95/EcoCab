
import { useEffect, useRef, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { Control } from "react-hook-form";
import { useDebounce } from '@/hooks/useDebounce';

interface LocationFieldsProps {
  control: Control<any>;
  isLoading: boolean;
  updateFareCalculation: () => void;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

const LocationFields = ({ control, isLoading, updateFareCalculation }: LocationFieldsProps) => {
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const [pickupResults, setPickupResults] = useState<SearchResult[]>([]);
  const [destResults, setDestResults] = useState<SearchResult[]>([]);
  const [showPickupResults, setShowPickupResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const [pickupQuery, setPickupQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  
  // Debounce the search queries to prevent too many API calls
  const debouncedPickupQuery = useDebounce(pickupQuery, 500);
  const debouncedDestQuery = useDebounce(destQuery, 500);
  
  // Function to search locations using OpenStreetMap Nominatim API
  const searchLocations = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      return data as SearchResult[];
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    }
  };
  
  // Search for pickup locations when query changes
  useEffect(() => {
    if (debouncedPickupQuery) {
      searchLocations(debouncedPickupQuery).then(results => {
        setPickupResults(results);
        setShowPickupResults(results.length > 0);
      });
    }
  }, [debouncedPickupQuery]);
  
  // Search for destination locations when query changes
  useEffect(() => {
    if (debouncedDestQuery) {
      searchLocations(debouncedDestQuery).then(results => {
        setDestResults(results);
        setShowDestResults(results.length > 0);
      });
    }
  }, [debouncedDestQuery]);
  
  // Handle clicks outside of the results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickupInputRef.current && !pickupInputRef.current.contains(event.target as Node)) {
        setShowPickupResults(false);
      }
      
      if (destinationInputRef.current && !destinationInputRef.current.contains(event.target as Node)) {
        setShowDestResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <>
      <FormField
        control={control}
        name="pickupPoint"
        render={({ field }) => (
          <FormItem className="relative">
            <FormLabel className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              Pickup Point
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="Enter your pickup location" 
                  {...field}
                  value={pickupQuery || field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPickupQuery(value);
                    field.onChange(value);
                  }}
                  onFocus={() => setShowPickupResults(pickupResults.length > 0)}
                  disabled={isLoading}
                  className="animated-btn"
                  ref={(e) => {
                    pickupInputRef.current = e;
                    field.ref(e);
                  }}
                />
                
                {/* Pickup Search Results Dropdown */}
                {showPickupResults && (
                  <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                    {pickupResults.map((result, index) => (
                      <div
                        key={`pickup-${index}`}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          field.onChange(result.display_name);
                          setPickupQuery(result.display_name);
                          setShowPickupResults(false);
                          updateFareCalculation();
                        }}
                      >
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="destination"
        render={({ field }) => (
          <FormItem className="relative">
            <FormLabel className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-accent" />
              Destination
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="Enter your destination" 
                  {...field}
                  value={destQuery || field.value}
                  onChange={(e) => {
                    const value = e.target.value;
                    setDestQuery(value);
                    field.onChange(value);
                  }}
                  onFocus={() => setShowDestResults(destResults.length > 0)}
                  disabled={isLoading}
                  className="animated-btn"
                  ref={(e) => {
                    destinationInputRef.current = e;
                    field.ref(e);
                  }}
                />
                
                {/* Destination Search Results Dropdown */}
                {showDestResults && (
                  <div className="absolute z-10 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto">
                    {destResults.map((result, index) => (
                      <div
                        key={`dest-${index}`}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          field.onChange(result.display_name);
                          setDestQuery(result.display_name);
                          setShowDestResults(false);
                          updateFareCalculation();
                        }}
                      >
                        {result.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationFields;
