
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Upload } from "lucide-react";

interface CourierFormProps {
  maxWeight: number;
  weight: number;
  setWeight: (weight: number) => void;
}

const CourierForm = ({ maxWeight, weight, setWeight }: CourierFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="weight" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Package Weight (kg)
        </Label>
        <Input
          id="weight"
          type="number"
          min="0"
          max={maxWeight}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          placeholder={`Maximum allowed: ${maxWeight}kg`}
        />
        {weight > maxWeight && (
          <p className="text-sm text-destructive">
            Weight exceeds driver's capacity of {maxWeight}kg
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Package Photo (Optional)
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default CourierForm;
