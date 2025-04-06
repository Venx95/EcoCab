
import { useState, useEffect } from 'react';

export interface Ride {
  id: string;
  driverId: string;
  driverName: string;
  driverPhoto?: string;
  driverPhone?: string; // Added driverPhone property
  pickupPoint: string;
  destination: string;
  pickupDate: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  carName: string;
  fare: number;
  isCourierAvailable: boolean;
  luggageCapacity?: number;
  seats: number;
  createdAt: Date;
}

// Helper function to calculate dynamic pricing
export const calculateFare = (
  pickupPoint: string,
  destination: string,
  basePrice: number = 20
): number => {
  // Mock distance calculation based on string lengths
  // In a real app, this would use a mapping API to calculate actual distance
  const distanceFactor = Math.max(
    5,
    (pickupPoint.length + destination.length) / 4
  );
  
  // Add randomness for demo purposes
  const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
  
  // Calculate the fare with surge pricing based on time of day
  const hour = new Date().getHours();
  let surgeFactor = 1.0;
  
  // Peak hours
  if ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19)) {
    surgeFactor = 1.3;
  }
  
  const calculatedFare = basePrice * distanceFactor * randomFactor * surgeFactor;
  
  // Round to nearest integer
  return Math.round(calculatedFare);
};

export const useRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load rides from localStorage on mount
  useEffect(() => {
    try {
      const storedRides = localStorage.getItem('ecocab_rides');
      if (storedRides) {
        const parsedRides = JSON.parse(storedRides).map((ride: Ride) => ({
          ...ride,
          createdAt: new Date(ride.createdAt),
        }));
        setRides(parsedRides);
      }
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, []);

  // Add a new ride
  const addRide = (ride: Omit<Ride, 'id' | 'createdAt'>) => {
    try {
      const newRide: Ride = {
        ...ride,
        id: 'ride_' + Math.random().toString(36).substring(2, 9),
        createdAt: new Date(),
      };
      
      const updatedRides = [...rides, newRide];
      setRides(updatedRides);
      
      // Save to localStorage
      localStorage.setItem('ecocab_rides', JSON.stringify(updatedRides));
      
      return newRide;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Remove a ride
  const removeRide = (rideId: string) => {
    try {
      const updatedRides = rides.filter(ride => ride.id !== rideId);
      setRides(updatedRides);
      
      // Save to localStorage
      localStorage.setItem('ecocab_rides', JSON.stringify(updatedRides));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Search for rides
  const searchRides = (
    pickupPoint: string,
    destination: string,
    date: string
  ): Ride[] => {
    if (!pickupPoint && !destination) {
      return [];
    }
    
    const normalizedPickup = pickupPoint.toLowerCase().trim();
    const normalizedDest = destination.toLowerCase().trim();
    
    return rides.filter(ride => {
      const matchesPickup = ride.pickupPoint.toLowerCase().includes(normalizedPickup);
      const matchesDest = ride.destination.toLowerCase().includes(normalizedDest);
      const matchesDate = !date || ride.pickupDate === date;
      
      return matchesPickup && matchesDest && matchesDate;
    });
  };

  return {
    rides,
    loading,
    error,
    addRide,
    removeRide,
    searchRides,
    calculateFare,
  };
};
