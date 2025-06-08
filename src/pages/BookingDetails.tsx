
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookingTypeSelector from '@/components/booking/BookingTypeSelector';
import CourierForm from '@/components/booking/CourierForm';
import RideForm from '@/components/booking/RideForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';

type BookingType = 'courier' | 'ride' | null;

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [bookingType, setBookingType] = useState<BookingType>(null);
  const [seats, setSeats] = useState<number>(1);
  const [weight, setWeight] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const ride = location.state?.ride;

  if (!ride) {
    navigate('/book-ride');
    return null;
  }

  const handleBookNow = async () => {
    if (!user) {
      toast.error('Please login to book');
      return;
    }

    if (!bookingType) {
      toast.error('Please select a service type');
      return;
    }

    if (bookingType === 'ride' && seats > ride.seats) {
      toast.error('Not enough seats available');
      return;
    }

    if (bookingType === 'courier' && weight > (ride.luggage_capacity || 0)) {
      toast.error('Package exceeds weight capacity');
      return;
    }

    try {
      setLoading(true);
      
      // Create booking record
      const bookingData = {
        ride_id: ride.id,
        passenger_id: user.id,
        booking_type: bookingType,
        seats_booked: bookingType === 'ride' ? seats : 0,
        package_weight: bookingType === 'courier' ? weight : 0,
        status: 'confirmed'
      };

      const { error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData);

      if (bookingError) {
        console.error('Booking error:', bookingError);
        throw bookingError;
      }

      // Update available seats in the ride
      if (bookingType === 'ride') {
        const { error: updateError } = await supabase
          .from('rides')
          .update({ seats: ride.seats - seats })
          .eq('id', ride.id);

        if (updateError) {
          console.error('Seat update error:', updateError);
          throw updateError;
        }
      }

      toast.success(`${bookingType === 'ride' ? 'Ride' : 'Courier service'} booked successfully!`);
      navigate('/book-ride');
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error('Failed to book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Book Your Service</CardTitle>
          <p className="text-sm text-muted-foreground">
            {ride.pickup_point} → {ride.destination}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookingTypeSelector 
            selected={bookingType} 
            onSelect={setBookingType}
          />

          {bookingType === 'courier' && (
            <CourierForm 
              maxWeight={ride.luggage_capacity || 0} 
              weight={weight}
              setWeight={setWeight}
            />
          )}

          {bookingType === 'ride' && (
            <RideForm 
              maxSeats={ride.seats} 
              seats={seats}
              setSeats={setSeats}
            />
          )}

          {bookingType && (
            <div className="space-y-4">
              <div className="p-4 bg-accent/50 rounded-lg">
                <h4 className="font-medium">Booking Summary</h4>
                <div className="text-sm text-muted-foreground mt-2">
                  <p>Service: {bookingType === 'ride' ? 'Ride Service' : 'Courier Service'}</p>
                  {bookingType === 'ride' && <p>Seats: {seats}</p>}
                  {bookingType === 'courier' && <p>Weight: {weight}kg</p>}
                  <p>Fare: ₹{ride.fare}</p>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBookNow}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Book Now'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetails;
