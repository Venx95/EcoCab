
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Settings as SettingsIcon, LogOut, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface Profile {
  name: string;
  email: string;
  phone_number?: string;
  photo_url?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, phone_number, photo_url')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Could not load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="container max-w-xl mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="eco-blur-bg"
      >
        <Card className="glassmorphism">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.photo_url} alt={profile?.name} />
                <AvatarFallback>{profile ? getInitials(profile.name) : 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold text-center">{profile?.name}</CardTitle>
            <CardDescription className="text-center">
              {profile?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Phone Number</span>
                </div>
                <span className="font-medium">{profile?.phone_number || 'Not provided'}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>Member Since</span>
                </div>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 mt-6">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/edit-profile')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="w-4 h-4 mr-2" />
              Member since {new Date().toLocaleDateString()}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Profile;
