
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Car, Users } from "lucide-react";
import { Control } from "react-hook-form";

interface CarFieldsProps {
  control: Control<any>;
  isLoading: boolean;
}

const CarFields = ({ control, isLoading }: CarFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="carName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Car className="mr-2 h-4 w-4 text-primary" />
              Car Model
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="e.g. Tesla Model 3" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="seats"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Available Seats
            </FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(parseInt(value))} 
              defaultValue={field.value?.toString()}
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger className="animated-btn">
                  <SelectValue placeholder="Select available seats" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} seat{num !== 1 ? 's' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CarFields;
