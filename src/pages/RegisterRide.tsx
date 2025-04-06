
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import MapComponent from '@/components/MapComponent';
import { useUser } from '@/hooks/useUser';
import { Car, MapPin } from 'lucide-react';
import RideRegistrationForm from '@/components/rides/RideRegistrationForm';

const RegisterRide = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Form values from the form component for map display
  const getFormValues = () => {
    const formElement = document.querySelector('form');
    if (!formElement) return { pickupPoint: '', destination: '' };
    
    const formData = new FormData(formElement as HTMLFormElement);
    return {
      pickupPoint: formData.get('pickupPoint') as string || '',
      destination: formData.get('destination') as string || ''
    };
  };

  const { pickupPoint, destination } = getFormValues();

  if (!user) {
    navigate('/login');
    return null;
  }

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
              <RideRegistrationForm />
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
