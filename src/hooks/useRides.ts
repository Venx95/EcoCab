
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
export const calculateHaversineDistance = (
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
// In a production app, this would use Google Maps Geocoding API or similar
const geocodeAddress = async (address: string): Promise<{lat: number, lng: number}> => {
  try {
    // For demo purposes, we'll simulate coordinates based on string length
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

export interface FareCalculationResult {
  fare: number;
  distance: number;
  baseFare: number;
  distanceCost: number;
  timeCost: number;
  surgeFactor: number;
}

// Helper function to calculate dynamic pricing
export const calculateFare = async (
  pickupPoint: string,
  destination: string,
  basePrice: number = 25
): Promise<FareCalculationResult> => {
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
    const finalFare = Math.max(Math.round(calculatedFare), baseFare);
    
    return {
      fare: finalFare,
      distance: Math.round(distanceKm * 10) / 10, // Round to 1 decimal place
      baseFare: Math.round(baseFare),
      distanceCost: Math.round(distanceCost),
      timeCost: Math.round(timeCost),
      surgeFactor
    };
  } catch (error) {
    console.error("Error calculating fare:", error);
    // Default fare if calculation fails
    return {
      fare: Math.round(basePrice * 5),
      distance: 5,
      baseFare: basePrice,
      distanceCost: basePrice * 2,
      timeCost: basePrice * 2,
      surgeFactor: 1.0
    };
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
        console.log("Fetching rides from Supabase");
        
        // Fetch rides from Supabase
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            profiles:driver_id(name, photo_url)
          `);
          
        if (error) {
          console.error("Error fetching rides:", error);
          throw error;
        }
        
        console.log("Fetched rides:", data);
        
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
        
        console.log("Formatted rides:", formattedRides);
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
        console.log("New ride detected:", payload);
        
        // Fetch the newly added ride with the driver's profile
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            profiles:driver_id(name, photo_url)
          `)
          .eq('id', payload.new.id)
          .single();
          
        if (!error && data) {
          console.log("Fetched new ride details:", data);
          
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
        } else {
          console.error("Error fetching new ride details:", error);
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
      console.log("Adding new ride:", ride);
      
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
        
      if (error) {
        console.error("Error adding ride:", error);
        throw error;
      }
      
      console.log("New ride added successfully:", newRide);
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
      console.log("Removing ride:", rideId);
      
      const { error } = await supabase
        .from('rides')
        .delete()
        .eq('id', rideId);
        
      if (error) {
        console.error("Error removing ride:", error);
        throw error;
      }
      
      console.log("Ride removed successfully");
      setRides(rides.filter(ride => ride.id !== rideId));
    } catch (err) {
      console.error("Error removing ride:", err);
      setError(err as Error);
      throw err;
    }
  };

  // Search for rides - Fixed to include all matching rides
  const searchRides = (
    pickupPoint: string,
    destination: string,
    date: string
  ): Ride[] => {
    if (!pickupPoint && !destination) {
      return [];
    }
    
    console.log("Searching rides with parameters:", { pickupPoint, destination, date });
    console.log("Available rides:", rides);
    
    const normalizedPickup = pickupPoint.toLowerCase().trim();
    const normalizedDest = destination.toLowerCase().trim();
    
    // Include all rides that match the criteria
    const results = rides.filter(ride => {
      const matchesPickup = normalizedPickup ? ride.pickup_point.toLowerCase().includes(normalizedPickup) : true;
      const matchesDest = normalizedDest ? ride.destination.toLowerCase().includes(normalizedDest) : true;
      const matchesDate = date ? ride.pickup_date === date : true;
      
      return matchesPickup && matchesDest && matchesDate;
    });
    
    console.log("Search results:", results);
    return results;
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
