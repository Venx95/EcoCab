
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Save, User, Upload } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useUser } from '@/hooks/useUser';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phoneNumber: z.string().optional(),
  photoURL: z.string().optional(),
});

const EditProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      photoURL: user?.photoURL || '',
    },
  });

  // Fetch profile data from Supabase
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, email, phone_number, photo_url')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          form.setValue('name', data.name || '');
          form.setValue('email', data.email || '');
          form.setValue('phoneNumber', data.phone_number || '');
          form.setValue('photoURL', data.photo_url || '');
          if (data.photo_url) {
            setPreviewImage(data.photo_url);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    
    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        toast.error('User not authenticated');
        return;
      }
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          name: values.name,
          phone_number: values.phoneNumber,
          photo_url: previewImage || values.photoURL,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Also update auth context
      await updateProfile({
        name: values.name,
        phoneNumber: values.phoneNumber,
        photoURL: previewImage || values.photoURL,
      });
      
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      toast.error('Update failed: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

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
            <div className="flex flex-col items-center justify-center mb-4">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={previewImage || user?.photoURL} alt={user?.name} />
                <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
              </Avatar>
              
              <div className="flex items-center">
                <Label 
                  htmlFor="profile-picture" 
                  className="cursor-pointer flex items-center gap-2 text-sm font-medium px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Label>
                <Input 
                  id="profile-picture" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Edit Your Profile</CardTitle>
            <CardDescription className="text-center">
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          {...field} 
                          disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 (555) 123-4567" 
                          {...field} 
                          value={field.value || ''}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full animated-btn"
                  disabled={isLoading}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EditProfile;
