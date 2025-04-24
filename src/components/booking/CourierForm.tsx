
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourierFormProps {
  maxWeight: number;
}

const CourierForm = ({ maxWeight }: CourierFormProps) => {
  const [weight, setWeight] = useState<number>(0);
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

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
          Upload Package Photo
        </Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="cursor-pointer"
        />
        {image && (
          <p className="text-sm text-muted-foreground">
            Selected: {image.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default CourierForm;
