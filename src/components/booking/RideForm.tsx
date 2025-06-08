
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RideFormProps {
  maxSeats: number;
  seats: number;
  setSeats: (seats: number) => void;
}

const RideForm = ({ maxSeats, seats, setSeats }: RideFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="seats" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Number of Seats
        </Label>
        <Select value={seats.toString()} onValueChange={(value) => setSeats(Number(value))}>
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
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default RideForm;
