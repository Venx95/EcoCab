
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Car } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useUser } from '@/hooks/useUser';
import { useRidesContext } from '@/providers/RidesProvider';

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
    .refine((val) => !val || !isNaN(val), { message: 'Must be a number' })
});

export type RideFormValues = z.infer<typeof formSchema>;

const RideRegistrationForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const { addRide, calculateFare } = useRidesContext();

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
    },
  });

  const isCourierAvailable = form.watch('isCourierAvailable');
  const pickupPoint = form.watch('pickupPoint');
  const destination = form.watch('destination');

  const updateFareCalculation = () => {
    if (pickupPoint.length > 2 && destination.length > 2) {
      const fare = calculateFare(pickupPoint, destination);
      setCalculatedFare(fare);
    }
  };

  useEffect(() => {
    updateFareCalculation();
  }, [pickupPoint, destination]);

  const onSubmit = async (values: RideFormValues) => {
    try {
      setIsLoading(true);
      
      if (!calculatedFare) {
        updateFareCalculation();
      }
      
      const fareAmount = calculatedFare || calculateFare(values.pickupPoint, values.destination);
      
      addRide({
        driverId: user!.id,
        driverName: user!.name,
        driverPhoto: user!.photoURL,
        driverPhone: user!.phoneNumber, // Include driver's phone number
        pickupPoint: values.pickupPoint,
        destination: values.destination,
        pickupDate: values.pickupDate,
        pickupTimeStart: values.pickupTimeStart,
        pickupTimeEnd: values.pickupTimeEnd,
        carName: values.carName,
        fare: fareAmount,
        isCourierAvailable: values.isCourierAvailable,
        luggageCapacity: values.luggageCapacity,
        seats: values.seats,
      });
      
      toast.success('Ride registered successfully');
      navigate('/');
    } catch (error) {
      toast.error('Ride registration failed: ' + (error as Error).message);
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
          
          <FareDisplay calculatedFare={calculatedFare} />
        </div>

        <Button 
          type="submit" 
          className="w-full animated-btn"
          disabled={isLoading}
        >
          <Car className="mr-2 h-4 w-4" />
          Register Ride
        </Button>
      </form>
    </Form>
  );
};

export default RideRegistrationForm;
