
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  Search, MapPin, Calendar, ArrowRight, User, 
  Clock, Car, Package, ChevronDown, ChevronUp, X 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MapComponent from '@/components/MapComponent';
import { useUser } from '@/hooks/useUser';
import { useRidesContext } from '@/providers/RidesProvider';
import { Ride } from '@/hooks/useRides';

const searchFormSchema = z.object({
  pickupPoint: z.string().min(1, { message: 'Pickup point is required' }),
  destination: z.string().min(1, { message: 'Destination is required' }),
  date: z.string().optional(),
});

const Index = () => {
  const [searchResults, setSearchResults] = useState<Ride[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { user } = useUser();
  const { searchRides } = useRidesContext();
  
  const form = useForm<z.infer<typeof searchFormSchema>>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      pickupPoint: '',
      destination: '',
      date: new Date().toISOString().split('T')[0],
    },
  });
  
  const pickupPoint = form.watch('pickupPoint');
  const destination = form.watch('destination');
  
  const onSubmit = (values: z.infer<typeof searchFormSchema>) => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Find matching rides
      const results = searchRides(
        values.pickupPoint,
        values.destination,
        values.date || ''
      );
      
      setTimeout(() => {
        setSearchResults(results);
        setIsSearching(false);
        
        if (results.length === 0) {
          toast.info('No rides found matching your criteria');
        }
      }, 1500); // Add a small delay for better UX
    } catch (error) {
      toast.error('Search failed: ' + (error as Error).message);
      setIsSearching(false);
    }
  };
  
  const toggleRideExpand = (rideId: string) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };
  
  const handleClearSearch = () => {
    form.reset();
    setSearchResults([]);
    setHasSearched(false);
    setExpandedRide(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="relative overflow-hidden rounded-lg mb-6 bg-gradient-to-r from-eco-600 to-sky-600 text-white py-10 px-4 md:py-16 md:px-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Sustainable Travel, One Ride at a Time
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl opacity-90 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Connect with drivers, share rides, reduce your carbon footprint
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-lg"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pickupPoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                            <Input 
                              className="pl-10 bg-white/20 border-white/20 placeholder:text-white/60 text-white"
                              placeholder="Pickup location" 
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                            <Input 
                              className="pl-10 bg-white/20 border-white/20 placeholder:text-white/60 text-white"
                              placeholder="Destination" 
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                            <Input 
                              type="date"
                              className="pl-10 bg-white/20 border-white/20 text-white"
                              {...field}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-white/90" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-white text-primary hover:bg-white/90 animated-btn"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> 
                      Find Rides
                    </>
                  )}
                </Button>
                
                {!user && (
                  <div className="text-sm text-white/80 text-center">
                    <Link to="/login" className="underline hover:text-white">
                      Login
                    </Link>{' '}
                    or{' '}
                    <Link to="/signup" className="underline hover:text-white">
                      Sign up
                    </Link>{' '}
                    to offer or book rides
                  </div>
                )}
              </form>
            </Form>
          </motion.div>
          
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="mt-6"
            >
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 animated-btn"
                onClick={() => navigate('/register-ride')}
              >
                <Car className="mr-2 h-4 w-4" />
                Offer a Ride
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto">
        {hasSearched && (
          <div className="mb-4 flex justify-between items-center">
            <motion.h2 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold flex items-center"
            >
              {isSearching ? (
                <>Searching...</>
              ) : (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.length} ride{searchResults.length !== 1 ? 's' : ''} found
                    </>
                  ) : (
                    <>No rides found</>
                  )}
                </>
              )}
            </motion.h2>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleClearSearch}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        )}
        
        {hasSearched && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <AnimatePresence>
                {isSearching ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center p-12"
                  >
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Searching for rides...</p>
                  </motion.div>
                ) : (
                  <>
                    {searchResults.length > 0 ? (
                      <div className="space-y-4">
                        {searchResults.map((ride) => (
                          <motion.div
                            key={ride.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center">
                                    <Avatar className="h-10 w-10 mr-3">
                                      <AvatarImage src={ride.driverPhoto} alt={ride.driverName} />
                                      <AvatarFallback>{ride.driverName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <CardTitle className="text-lg">{ride.driverName}</CardTitle>
                                      <CardDescription>{ride.carName}</CardDescription>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xl font-bold text-primary">${ride.fare}</div>
                                    <div className="text-sm text-muted-foreground">per person</div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-3">
                                <div className="flex items-start space-x-2 mb-4">
                                  <div className="flex flex-col items-center mt-1">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <div className="w-0.5 h-12 bg-border"></div>
                                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <div className="font-medium">{ride.pickupPoint}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {ride.pickupDate} • {ride.pickupTimeStart}-{ride.pickupTimeEnd}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-medium">{ride.destination}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant="outline" className="flex items-center">
                                    <User className="mr-1 h-3 w-3" /> 
                                    {ride.seats} seat{ride.seats !== 1 ? 's' : ''}
                                  </Badge>
                                  {ride.isCourierAvailable && (
                                    <Badge className="bg-accent">
                                      <Package className="mr-1 h-3 w-3" /> 
                                      Courier Available
                                    </Badge>
                                  )}
                                </div>
                                
                                <AnimatePresence>
                                  {expandedRide === ride.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="overflow-hidden"
                                    >
                                      <Separator className="my-3" />
                                      <div className="space-y-3">
                                        {ride.isCourierAvailable && ride.luggageCapacity && (
                                          <div>
                                            <div className="text-sm font-medium">Luggage Capacity</div>
                                            <div className="text-sm">{ride.luggageCapacity} kg</div>
                                          </div>
                                        )}
                                        
                                        <div>
                                          <div className="text-sm font-medium">Vehicle</div>
                                          <div className="text-sm">{ride.carName}</div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                              <CardFooter className="pt-0 flex justify-between">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleRideExpand(ride.id)}
                                >
                                  {expandedRide === ride.id ? (
                                    <>
                                      <ChevronUp className="h-4 w-4 mr-1" />
                                      Less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-4 w-4 mr-1" />
                                      More
                                    </>
                                  )}
                                </Button>
                                
                                <Button size="sm">
                                  Book Ride
                                </Button>
                              </CardFooter>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : hasSearched ? (
                      <Card className="bg-muted/50">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <div className="rounded-full bg-muted p-3 mb-4">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="text-xl font-medium mb-2">No rides found</h3>
                          <p className="text-center text-muted-foreground mb-6">
                            We couldn't find any rides matching your search criteria.
                          </p>
                          <div className="flex gap-4 flex-wrap justify-center">
                            <Button 
                              variant="outline"
                              onClick={handleClearSearch}
                            >
                              Modify Search
                            </Button>
                            
                            {user && (
                              <Button onClick={() => navigate('/register-ride')}>
                                <Car className="mr-2 h-4 w-4" />
                                Offer this Ride
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : null}
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <Card className="sticky top-20 glassmorphism">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Route Preview</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {pickupPoint && destination ? (
                      <>
                        {pickupPoint} <ArrowRight className="inline h-3 w-3 mx-1" /> {destination}
                      </>
                    ) : (
                      'Search for a ride to see the route'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="h-[300px] rounded-lg overflow-hidden">
                    <MapComponent 
                      pickupPoint={pickupPoint || undefined} 
                      destination={destination || undefined}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {!hasSearched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 space-y-4"
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Package className="h-5 w-5 mr-2 text-accent" /> 
                        Courier Service
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Many of our drivers also offer courier services for delivering packages. 
                        Search for rides and look for the courier badge.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <User className="h-5 w-5 mr-2 text-primary" /> 
                        New to Ecocab?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Create an account to book rides or offer your own rides to the community.
                      </p>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" asChild size="sm">
                          <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link to="/signup">Sign up</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        )}
        
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="py-8"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">How Ecocab Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Connect with fellow travelers, reduce your carbon footprint, and save money on your daily commute
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-background to-muted flex flex-col">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Search className="h-6 w-6" />
                  </div>
                  <CardTitle>Find a Ride</CardTitle>
                  <CardDescription>
                    Search for available rides matching your route and schedule
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Enter your pickup location, destination, and preferred date to find drivers heading your way.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-background to-muted flex flex-col">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Car className="h-6 w-6" />
                  </div>
                  <CardTitle>Offer a Ride</CardTitle>
                  <CardDescription>
                    Share your journey with others and offset your travel costs
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Register your planned trips, set your price, and let Ecocab connect you with passengers going your way.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-background to-muted flex flex-col">
                <CardHeader>
                  <div className="mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <CardTitle>Courier Service</CardTitle>
                  <CardDescription>
                    Send or deliver packages along with your rides
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">
                    Drivers can opt to offer courier services, helping deliver packages while completing their regular routes.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" className="animated-btn" onClick={() => form.setFocus('pickupPoint')}>
                  <Search className="mr-2 h-5 w-5" />
                  Search for Rides
                </Button>
                
                {user ? (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="animated-btn"
                    onClick={() => navigate('/register-ride')}
                  >
                    <Car className="mr-2 h-5 w-5" />
                    Offer a Ride
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="animated-btn"
                    onClick={() => navigate('/signup')}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Create Account
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
