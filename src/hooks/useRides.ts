import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateDistance } from '@/components/MapComponent';

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

// Helper function to convert an address to coordinates using OpenStreetMap Nominatim API
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  if (!address || address.trim() === '') {
    console.log("Empty address provided for geocoding");
    return null;
  }
  
  try {
    console.log("Geocoding address:", address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'EcoCab-App/1.0'
        }
      }
    );
    
    if (!response.ok) {
      console.error("Network response was not ok:", response.status);
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log("Geocoding results:", data);
    
    if (data && data.length > 0) {
      return { 
        lat: parseFloat(data[0].lat), 
        lng: parseFloat(data[0].lon) 
      };
    }
    
    console.log("Geocoding failed for address:", address);
    console.log("Using fallback coordinates");
    const hashValue = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate realistic coordinates for India
    const lat = 13 + (hashValue % 15) / 10;
    const lng = 77 + (hashValue % 20) / 10;
    
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

// Simplified pricing: Rs. 3 per kilometer with minimum fare of Rs. 15
export const calculateFare = async (
  pickupPoint: string,
  destination: string
): Promise<FareCalculationResult> => {
  try {
    console.log("Calculating fare for:", { pickupPoint, destination });
    
    // Convert addresses to coordinates
    const pickupCoords = await geocodeAddress(pickupPoint);
    const destCoords = await geocodeAddress(destination);
    
    if (!pickupCoords || !destCoords) {
      console.error("Could not geocode addresses:", { pickupPoint, destination });
      throw new Error("Could not geocode addresses");
    }
    
    console.log("Coordinates determined:", { 
      pickup: pickupCoords,
      destination: destCoords
    });
    
    // Calculate distance with higher precision using Haversine formula
    const distanceKm = calculateDistance(
      pickupCoords.lat, 
      pickupCoords.lng, 
      destCoords.lat, 
      destCoords.lng
    );
    
    console.log("Calculated distance:", distanceKm, "km");
    
    // New pricing formula: Rs. 3 per kilometer
    const perKmRate = 3;
    const calculatedFare = Math.round(distanceKm * perKmRate);
    
    // Ensure minimum fare of Rs. 15
    const finalFare = Math.max(calculatedFare, 15);
    
    const result = {
      fare: finalFare,
      distance: Math.round(distanceKm * 10) / 10, // Round to 1 decimal place
      baseFare: 15, // Minimum fare
      distanceCost: Math.max(0, calculatedFare - 15), // Additional cost beyond minimum
      timeCost: 0, // Not used in current formula
      surgeFactor: 1.0 // Not used in current formula
    };
    
    console.log("Fare calculation result:", result);
    return result;
  } catch (error) {
    console.error("Error calculating fare:", error);
    // Default fare if calculation fails
    return {
      fare: 30,
      distance: 10,
      baseFare: 15,
      distanceCost: 15,
      timeCost: 0,
      surgeFactor: 1.0
    };
  }
};

export const useRides = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refreshRides = useCallback(async () => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Load rides from Supabase with better error handling
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all rides from Supabase");
        
        // Check if we have a valid session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }
        
        if (!session) {
          console.log("No active session found");
          setRides([]);
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            profiles:driver_id(name, photo_url)
          `)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching rides:", error);
          throw error;
        }
        
        console.log("Fetched rides:", data ? data.length : 0);
        
        if (!data || data.length === 0) {
          console.log("No rides found in database");
          setRides([]);
          setLoading(false);
          return;
        }
        
        const formattedRides = data.map(ride => {
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
        
        console.log("Formatted rides:", formattedRides.length);
        setRides(formattedRides);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError(err as Error);
        setRides([]);
        setLoading(false);
      }
    };
    
    fetchRides();
    
    const channel = supabase
      .channel('rides-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rides' 
      }, async (payload) => {
        console.log("Ride change detected:", payload);
        fetchRides();
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [refreshCounter]);

  // Add a new ride with improved error handling and retry logic
  const addRide = async (ride: Omit<Ride, 'id' | 'created_at' | 'driverName' | 'driverPhoto'>) => {
    try {
      console.log("Adding new ride:", ride);
      
      // Check session before attempting to add ride
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication required to add ride");
      }
      
      // Validate required fields
      if (!ride.pickup_point || !ride.destination || !ride.pickup_date) {
        throw new Error("Missing required fields: pickup point, destination, or date");
      }
      
      const { data: newRide, error } = await supabase
        .from('rides')
        .insert({
          driver_id: ride.driver_id,
          pickup_point: ride.pickup_point.trim(),
          destination: ride.destination.trim(),
          pickup_date: ride.pickup_date,
          pickup_time_start: ride.pickup_time_start,
          pickup_time_end: ride.pickup_time_end,
          car_name: ride.car_name.trim(),
          fare: ride.fare,
          is_courier_available: ride.is_courier_available,
          luggage_capacity: ride.luggage_capacity,
          seats: ride.seats
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error adding ride:", error);
        throw new Error(`Failed to register ride: ${error.message}`);
      }
      
      console.log("New ride added successfully:", newRide);
      refreshRides();
      return newRide;
    } catch (err) {
      console.error("Error adding ride:", err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(new Error(errorMessage));
      throw new Error(errorMessage);
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

  // Search for rides
  const searchRides = (
    pickupPoint: string,
    destination: string,
    date: string
  ): Ride[] => {
    if (!pickupPoint && !destination) {
      return rides;
    }
    
    console.log("Searching rides with parameters:", { pickupPoint, destination, date });
    console.log("Available rides for search:", rides.length);
    
    const normalizedPickup = pickupPoint.toLowerCase().trim();
    const normalizedDest = destination.toLowerCase().trim();
    
    const results = rides.filter(ride => {
      const ridePickup = ride.pickup_point.toLowerCase();
      const rideDest = ride.destination.toLowerCase();
      
      let matchesPickup = true;
      if (normalizedPickup) {
        const pickupMainPart = ridePickup.split(',')[0].trim();
        matchesPickup = ridePickup.includes(normalizedPickup) || 
                       normalizedPickup.includes(pickupMainPart) ||
                       pickupMainPart.includes(normalizedPickup);
      }
      
      let matchesDest = true;
      if (normalizedDest) {
        const destMainPart = rideDest.split(',')[0].trim();
        matchesDest = rideDest.includes(normalizedDest) || 
                     normalizedDest.includes(destMainPart) ||
                     destMainPart.includes(normalizedDest);
      }
      
      const matchesDate = !date || ride.pickup_date === date;
      
      return matchesPickup && matchesDest && matchesDate;
    });
    
    console.log("Search results:", results.length);
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
    refreshRides,
  };
};
