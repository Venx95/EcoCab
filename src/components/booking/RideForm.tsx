
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Upload } from "lucide-react";

interface RideFormProps {
  maxSeats: number;
}

const RideForm = ({ maxSeats }: RideFormProps) => {
  const [seats, setSeats] = useState<string>("1");
  const [image, setImage] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seats" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Number of Seats
        </Label>
        <Select value={seats} onValueChange={setSeats}>
          <SelectTrigger>
            <SelectValue placeholder="Select number of seats" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxSeats }, (_, i) => i + 1).map((num) => (
              <SelectItem key={num} value={num.toString()}>
                {num} {num === 1 ? 'seat' : 'seats'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Luggage Photo (Optional)
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

export default RideForm;
