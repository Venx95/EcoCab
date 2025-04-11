
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import RideCard from '@/components/rides/RideCard';
import { Ride } from '@/hooks/useRides';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDashed } from 'lucide-react';

const MyRides = () => {
  const { user } = useUser();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyRides = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            profiles:driver_id(name, photo_url)
          `)
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Format the data to match the Ride interface
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
        
        setRides(formattedRides);
      } catch (err) {
        console.error("Error fetching rides:", err);
        setError("Failed to load your rides. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyRides();
  }, [user]);

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
        <CardContent className="py-8 text-center text-destructive">
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardHeader className="px-0">
        <CardTitle className="text-xl font-bold">My Published Rides</CardTitle>
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
