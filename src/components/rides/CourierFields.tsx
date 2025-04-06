
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Package } from "lucide-react";
import { Control } from "react-hook-form";

interface CourierFieldsProps {
  control: Control<any>;
  isLoading: boolean;
  isCourierAvailable: boolean;
}

const CourierFields = ({ control, isLoading, isCourierAvailable }: CourierFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="isCourierAvailable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isLoading}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-primary" />
                Available for Courier Services
              </FormLabel>
              <FormDescription>
                Indicate if you're willing to carry packages or deliveries
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      {isCourierAvailable && (
        <FormField
          control={control}
          name="luggageCapacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-accent" />
                Luggage Capacity (kg)
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Max weight in kg" 
                  {...field} 
                  value={field.value ?? ''}
                  disabled={isLoading}
                  className="animated-btn"
                />
              </FormControl>
              <FormDescription>
                Maximum weight of packages you can carry (in kilograms)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default CourierFields;
