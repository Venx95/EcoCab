
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useRides, Ride, FareCalculationResult } from '@/hooks/useRides';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface RidesContextType {
  rides: Ride[];
  loading: boolean;
  error: Error | null;
  addRide: (ride: Omit<Ride, 'id' | 'created_at' | 'driverName' | 'driverPhoto'>) => Promise<any>;
  removeRide: (rideId: string) => Promise<void>;
  searchRides: (pickupPoint: string, destination: string, date: string) => Ride[];
  calculateFare: (pickupPoint: string, destination: string, basePrice?: number) => Promise<FareCalculationResult>;
  refreshRides: () => Promise<void>;
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
  const { user } = useUser();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    console.log("Rides provider initialized/refreshed", refreshTrigger);
    console.log("Current user:", user?.id);
    console.log("Total rides available:", ridesData.rides.length);
  }, [refreshTrigger, user, ridesData.rides.length]);
  
  const refreshRides = async () => {
    console.log("Manually refreshing rides");
    try {
      await ridesData.refreshRides();
      setRefreshTrigger(prev => prev + 1);
      toast.success("Rides refreshed successfully");
    } catch (error) {
      console.error("Error refreshing rides:", error);
      toast.error("Failed to refresh rides");
    }
  };
  
  const contextValue: RidesContextType = {
    rides: ridesData.rides,
    loading: ridesData.loading,
    error: ridesData.error,
    addRide: async (ride) => {
      console.log("RidesProvider: Adding ride", ride);
      console.log("Current user in provider:", user?.id);
      
      if (!user) {
        console.error("No user found when trying to add ride");
        toast.error('You must be logged in to register a ride');
        throw new Error('Authentication required');
      }
      
      try {
        const result = await ridesData.addRide({
          ...ride,
          driver_id: user.id
        });
        console.log("RidesProvider: Ride added successfully", result);
        toast.success('Ride registered successfully');
        return result;
      } catch (error) {
        console.error("RidesProvider: Error adding ride:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to register ride';
        toast.error(errorMessage);
        throw error;
      }
    },
    removeRide: async (rideId) => {
      try {
        await ridesData.removeRide(rideId);
        toast.success("Ride removed successfully");
      } catch (error) {
        console.error("Error removing ride:", error);
        toast.error("Failed to remove ride");
        throw error;
      }
    },
    searchRides: (pickupPoint, destination, date) => {
      console.log("Searching rides with params:", { pickupPoint, destination, date });
      console.log("Available rides for search:", ridesData.rides.length);
      
      // Filter out current user's own rides for search results
      const availableRides = ridesData.rides.filter(ride => ride.driver_id !== user?.id);
      console.log("Available rides (excluding user's own):", availableRides.length);
      
      if (!pickupPoint && !destination) {
        return availableRides;
      }
      
      const normalizedPickup = pickupPoint?.toLowerCase().trim() || '';
      const normalizedDest = destination?.toLowerCase().trim() || '';
      
      const results = availableRides.filter(ride => {
        const ridePickup = ride.pickup_point.toLowerCase();
        const rideDest = ride.destination.toLowerCase();
        
        const matchesPickup = !normalizedPickup || 
          ridePickup.includes(normalizedPickup) || 
          normalizedPickup.includes(ridePickup.split(',')[0]);
          
        const matchesDest = !normalizedDest || 
          rideDest.includes(normalizedDest) || 
          normalizedDest.includes(rideDest.split(',')[0]);
          
        const matchesDate = !date || ride.pickup_date === date;
        
        return matchesPickup && matchesDest && matchesDate;
      });
      
      console.log("Search results (excluding user's own rides):", results.length);
      return results;
    },
    calculateFare: ridesData.calculateFare,
    refreshRides
  };
  
  return (
    <RidesContext.Provider value={contextValue}>
      {children}
    </RidesContext.Provider>
  );
};

export default RidesProvider;
