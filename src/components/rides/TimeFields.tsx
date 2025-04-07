
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar, Clock } from "lucide-react";
import { Control } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TimeFieldsProps {
  control: Control<any>;
  isLoading: boolean;
}

const TimeFields = ({ control, isLoading }: TimeFieldsProps) => {
  const [startHour, setStartHour] = useState<string>("12");
  const [startMinute, setStartMinute] = useState<string>("00");
  const [startAmPm, setStartAmPm] = useState<string>("AM");
  
  const [endHour, setEndHour] = useState<string>("12");
  const [endMinute, setEndMinute] = useState<string>("00");
  const [endAmPm, setEndAmPm] = useState<string>("PM");

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

  const handleTimeChange = (field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', value: string) => {
    if (field === 'startHour') {
      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
        setStartHour(value);
      }
    } else if (field === 'startMinute') {
      if (value === '' || (parseInt(value) >= 0 && parseInt(value) < 60)) {
        setStartMinute(value.padStart(2, '0'));
      }
    } else if (field === 'endHour') {
      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
        setEndHour(value);
      }
    } else if (field === 'endMinute') {
      if (value === '' || (parseInt(value) >= 0 && parseInt(value) < 60)) {
        setEndMinute(value.padStart(2, '0'));
      }
    }
  };

  const toggleAmPm = (field: 'start' | 'end') => {
    if (field === 'start') {
      setStartAmPm(prev => prev === 'AM' ? 'PM' : 'AM');
    } else {
      setEndAmPm(prev => prev === 'AM' ? 'PM' : 'AM');
    }
  };

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
              <div className="flex items-center border rounded-md p-2">
                <Input
                  type="number" 
                  className="w-12 border-none text-center p-0"
                  value={startHour}
                  min={1}
                  max={12}
                  disabled={isLoading}
                  onChange={(e) => handleTimeChange('startHour', e.target.value)}
                />
                <span>:</span>
                <Input
                  type="number" 
                  className="w-12 border-none text-center p-0"
                  value={startMinute}
                  min={0}
                  max={59}
                  disabled={isLoading}
                  onChange={(e) => handleTimeChange('startMinute', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => toggleAmPm('start')}
                  disabled={isLoading}
                >
                  {startAmPm}
                </Button>
                <input type="hidden" {...field} />
              </div>
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
              <div className="flex items-center border rounded-md p-2">
                <Input
                  type="number" 
                  className="w-12 border-none text-center p-0"
                  value={endHour}
                  min={1}
                  max={12}
                  disabled={isLoading}
                  onChange={(e) => handleTimeChange('endHour', e.target.value)}
                />
                <span>:</span>
                <Input
                  type="number" 
                  className="w-12 border-none text-center p-0"
                  value={endMinute}
                  min={0}
                  max={59}
                  disabled={isLoading}
                  onChange={(e) => handleTimeChange('endMinute', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => toggleAmPm('end')}
                  disabled={isLoading}
                >
                  {endAmPm}
                </Button>
                <input type="hidden" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TimeFields;
