
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

// Helper function to calculate Haversine distance between two points
const calculateHaversineDistance = (
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number
): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371; // Earth's radius in km
  
  const dLat = toRad(endLat - startLat);
  const dLng = toRad(endLng - startLng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(startLat)) * 
    Math.cos(toRad(endLat)) * 
    Math.sin(dLng / 2) * 
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

// Helper function to convert an address to coordinates
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number}> => {
  try {
    // This would ideally use a proper geocoding API
    // For demo purposes, we'll simulate coordinates based on string length
    // In a production app, use Google Maps Geocoding API or similar
    const hashValue = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate somewhat realistic looking coordinates
    const lat = 13 + (hashValue % 15) / 10; // Latitude roughly around India
    const lng = 77 + (hashValue % 20) / 10; // Longitude roughly around India
    
    return { lat, lng };
  } catch (error) {
    console.error("Geocoding error:", error);
    // Default coordinates (Bangalore)
    return { lat: 12.9716, lng: 77.5946 };
  }
};

// Helper function to calculate dynamic pricing
export const calculateFare = async (
  pickupPoint: string,
  destination: string,
  basePrice: number = 25
): Promise<number> => {
  try {
    // Convert addresses to coordinates
    const pickupCoords = await geocodeAddress(pickupPoint);
    const destCoords = await geocodeAddress(destination);
    
    // Calculate distance using Haversine formula
    const distanceKm = calculateHaversineDistance(
      pickupCoords.lat, 
      pickupCoords.lng, 
      destCoords.lat, 
      destCoords.lng
    );
    
    // Fare components based on Uber/Ola style pricing
    const baseFare = basePrice; // Base fare in Rupees
    const perKmRate = 8; // Per km rate in Rupees
    const distanceCost = distanceKm * perKmRate;
    
    // Time-based pricing
    const estimatedMinutesPerKm = 3; // Average time per km
    const estimatedTripTimeMinutes = distanceKm * estimatedMinutesPerKm;
    const perMinuteRate = 2; // Per minute rate in Rupees
    const timeCost = estimatedTripTimeMinutes * perMinuteRate;
    
    // Surge pricing based on time of day
    const hour = new Date().getHours();
    let surgeFactor = 1.0;
    
    // Peak hours: morning rush (7-10 AM) and evening rush (4-7 PM)
    if ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19)) {
      surgeFactor = 1.4;
    }
    
    // Calculate final fare with surge pricing
    const calculatedFare = (baseFare + distanceCost + timeCost) * surgeFactor;
    
    // Ensure minimum fare and round to nearest integer
    return Math.max(Math.round(calculatedFare), baseFare);
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
        const formattedRides = data.map(ride => {
          // Handle the case where profiles is a SelectQueryError
          const profileData = ride.profiles as any;
          const driverName = profileData && typeof profileData === 'object' ? 
            profileData.name || 'Unknown Driver' : 'Unknown Driver';
          const driverPhoto = profileData && typeof profileData === 'object' ?
            profileData.photo_url : undefined;
          
          return {
            id: ride.id,
            driver_id: ride.driver_id,
            driverName,
            driverPhoto,
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
          };
        });
        
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
          // Handle the case where profiles is a SelectQueryError
          const profileData = data.profiles as any;
          const driverName = profileData && typeof profileData === 'object' ? 
            profileData.name || 'Unknown Driver' : 'Unknown Driver';
          const driverPhoto = profileData && typeof profileData === 'object' ?
            profileData.photo_url : undefined;
            
          // Add the new ride to the state
          setRides(currentRides => [{
            id: data.id,
            driver_id: data.driver_id,
            driverName,
            driverPhoto,
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

  // Search for rides - Improved to include current user's rides
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
    
    // Include all rides that match the criteria without filtering by user
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
