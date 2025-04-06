
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { Control } from "react-hook-form";

interface LocationFieldsProps {
  control: Control<any>;
  isLoading: boolean;
  updateFareCalculation: () => void;
}

const LocationFields = ({ control, isLoading, updateFareCalculation }: LocationFieldsProps) => {
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
                placeholder="e.g. New York City" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
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
                placeholder="e.g. Boston" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
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
