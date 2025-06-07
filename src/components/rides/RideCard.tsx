
import { Ride } from '@/hooks/useRides';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Car, User, Phone, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface RideCardProps {
  ride: Ride;
  showActions?: boolean;
  showDetailedInfo?: boolean;
}

const RideCard = ({ ride, showActions = false, showDetailedInfo = false }: RideCardProps) => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const {
    id,
    driverName,
    driverPhoto,
    pickup_point,
    destination,
    pickup_date,
    pickup_time_start,
    pickup_time_end,
    car_name,
    fare,
    seats,
    driver_id
  } = ride;

  const formattedDate = new Date(pickup_date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  
  const handleCall = async () => {
    try {
      if (!user) {
        toast.error("You must be logged in to call the driver");
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', driver_id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching driver's phone:", error);
        throw error;
      }
        
      if (profile?.phone_number) {
        window.location.href = `tel:${profile.phone_number}`;
        toast.success("Calling driver...");
      } else {
        toast.error("Driver's phone number not available");
      }
    } catch (error) {
      console.error("Error fetching driver's phone:", error);
      toast.error("Could not retrieve driver's contact information");
    }
  };

  const handleMessage = async () => {
    if (!user) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      const { data: existingConversations, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${driver_id}),and(user1_id.eq.${driver_id},user2_id.eq.${user.id})`);
        
      if (convError) {
        console.error("Error checking existing conversations:", convError);
        throw convError;
      }
      
      let conversationId: string;
      
      if (existingConversations && existingConversations.length > 0) {
        conversationId = existingConversations[0].id;
        console.log("Found existing conversation:", conversationId);
      } else {
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            user1_id: user.id,
            user2_id: driver_id
          })
          .select('id')
          .single();
        
        if (error) {
          console.error("Error creating conversation:", error);
          throw error;
        }
        
        if (!newConversation) {
          throw new Error("Failed to create conversation");
        }
        
        conversationId = newConversation.id;
        console.log("Created new conversation:", conversationId);
      }
      
      navigate(`/messages/${conversationId}`);
      
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Could not start conversation. Please try again later.");
    }
  };

  const handleBooking = () => {
    if (!user) {
      toast.error("You must be logged in to book a ride");
      return;
    }
    
    navigate('/booking-details', { state: { ride } });
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={driverPhoto} />
            <AvatarFallback>{driverName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{driverName}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Car className="h-3.5 w-3.5 mr-1" />
              {car_name}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">From</div>
                <div>{pickup_point}</div>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium">To</div>
                <div>{destination}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formattedDate}</span>
              </div>
              
              <div className="flex items-center space-x-1 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{pickup_time_start} - {pickup_time_end}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{seats} seats</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-lg font-bold">₹{fare}</div>
        
        {showActions && user?.id !== driver_id && (
          <div className="space-x-2">
            <Button size="sm" variant="outline" onClick={handleCall}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleMessage}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleBooking}>Book Now</Button>
          </div>
        )}
        
        {showActions && user?.id === driver_id && (
          <div className="space-x-2">
            <Button size="sm" variant="outline" disabled>Your Ride</Button>
          </div>
        )}
        
        {!showActions && user?.id !== driver_id && (
          <div className="space-x-2">
            <Button size="sm" variant="outline" onClick={handleMessage}>
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleBooking}>Book Now</Button>
          </div>
        )}
        
        {!showActions && user?.id === driver_id && (
          <div className="space-x-2">
            <Button size="sm" variant="outline" disabled>Your Ride</Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default RideCard;
