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
    // First try using precise address
    console.log("Geocoding address:", address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`
    );
    
    if (!response.ok) {
      console.error("Network response was not ok:", response.status);
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log("Geocoding results:", data);
    
    if (data && data.length > 0) {
      // Get the first result, which is considered the best match
      return { 
        lat: parseFloat(data[0].lat), 
        lng: parseFloat(data[0].lon) 
      };
    }
    
    // Try again with a simplified version of the address (just the first part before any comma)
    const simplifiedAddress = address.split(',')[0].trim();
    if (simplifiedAddress !== address) {
      console.log("Trying with simplified address:", simplifiedAddress);
      const simpleResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simplifiedAddress)}&limit=1`
      );
      
      if (simpleResponse.ok) {
        const simpleData = await simpleResponse.json();
        if (simpleData && simpleData.length > 0) {
          return { 
            lat: parseFloat(simpleData[0].lat), 
            lng: parseFloat(simpleData[0].lon) 
          };
        }
      }
    }
    
    // Fallback to simulated coordinates if geocoding fails
    console.log("Geocoding failed for address:", address);
    console.log("Using fallback coordinates");
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

// Calculate dynamic pricing based on distance
export const calculateFare = async (
  pickupPoint: string,
  destination: string,
  basePrice: number = 25
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
    
    // Calculate distance using the utility function
    const distanceKm = calculateDistance(
      pickupCoords.lat, 
      pickupCoords.lng, 
      destCoords.lat, 
      destCoords.lng
    );
    
    console.log("Calculated distance:", distanceKm, "km");
    
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
    
    const result = {
      fare: finalFare,
      distance: Math.round(distanceKm * 10) / 10, // Round to 1 decimal place
      baseFare: Math.round(baseFare),
      distanceCost: Math.round(distanceCost),
      timeCost: Math.round(timeCost),
      surgeFactor
    };
    
    console.log("Fare calculation result:", result);
    return result;
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
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Function to refresh rides
  const refreshRides = useCallback(async () => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  // Load rides from Supabase on mount
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching all rides from Supabase");
        
        // Fetch rides from Supabase
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
        
        console.log("Formatted rides:", formattedRides.length);
        setRides(formattedRides);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError(err as Error);
        setLoading(false);
      }
    };
    
    fetchRides();
    
    // Set up real-time subscription for ride changes
    const channel = supabase
      .channel('rides-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rides' 
      }, async (payload) => {
        console.log("Ride change detected:", payload);
        
        // Refresh all rides to ensure we have the latest data
        fetchRides();
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
      
    return () => {
      console.log("Cleaning up realtime subscription");
      supabase.removeChannel(channel);
    };
  }, [refreshCounter]); // Depend on refreshCounter to allow manual refreshing

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
      
      // Refresh rides after adding
      refreshRides();
      
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

  // Search for rides with improved matching logic
  const searchRides = (
    pickupPoint: string,
    destination: string,
    date: string
  ): Ride[] => {
    if (!pickupPoint && !destination) {
      // Return all rides if no search criteria provided
      return rides;
    }
    
    console.log("Searching rides with parameters:", { pickupPoint, destination, date });
    console.log("Available rides for search:", rides.length);
    
    const normalizedPickup = pickupPoint.toLowerCase().trim();
    const normalizedDest = destination.toLowerCase().trim();
    
    // Include all rides that match the criteria with improved matching logic
    const results = rides.filter(ride => {
      // Normalize ride location data
      const ridePickup = ride.pickup_point.toLowerCase();
      const rideDest = ride.destination.toLowerCase();
      
      // Use more lenient matching for better search results
      let matchesPickup = true;
      if (normalizedPickup) {
        // Check if search term is contained in the pickup location or vice versa
        const pickupMainPart = ridePickup.split(',')[0].trim();
        matchesPickup = ridePickup.includes(normalizedPickup) || 
                       normalizedPickup.includes(pickupMainPart) ||
                       pickupMainPart.includes(normalizedPickup);
      }
      
      let matchesDest = true;
      if (normalizedDest) {
        // Check if search term is contained in the destination or vice versa
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
