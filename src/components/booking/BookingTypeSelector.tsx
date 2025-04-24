
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Car, Package } from "lucide-react";

interface BookingTypeSelectorProps {
  selected: 'courier' | 'ride' | null;
  onSelect: (type: 'courier' | 'ride') => void;
}

const BookingTypeSelector = ({ selected, onSelect }: BookingTypeSelectorProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Service Type</h3>
      <RadioGroup
        value={selected || ""}
        onValueChange={(value) => onSelect(value as 'courier' | 'ride')}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <RadioGroupItem
            value="ride"
            id="ride"
            className="peer sr-only"
          />
          <Label
            htmlFor="ride"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Car className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="font-medium leading-none">Ride Service</p>
              <p className="text-sm text-muted-foreground">Book seats for travel</p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem
            value="courier"
            id="courier"
            className="peer sr-only"
          />
          <Label
            htmlFor="courier"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
          >
            <Package className="mb-3 h-6 w-6" />
            <div className="space-y-1 text-center">
              <p className="font-medium leading-none">Courier Service</p>
              <p className="text-sm text-muted-foreground">Send packages</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default BookingTypeSelector;
