
import { ReactNode, createContext, useContext, useState } from 'react';
import { useRides, Ride, FareCalculationResult } from '@/hooks/useRides';

interface RidesContextType {
  rides: Ride[];
  loading: boolean;
  error: Error | null;
  addRide: (ride: Omit<Ride, 'id' | 'created_at' | 'driverName' | 'driverPhoto'>) => Promise<any>;
  removeRide: (rideId: string) => Promise<void>;
  searchRides: (pickupPoint: string, destination: string, date: string) => Ride[];
  calculateFare: (pickupPoint: string, destination: string, basePrice?: number) => Promise<FareCalculationResult>;
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

// Sample rides data for offline mode
const sampleRides: Ride[] = [
  {
    id: '1',
    driver_id: 'sample-driver-1',
    driverName: 'John Doe',
    driverPhoto: 'https://api.dicebear.com/7.x/personas/svg?seed=john',
    pickup_point: 'Central Park',
    destination: 'Times Square',
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_time_start: '09:00',
    pickup_time_end: '09:30',
    car_name: 'Tesla Model 3',
    fare: 25,
    is_courier_available: true,
    seats: 4,
    created_at: new Date()
  },
  {
    id: '2',
    driver_id: 'sample-driver-2',
    driverName: 'Jane Smith',
    driverPhoto: 'https://api.dicebear.com/7.x/personas/svg?seed=jane',
    pickup_point: 'Brooklyn Bridge',
    destination: 'Empire State Building',
    pickup_date: new Date().toISOString().split('T')[0],
    pickup_time_start: '10:00',
    pickup_time_end: '10:30',
    car_name: 'Toyota Prius',
    fare: 20,
    is_courier_available: false,
    seats: 3,
    created_at: new Date()
  }
];

export const RidesProvider = ({ children }: RidesProviderProps) => {
  const ridesData = useRides();
  const [offlineMode] = useState(true); // Set to true to always use offline mode until Supabase is fixed
  
  // Create a wrapper that tries the online mode first, then falls back to offline
  const contextValue: RidesContextType = {
    rides: ridesData.rides.length > 0 && !offlineMode ? ridesData.rides : sampleRides,
    loading: ridesData.loading,
    error: ridesData.error,
    addRide: async (ride) => {
      try {
        return await ridesData.addRide(ride);
      } catch (error) {
        console.error("Error adding ride, using offline mode:", error);
        // Generate a unique ID for the new offline ride
        const newId = `offline-${Date.now()}`;
        
        // Add the ride to the sample rides array
        const newRide = {
          ...ride,
          id: newId,
          created_at: new Date(),
          driverName: 'You',
          driverPhoto: 'https://api.dicebear.com/7.x/personas/svg?seed=you'
        };
        
        sampleRides.push(newRide);
        
        return { id: newId };
      }
    },
    removeRide: async (rideId) => {
      try {
        await ridesData.removeRide(rideId);
      } catch (error) {
        console.error("Error removing ride:", error);
        // Remove from sample rides if in offline mode
        const index = sampleRides.findIndex(r => r.id === rideId);
        if (index !== -1) {
          sampleRides.splice(index, 1);
        }
      }
    },
    searchRides: (pickupPoint, destination, date) => {
      // First try online search
      const onlineResults = ridesData.searchRides(pickupPoint, destination, date);
      
      if (onlineResults.length > 0 && !offlineMode) {
        return onlineResults;
      }
      
      // Fall back to offline search
      if (!pickupPoint && !destination) {
        return sampleRides;
      }
      
      const normalizedPickup = pickupPoint.toLowerCase().trim();
      const normalizedDest = destination.toLowerCase().trim();
      
      const results = sampleRides.filter(ride => {
        const matchesPickup = !normalizedPickup || ride.pickup_point.toLowerCase().includes(normalizedPickup);
        const matchesDest = !normalizedDest || ride.destination.toLowerCase().includes(normalizedDest);
        const matchesDate = !date || ride.pickup_date === date;
        
        return matchesPickup && matchesDest && matchesDate;
      });
      
      console.log("Offline search results:", results);
      return results;
    },
    calculateFare: ridesData.calculateFare,
  };
  
  return (
    <RidesContext.Provider value={contextValue}>
      {children}
    </RidesContext.Provider>
  );
};

export default RidesProvider;
