
import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { useRides, Ride, FareCalculationResult } from '@/hooks/useRides';
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
  const [offlineRides, setOfflineRides] = useState<Ride[]>(sampleRides);
  const [offlineMode, setOfflineMode] = useState(false); 
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    console.log("Rides provider initialized/refreshed", refreshTrigger);
    
    // Combine online and offline rides
    if (ridesData.rides.length > 0) {
      console.log("Using online rides:", ridesData.rides.length);
      setAllRides(ridesData.rides);
      setOfflineMode(false);
    } else if (ridesData.error) {
      console.log("Falling back to offline mode due to error:", ridesData.error);
      setAllRides(offlineRides);
      setOfflineMode(true);
    }
  }, [ridesData.rides, ridesData.loading, ridesData.error, offlineRides, refreshTrigger]);
  
  const refreshRides = async () => {
    console.log("Manually refreshing rides");
    try {
      // Try to refresh data from the hook
      await ridesData.refreshRides();
      // Also update our local state trigger
      setRefreshTrigger(prev => prev + 1);
      toast.success("Rides refreshed successfully");
    } catch (error) {
      console.error("Error refreshing rides:", error);
      toast.error("Failed to refresh rides");
    }
  };
  
  // Create a wrapper that tries the online mode first, then falls back to offline
  const contextValue: RidesContextType = {
    rides: allRides,
    loading: ridesData.loading,
    error: ridesData.error,
    addRide: async (ride) => {
      try {
        const result = await ridesData.addRide(ride);
        toast.success('Ride registered successfully');
        
        // Immediately add the new ride to our local state to ensure it shows up in searches
        const newRide = {
          ...ride,
          id: result?.id || `offline-${Date.now()}`,
          created_at: new Date(),
          driverName: 'You',
          driverPhoto: 'https://api.dicebear.com/7.x/personas/svg?seed=you'
        };
        
        // Add to all rides collection to make it visible to other users
        setAllRides(prev => [newRide, ...prev]);
        
        return result;
      } catch (error) {
        console.error("Error adding ride, using offline mode:", error);
        toast.warning('Using offline mode for ride registration');
        
        // Generate a unique ID for the new offline ride
        const newId = `offline-${Date.now()}`;
        
        // Add the ride to the offline rides array
        const newRide = {
          ...ride,
          id: newId,
          created_at: new Date(),
          driverName: 'You',
          driverPhoto: 'https://api.dicebear.com/7.x/personas/svg?seed=you'
        };
        
        setOfflineRides(prev => [newRide, ...prev]);
        setAllRides(prev => [newRide, ...prev]);
        
        return { id: newId };
      }
    },
    removeRide: async (rideId) => {
      try {
        await ridesData.removeRide(rideId);
        // Also remove from our local state
        setAllRides(prev => prev.filter(r => r.id !== rideId));
        toast.success("Ride removed successfully");
      } catch (error) {
        console.error("Error removing ride:", error);
        // Remove from offline rides
        setOfflineRides(prev => prev.filter(r => r.id !== rideId));
        setAllRides(prev => prev.filter(r => r.id !== rideId));
        toast.success("Ride removed successfully (offline mode)");
      }
    },
    searchRides: (pickupPoint, destination, date) => {
      console.log("Searching rides with params:", { pickupPoint, destination, date });
      console.log("Available rides for search:", allRides.length);
      
      // Make sure we have the latest rides
      if (allRides.length === 0 && !ridesData.loading) {
        console.log("No rides found, triggering refresh");
        setRefreshTrigger(prev => prev + 1);
      }
      
      // If both inputs are empty, return all rides to make them discoverable
      if (!pickupPoint && !destination) {
        return allRides;
      }
      
      const normalizedPickup = pickupPoint?.toLowerCase().trim() || '';
      const normalizedDest = destination?.toLowerCase().trim() || '';
      
      // Filter rides based on search criteria with improved matching
      const results = allRides.filter(ride => {
        // Use more lenient matching for better search results
        const ridePickup = ride.pickup_point.toLowerCase();
        const rideDest = ride.destination.toLowerCase();
        
        // Check if search terms are contained in the ride locations
        const matchesPickup = !normalizedPickup || 
          ridePickup.includes(normalizedPickup) || 
          normalizedPickup.includes(ridePickup.split(',')[0]);
          
        const matchesDest = !normalizedDest || 
          rideDest.includes(normalizedDest) || 
          normalizedDest.includes(rideDest.split(',')[0]);
          
        const matchesDate = !date || ride.pickup_date === date;
        
        return matchesPickup && matchesDest && matchesDate;
      });
      
      console.log("Search results:", results.length);
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
