import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Car, MapPin, Calendar, Clock, DollarSign, Package, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import MapComponent from '@/components/MapComponent';
import { useUser } from '@/hooks/useUser';
import { useRidesContext } from '@/providers/RidesProvider';
import { Separator } from '@/components/ui/separator';

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

const RegisterRide = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const { addRide, calculateFare } = useRidesContext();

  if (!user) {
    navigate('/login');
    return null;
  }

  const form = useForm<z.infer<typeof formSchema>>({
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

  // Update fare calculation when pickup or destination changes
  const updateFareCalculation = () => {
    if (pickupPoint.length > 2 && destination.length > 2) {
      const fare = calculateFare(pickupPoint, destination);
      setCalculatedFare(fare);
    }
  };

  // Watch for changes in pickup and destination
  form.watch(() => {
    updateFareCalculation();
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      if (!calculatedFare) {
        updateFareCalculation();
      }
      
      const fareAmount = calculatedFare || calculateFare(values.pickupPoint, values.destination);
      
      addRide({
        driverId: user.id,
        driverName: user.name,
        driverPhoto: user.photoURL,
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
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <Car className="mr-2 h-6 w-6 text-primary" />
                Register a Ride
              </CardTitle>
              <CardDescription>
                Share your journey and help others while reducing your carbon footprint
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pickupPoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-primary" />
                            Pickup Point
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. New York City" 
                              {...field} 
                              disabled={isLoading}
                              className="animated-btn"
                              onChange={(e) => {
                                field.onChange(e);
                                updateFareCalculation();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4 text-accent" />
                            Destination
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Boston" 
                              {...field} 
                              disabled={isLoading}
                              className="animated-btn"
                              onChange={(e) => {
                                field.onChange(e);
                                updateFareCalculation();
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
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
                        control={form.control}
                        name="pickupTimeStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-primary" />
                              Start Time
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                disabled={isLoading}
                                className="animated-btn"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="pickupTimeEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Clock className="mr-2 h-4 w-4 text-accent" />
                              End Time
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                disabled={isLoading}
                                className="animated-btn"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="carName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Car className="mr-2 h-4 w-4 text-primary" />
                              Car Model
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Tesla Model 3" 
                                {...field} 
                                disabled={isLoading}
                                className="animated-btn"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="seats"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-primary" />
                              Available Seats
                            </FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value.toString()}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="animated-btn">
                                  <SelectValue placeholder="Select available seats" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7].map(num => (
                                  <SelectItem key={num} value={num.toString()}>
                                    {num} seat{num !== 1 ? 's' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
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
                        control={form.control}
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

                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 mr-2 text-primary" />
                          <span className="font-medium">Suggested Fare:</span>
                        </div>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-xl font-bold"
                        >
                          ${calculatedFare || '—'}
                        </motion.div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Based on distance, time of day, and current demand
                      </div>
                    </div>
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
            </CardContent>
          </Card>
          
          <div className="h-full flex flex-col">
            <Card className="glassmorphism h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-bold">Route Preview</CardTitle>
                <CardDescription>
                  Your journey from {pickupPoint || '(pickup point)'} to {destination || '(destination)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <div className="h-full min-h-[400px]">
                  <MapComponent pickupPoint={pickupPoint} destination={destination} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  <span>Interactive map</span>
                </div>
                <span>© Ecocab Maps</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterRide;
