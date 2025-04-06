
import { useEffect, useRef } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { Control } from "react-hook-form";

interface LocationFieldsProps {
  control: Control<any>;
  isLoading: boolean;
  updateFareCalculation: () => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

const LocationFields = ({ control, isLoading, updateFareCalculation }: LocationFieldsProps) => {
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (!pickupInputRef.current || !destinationInputRef.current) return;
    
    // Function to check if Google Maps is loaded and initialize autocomplete
    const initAutocomplete = () => {
      if (!window.google || !window.google.maps || !window.google.maps.places) return false;
      
      try {
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
          if (place.formatted_address && pickupInputRef.current) {
            pickupInputRef.current.value = place.formatted_address;
            updateFareCalculation();
          }
        });
        
        destAutocomplete.addListener('place_changed', () => {
          const place = destAutocomplete.getPlace();
          if (place.formatted_address && destinationInputRef.current) {
            destinationInputRef.current.value = place.formatted_address;
            updateFareCalculation();
          }
        });
        
        return true;
      } catch (error) {
        console.error("Error initializing Google Maps Autocomplete:", error);
        return false;
      }
    };
    
    // Try to initialize immediately if Google Maps is already loaded
    if (!initAutocomplete()) {
      // If Google Maps isn't loaded yet, wait for it
      const checkGoogleMapsLoaded = setInterval(() => {
        if (initAutocomplete()) {
          clearInterval(checkGoogleMapsLoaded);
        }
      }, 300);
      
      return () => clearInterval(checkGoogleMapsLoaded);
    }
  }, [updateFareCalculation]);
  
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
                ref={(e) => {
                  // Assign to both the RHF ref and our local ref
                  field.ref(e);
                  pickupInputRef.current = e;
                }}
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
                ref={(e) => {
                  // Assign to both the RHF ref and our local ref
                  field.ref(e);
                  destinationInputRef.current = e;
                }}
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
