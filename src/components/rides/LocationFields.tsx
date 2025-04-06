
import { useEffect, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin, LocateFixed } from "lucide-react";
import { Control } from "react-hook-form";

interface LocationFieldsProps {
  control: Control<any>;
  isLoading: boolean;
  updateFareCalculation: () => void;
}

const LocationFields = ({ control, isLoading, updateFareCalculation }: LocationFieldsProps) => {
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      // If Google Maps isn't loaded yet, wait for it
      const checkGoogleMapsLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogleMapsLoaded);
          initAutocomplete();
        }
      }, 300);
      
      return () => clearInterval(checkGoogleMapsLoaded);
    } else {
      initAutocomplete();
    }
  }, []);
  
  const initAutocomplete = () => {
    if (!window.google || !pickupInputRef.current || !destinationInputRef.current) return;
    
    // Options for the autocomplete
    const options = {
      types: ['(cities)'],
      fields: ['address_components', 'formatted_address', 'geometry', 'name']
    };
    
    // Initialize autocomplete for pickup
    const pickupAutocomplete = new google.maps.places.Autocomplete(
      pickupInputRef.current,
      options
    );
    
    // Initialize autocomplete for destination
    const destAutocomplete = new google.maps.places.Autocomplete(
      destinationInputRef.current,
      options
    );
    
    // Add listeners for place selection
    pickupAutocomplete.addListener('place_changed', () => {
      const place = pickupAutocomplete.getPlace();
      if (place.formatted_address) {
        pickupInputRef.current!.value = place.formatted_address;
        updateFareCalculation();
      }
    });
    
    destAutocomplete.addListener('place_changed', () => {
      const place = destAutocomplete.getPlace();
      if (place.formatted_address) {
        destinationInputRef.current!.value = place.formatted_address;
        updateFareCalculation();
      }
    });
  };
  
  return (
    <>
      <FormField
        control={control}
        name="pickupPoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-primary" />
              Pickup Point
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your pickup location" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
                ref={pickupInputRef}
                onChange={(e) => {
                  field.onChange(e);
                  updateFareCalculation();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="destination"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-accent" />
              Destination
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your destination" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
                ref={destinationInputRef}
                onChange={(e) => {
                  field.onChange(e);
                  updateFareCalculation();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationFields;
