
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import RideCard from '@/components/rides/RideCard';
import { Ride } from '@/hooks/useRides';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDashed, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const MyRides = () => {
  const { user } = useUser();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyRides = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching rides for user:", user.id);
      
      // Fetch rides for current user
      const { data: ridesData, error: ridesError } = await supabase
        .from('rides')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false });
        
      if (ridesError) {
        console.error("Error fetching user rides:", ridesError);
        throw ridesError;
      }
      
      console.log("Fetched user rides data:", ridesData);
      
      if (!ridesData) {
        setRides([]);
        setLoading(false);
        return;
      }
      
      // Fetch user profile for driver info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, photo_url')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Continue without profile data
      }
      
      // Format the data to match the Ride interface
      const formattedRides = ridesData.map(ride => ({
        id: ride.id,
        driver_id: ride.driver_id,
        driverName: profileData?.name || user.name || 'Unknown Driver',
        driverPhoto: profileData?.photo_url || user.photoURL,
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
      
      console.log("Formatted user rides:", formattedRides);
      setRides(formattedRides);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rides:", err);
      setError("Failed to load your rides. Please try again.");
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      fetchMyRides();
      
      // Set up realtime subscription for ride updates
      const channel = supabase
        .channel('user-rides-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'rides',
          filter: `driver_id=eq.${user.id}` 
        }, () => {
          console.log("User ride change detected, refreshing rides");
          fetchMyRides();
        })
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setLoading(false);
    }
  }, [user, fetchMyRides]);

  const handleRetry = () => {
    fetchMyRides();
    toast.info("Refreshing rides...");
  };

  if (!user) {
    return (
      <Card className="my-4">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">You need to be logged in to view your rides.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <CircleDashed className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="my-4">
        <CardContent className="py-8 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">My Published Rides</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      {rides.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>You haven't published any rides yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} showActions={true} showDetailedInfo={true} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRides;
