
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { Control } from "react-hook-form";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimeFieldsProps {
  control: Control<any>;
  isLoading: boolean;
}

const TimeFields = ({ control, isLoading }: TimeFieldsProps) => {
  const [startHour, setStartHour] = useState<string>("");
  const [startMinute, setStartMinute] = useState<string>("");
  const [startAmPm, setStartAmPm] = useState<string>("AM");
  
  const [endHour, setEndHour] = useState<string>("");
  const [endMinute, setEndMinute] = useState<string>("");
  const [endAmPm, setEndAmPm] = useState<string>("AM");

  // Set time in 24-hour format for the form
  useEffect(() => {
    if (startHour && startMinute) {
      let hour = parseInt(startHour);
      if (startAmPm === "PM" && hour < 12) hour += 12;
      if (startAmPm === "AM" && hour === 12) hour = 0;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${startMinute}`;
      control._formValues.pickupTimeStart = timeString;
    }
  }, [startHour, startMinute, startAmPm, control]);

  useEffect(() => {
    if (endHour && endMinute) {
      let hour = parseInt(endHour);
      if (endAmPm === "PM" && hour < 12) hour += 12;
      if (endAmPm === "AM" && hour === 12) hour = 0;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${endMinute}`;
      control._formValues.pickupTimeEnd = timeString;
    }
  }, [endHour, endMinute, endAmPm, control]);

  // Parse time from 24-hour format when form values change
  useEffect(() => {
    const startTime = control._formValues.pickupTimeStart;
    if (startTime) {
      const [hourStr, minuteStr] = startTime.split(':');
      let hour = parseInt(hourStr);
      
      let amPm = "AM";
      if (hour >= 12) {
        amPm = "PM";
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;
      
      setStartHour(hour.toString());
      setStartMinute(minuteStr);
      setStartAmPm(amPm);
    }
  }, [control._formValues.pickupTimeStart]);

  useEffect(() => {
    const endTime = control._formValues.pickupTimeEnd;
    if (endTime) {
      const [hourStr, minuteStr] = endTime.split(':');
      let hour = parseInt(hourStr);
      
      let amPm = "AM";
      if (hour >= 12) {
        amPm = "PM";
        if (hour > 12) hour -= 12;
      }
      if (hour === 0) hour = 12;
      
      setEndHour(hour.toString());
      setEndMinute(minuteStr);
      setEndAmPm(amPm);
    }
  }, [control._formValues.pickupTimeEnd]);

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
            <div className="flex space-x-2">
              <div className="flex-1">
                <Select
                  value={startHour}
                  onValueChange={setStartHour}
                  disabled={isLoading}
                >
                  <SelectTrigger className="animated-btn">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={startMinute}
                  onValueChange={setStartMinute}
                  disabled={isLoading}
                >
                  <SelectTrigger className="animated-btn">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {['00', '15', '30', '45'].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/3">
                <Select
                  value={startAmPm}
                  onValueChange={setStartAmPm}
                  disabled={isLoading}
                >
                  <SelectTrigger className="animated-btn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FormControl>
              <input type="hidden" {...field} />
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
            <div className="flex space-x-2">
              <div className="flex-1">
                <Select
                  value={endHour}
                  onValueChange={setEndHour}
                  disabled={isLoading}
                >
                  <SelectTrigger className="animated-btn">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                      <SelectItem key={h} value={h.toString()}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={endMinute}
                  onValueChange={setEndMinute}
                  disabled={isLoading}
                >
                  <SelectTrigger className="animated-btn">
                    <SelectValue placeholder="Min" />
                  </SelectTrigger>
                  <SelectContent>
                    {['00', '15', '30', '45'].map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/3">
                <Select
                  value={endAmPm}
                  onValueChange={setEndAmPm}
                  disabled={isLoading}
                >
                  <SelectTrigger className="animated-btn">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AM">AM</SelectItem>
                    <SelectItem value="PM">PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FormControl>
              <input type="hidden" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TimeFields;
