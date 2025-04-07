
import { ReactNode, createContext, useContext } from 'react';
import { useRides, Ride } from '@/hooks/useRides';

interface RidesContextType {
  rides: Ride[];
  loading: boolean;
  error: Error | null;
  addRide: (ride: Omit<Ride, 'id' | 'created_at' | 'driverName' | 'driverPhoto'>) => Promise<any>;
  removeRide: (rideId: string) => Promise<void>;
  searchRides: (pickupPoint: string, destination: string, date: string) => Ride[];
  calculateFare: (pickupPoint: string, destination: string, basePrice?: number) => Promise<number>;
}

const RidesContext = createContext<RidesContextType | undefined>(undefined);

export const useRidesContext = () => {
  const context = useContext(RidesContext);
  if (!context) {
    throw new Error('useRidesContext must be used within a RidesProvider');
  }
  return context;
};

interface RidesProviderProps {
  children: ReactNode;
}

export const RidesProvider = ({ children }: RidesProviderProps) => {
  const ridesData = useRides();
  
  return (
    <RidesContext.Provider value={ridesData}>
      {children}
    </RidesContext.Provider>
  );
};

export default RidesProvider;
