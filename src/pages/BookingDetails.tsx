
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BookingTypeSelector from '@/components/booking/BookingTypeSelector';
import CourierForm from '@/components/booking/CourierForm';
import RideForm from '@/components/booking/RideForm';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type BookingType = 'courier' | 'ride' | null;

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingType, setBookingType] = useState<BookingType>(null);
  const ride = location.state?.ride;

  if (!ride) {
    navigate('/book-ride');
    return null;
  }

  const handlePayment = () => {
    // Placeholder for payment integration
    toast.success('Payment feature coming soon!');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Book Your Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookingTypeSelector 
            selected={bookingType} 
            onSelect={setBookingType}
          />

          {bookingType === 'courier' && (
            <CourierForm maxWeight={ride.luggageCapacity || 0} />
          )}

          {bookingType === 'ride' && (
            <RideForm maxSeats={ride.seats} />
          )}

          {bookingType && (
            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePayment}
            >
              Proceed to Payment
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetails;
