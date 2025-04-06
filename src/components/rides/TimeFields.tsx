
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { Control } from "react-hook-form";

interface TimeFieldsProps {
  control: Control<any>;
  isLoading: boolean;
}

const TimeFields = ({ control, isLoading }: TimeFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="pickupDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Date
            </FormLabel>
            <FormControl>
              <Input 
                type="date" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
                min={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="pickupTimeStart"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              Start Time
            </FormLabel>
            <FormControl>
              <Input 
                type="time" 
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
        name="pickupTimeEnd"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-accent" />
              End Time
            </FormLabel>
            <FormControl>
              <Input 
                type="time" 
                {...field} 
                disabled={isLoading}
                className="animated-btn"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TimeFields;
