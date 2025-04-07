
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface Ride {
  id: string;
  driver_id: string;
  driverName: string;
  driverPhoto?: string;
  pickup_point: string;
  destination: string;
  pickup_date: string;
  pickup_time_start: string;
  pickup_time_end: string;
  car_name: string;
  fare: number;
  is_courier_available: boolean;
  luggage_capacity?: number;
  seats: number;
  created_at: Date;
}

// Helper function to calculate dynamic pricing
export const calculateFare = async (
  pickupPoint: string,
  destination: string,
  basePrice: number = 20
): Promise<number> => {
  try {
    // For now, use a simplified calculation as Google Maps integration requires actual API key
    // Basic distance calculation based on input strings
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
  } catch (error) {
    console.error("Error calculating fare:", error);
    // Default fare if calculation fails
    return Math.round(basePrice * 5);
  }
};

export const useRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load rides from Supabase on mount
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        
        // Fetch rides from Supabase
        const { data, error } = await supabase
          .from('rides')
          .select(`
            id,
            driver_id,
            pickup_point,
            destination,
            pickup_date,
            pickup_time_start,
            pickup_time_end,
            car_name,
            fare,
            is_courier_available,
            luggage_capacity,
            seats,
            created_at,
            profiles(name, photo_url)
          `);
          
        if (error) throw error;
        
        // Format the data to match the Ride interface
        const formattedRides = data.map(ride => ({
          id: ride.id,
          driver_id: ride.driver_id,
          driverName: ride.profiles?.name || 'Unknown Driver',
          driverPhoto: ride.profiles?.photo_url,
          pickup_point: ride.pickup_point,
          destination: ride.destination,
          pickup_date: ride.pickup_date,
          pickup_time_start: ride.pickup_time_start,
          pickup_time_end: ride.pickup_time_end,
          car_name: ride.car_name,
          fare: ride.fare,
          is_courier_available: ride.is_courier_available || false,
          luggage_capacity: ride.luggage_capacity,
          seats: ride.seats,
          created_at: new Date(ride.created_at || Date.now())
        }));
        
        setRides(formattedRides);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError(err as Error);
        setLoading(false);
      }
    };
    
    fetchRides();
    
    // Set up real-time subscription for new rides
    const channel = supabase
      .channel('rides-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'rides' 
      }, async (payload) => {
        // Fetch the newly added ride with the driver's profile
        const { data, error } = await supabase
          .from('rides')
          .select(`
            id,
            driver_id,
            pickup_point,
            destination,
            pickup_date,
            pickup_time_start,
            pickup_time_end,
            car_name,
            fare,
            is_courier_available,
            luggage_capacity,
            seats,
            created_at,
            profiles(name, photo_url)
          `)
          .eq('id', payload.new.id)
          .single();
          
        if (!error && data) {
          // Add the new ride to the state
          setRides(currentRides => [{
            id: data.id,
            driver_id: data.driver_id,
            driverName: data.profiles?.name || 'Unknown Driver',
            driverPhoto: data.profiles?.photo_url,
            pickup_point: data.pickup_point,
            destination: data.destination,
            pickup_date: data.pickup_date,
            pickup_time_start: data.pickup_time_start,
            pickup_time_end: data.pickup_time_end,
            car_name: data.car_name,
            fare: data.fare,
            is_courier_available: data.is_courier_available || false,
            luggage_capacity: data.luggage_capacity,
            seats: data.seats,
            created_at: new Date(data.created_at || Date.now())
          }, ...currentRides]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add a new ride
  const addRide = async (ride: Omit<Ride, 'id' | 'created_at' | 'driverName' | 'driverPhoto'>) => {
    try {
      const { data: newRide, error } = await supabase
        .from('rides')
        .insert({
          driver_id: ride.driver_id,
          pickup_point: ride.pickup_point,
          destination: ride.destination,
          pickup_date: ride.pickup_date,
          pickup_time_start: ride.pickup_time_start,
          pickup_time_end: ride.pickup_time_end,
          car_name: ride.car_name,
          fare: ride.fare,
          is_courier_available: ride.is_courier_available,
          luggage_capacity: ride.luggage_capacity,
          seats: ride.seats
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return newRide;
    } catch (err) {
      console.error("Error adding ride:", err);
      setError(err as Error);
      throw err;
    }
  };

  // Remove a ride
  const removeRide = async (rideId: string) => {
    try {
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', rideId);
        
      if (error) throw error;
      
      setRides(rides.filter(ride => ride.id !== rideId));
    } catch (err) {
      console.error("Error removing ride:", err);
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
      const matchesPickup = ride.pickup_point.toLowerCase().includes(normalizedPickup);
      const matchesDest = ride.destination.toLowerCase().includes(normalizedDest);
      const matchesDate = !date || ride.pickup_date === date;
      
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
