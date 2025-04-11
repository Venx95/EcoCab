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
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
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
  
  const debouncedPickupQuery = useDebounce(pickupQuery, 500);
  const debouncedDestQuery = useDebounce(destQuery, 500);
  
  const formatAddress = (result: SearchResult): string => {
    if (!result.address) {
      const parts = result.display_name.split(',');
      if (parts.length > 2) {
        return parts.slice(0, Math.min(3, parts.length - 2)).join(',').trim();
      }
      return result.display_name;
    }
    
    const address = result.address;
    const housePart = address.house_number ? `${address.house_number} ` : '';
    const roadPart = address.road || '';
    const suburbPart = address.suburb || '';
    const cityPart = address.city || address.town || address.village || address.county || '';
    
    if (roadPart && cityPart) {
      return housePart && roadPart ? `${housePart}${roadPart}, ${cityPart}` : `${roadPart}, ${cityPart}`;
    } else if (suburbPart && cityPart) {
      return `${suburbPart}, ${cityPart}`;
    } else if (roadPart) {
      return roadPart;
    } else if (cityPart) {
      return cityPart;
    }
    
    const parts = result.display_name.split(',');
    if (parts.length > 2) {
      return parts.slice(0, Math.min(3, parts.length - 2)).join(',').trim();
    }
    
    return result.display_name;
  };
  
  const searchLocations = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 3) return [];
    
    try {
      console.log("Searching for location:", query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      console.log("Search results:", data);
      return data as SearchResult[];
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    }
  };
  
  useEffect(() => {
    if (debouncedPickupQuery) {
      searchLocations(debouncedPickupQuery).then(results => {
        setPickupResults(results);
        setShowPickupResults(results.length > 0);
      });
    }
  }, [debouncedPickupQuery]);
  
  useEffect(() => {
    if (debouncedDestQuery) {
      searchLocations(debouncedDestQuery).then(results => {
        setDestResults(results);
        setShowDestResults(results.length > 0);
      });
    }
  }, [debouncedDestQuery]);
  
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

  const handleLocationSelect = (
    field: any, 
    result: SearchResult,
    inputRef: React.RefObject<HTMLInputElement>,
    setQuery: (query: string) => void,
    setShowResults: (show: boolean) => void
  ) => {
    const formattedAddress = formatAddress(result);
    
    field.onChange(formattedAddress);
    setQuery(formattedAddress);
    setShowResults(false);
    
    if (inputRef.current) {
      inputRef.current.dataset.lat = result.lat;
      inputRef.current.dataset.lon = result.lon;
    }
    
    setTimeout(updateFareCalculation, 100);
  };
  
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
                  onClick={() => {
                    if (pickupResults.length > 0) {
                      setShowPickupResults(true);
                    }
                  }}
                />
                
                {showPickupResults && (
                  <div className="absolute z-50 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-200">
                    {pickupResults.map((result, index) => (
                      <div
                        key={`pickup-${index}`}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() => handleLocationSelect(
                          field, 
                          result,
                          pickupInputRef,
                          setPickupQuery,
                          setShowPickupResults
                        )}
                      >
                        {formatAddress(result)}
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
                  onClick={() => {
                    if (destResults.length > 0) {
                      setShowDestResults(true);
                    }
                  }}
                />
                
                {showDestResults && (
                  <div className="absolute z-50 w-full bg-white shadow-lg rounded-md mt-1 max-h-60 overflow-y-auto border border-gray-200">
                    {destResults.map((result, index) => (
                      <div
                        key={`dest-${index}`}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                        onClick={() => handleLocationSelect(
                          field,
                          result,
                          destinationInputRef,
                          setDestQuery,
                          setShowDestResults
                        )}
                      >
                        {formatAddress(result)}
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
