
import { Ride } from '@/hooks/useRides';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, Car, User, MessageSquare } from 'lucide-react';

interface RideCardProps {
  ride: Ride;
}

const RideCard = ({ ride }: RideCardProps) => {
  const {
    driverName,
    driverPhoto,
    pickupPoint,
    destination,
    pickupDate,
    pickupTimeStart,
    pickupTimeEnd,
    carName,
    fare,
    seats,
  } = ride;

  const formattedDate = new Date(pickupDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

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
              {carName}
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
                <div>{pickupPoint}</div>
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
                <span>{pickupTimeStart} - {pickupTimeEnd}</span>
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
        <div className="text-lg font-bold">${fare}</div>
        <div className="space-x-2">
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-1" />
            Contact
          </Button>
          <Button size="sm">Book Now</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RideCard;
