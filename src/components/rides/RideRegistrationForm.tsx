
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useUser } from '@/hooks/useUser';
import { useRidesContext } from '@/providers/RidesProvider';
import { FareCalculationResult } from '@/hooks/useRides';

import LocationFields from './LocationFields';
import TimeFields from './TimeFields';
import CarFields from './CarFields';
import CourierFields from './CourierFields';
import FareDisplay from './FareDisplay';

const formSchema = z.object({
  pickupPoint: z.string().min(3, { message: 'Pickup point must be at least 3 characters' }),
  destination: z.string().min(3, { message: 'Destination must be at least 3 characters' }),
  pickupDate: z.string().min(1, { message: 'Please select a date' }),
  pickupTimeStart: z.string().min(1, { message: 'Please select a start time' }),
  pickupTimeEnd: z.string().min(1, { message: 'Please select an end time' }),
  carName: z.string().min(3, { message: 'Car name must be at least 3 characters' }),
  seats: z.coerce.number().min(1, { message: 'Must have at least 1 seat' }),
  isCourierAvailable: z.boolean().default(false),
  luggageCapacity: z.coerce.number().optional()
    .refine((val) => !val || !isNaN(val), { message: 'Must be a number' }),
  phoneNumber: z.string().min(10, { message: 'Phone number must be at least 10 characters' })
});

export type RideFormValues = z.infer<typeof formSchema>;

const RideRegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
  const [fareDetails, setFareDetails] = useState<{
    distance: number;
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    surgeFactor: number;
  } | null>(null);
  
  const navigate = useNavigate();
  const { user } = useUser();
  const { calculateFare, addRide } = useRidesContext();

  const form = useForm<RideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pickupPoint: '',
      destination: '',
      pickupDate: '',
      pickupTimeStart: '',
      pickupTimeEnd: '',
      carName: '',
      seats: 4,
      isCourierAvailable: false,
      luggageCapacity: undefined,
      phoneNumber: user?.phoneNumber || ''
    },
  });

  const isCourierAvailable = form.watch('isCourierAvailable');
  const pickupPoint = form.watch('pickupPoint');
  const destination = form.watch('destination');

  // Create memoized function to update fare calculation
  const updateFareCalculation = useCallback(async () => {
    if (pickupPoint.length > 2 && destination.length > 2) {
      try {
        console.log("Calculating fare between:", pickupPoint, destination);
        const fareResult = await calculateFare(pickupPoint, destination);
        console.log("Fare calculation result:", fareResult);
        
        setCalculatedFare(fareResult.fare);
        setFareDetails({
          distance: fareResult.distance,
          baseFare: fareResult.baseFare,
          distanceCost: fareResult.distanceCost,
          timeCost: fareResult.timeCost,
          surgeFactor: fareResult.surgeFactor
        });
      } catch (err) {
        console.error("Error calculating fare:", err);
        setCalculatedFare(null);
        setFareDetails(null);
      }
    }
  }, [pickupPoint, destination, calculateFare]);

  // Update fare when locations change
  useEffect(() => {
    if (pickupPoint && destination) {
      updateFareCalculation();
    }
  }, [pickupPoint, destination, updateFareCalculation]);

  const onSubmit = async (values: RideFormValues) => {
    if (!user) {
      toast.error("You must be logged in to register a ride");
      return;
    }

    try {
      setIsLoading(true);
      
      let fare: number;
      let fareData: FareCalculationResult;
      
      if (calculatedFare) {
        fare = calculatedFare;
        fareData = {
          fare: calculatedFare,
          distance: fareDetails?.distance || 0,
          baseFare: fareDetails?.baseFare || 0,
          distanceCost: fareDetails?.distanceCost || 0,
          timeCost: fareDetails?.timeCost || 0,
          surgeFactor: fareDetails?.surgeFactor || 1.0
        };
      } else {
        // Calculate fare before submitting
        fareData = await calculateFare(values.pickupPoint, values.destination);
        fare = fareData.fare;
      }
      
      console.log("Submitting ride with fare:", fare, "and details:", fareData);

      // Prepare ride data
      const rideData = {
        driver_id: user.id,
        pickup_point: values.pickupPoint,
        destination: values.destination,
        pickup_date: values.pickupDate,
        pickup_time_start: values.pickupTimeStart,
        pickup_time_end: values.pickupTimeEnd,
        car_name: values.carName,
        fare,
        is_courier_available: values.isCourierAvailable,
        luggage_capacity: values.luggageCapacity,
        seats: values.seats,
      };
      
      const result = await addRide(rideData);
      
      if (!result) {
        throw new Error("Failed to register ride");
      }
      
      toast.success('Ride registered successfully!');
      navigate('/');
    } catch (error) {
      console.error("Error registering ride:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to register ride: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <LocationFields 
            control={form.control} 
            isLoading={isLoading} 
            updateFareCalculation={updateFareCalculation}
          />
          
          <TimeFields 
            control={form.control} 
            isLoading={isLoading} 
          />
          
          <CarFields 
            control={form.control} 
            isLoading={isLoading} 
          />
          
          <CourierFields 
            control={form.control} 
            isLoading={isLoading}
            isCourierAvailable={isCourierAvailable}
          />
          
          {/* Phone Number Field */}
          <div className="space-y-2">
            <div className="form-group">
              <label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</label>
              <input
                {...form.register('phoneNumber')}
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                className="w-full mt-1 px-3 py-2 border rounded-md shadow-sm"
                disabled={isLoading}
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>
          </div>
          
          <FareDisplay 
            calculatedFare={calculatedFare}
            distance={fareDetails?.distance}
            baseFare={fareDetails?.baseFare}
            distanceSurcharge={fareDetails?.distanceCost}
            timeSurcharge={fareDetails?.timeCost}
            surgeFactor={fareDetails?.surgeFactor}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full animated-btn"
          disabled={isLoading}
        >
          <Car className="mr-2 h-4 w-4" />
          {isLoading ? 'Registering...' : 'Register Ride'}
        </Button>
      </form>
    </Form>
  );
};

export default RideRegistrationForm;
