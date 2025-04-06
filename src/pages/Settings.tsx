
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Eye, EyeOff, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationTracking, setLocationTracking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleSavePreferences = () => {
    setIsSaving(true);
    
    // Simulate saving preferences
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully');
    }, 1000);
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center mb-8">
          <SettingsIcon className="h-8 w-8 mr-3 text-primary" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user.photoURL} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="mt-2">
                      Change Photo
                    </Button>
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <div className="p-2 border rounded-md bg-muted/50">
                          {user.name}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="p-2 border rounded-md bg-muted/50">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="p-2 border rounded-md bg-muted/50">
                          {user.phoneNumber || 'Not provided'}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="joinedDate">Joined Date</Label>
                        <div className="p-2 border rounded-md bg-muted/50">
                          {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="pt-2 flex flex-col md:flex-row justify-between items-center gap-4">
                  <Button variant="outline" asChild>
                    <a href="/profile">Edit Profile</a>
                  </Button>
                  <Button variant="destructive" onClick={logout}>
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive push notifications for ride updates
                    </div>
                  </div>
                  <Switch 
                    id="push-notifications" 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive email notifications for important updates
                    </div>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotificationsEnabled} 
                    onCheckedChange={setEmailNotificationsEnabled}
                  />
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <Button onClick={handleSavePreferences} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
                <CardDescription>
                  Customize the look and feel of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex items-center">
                    {darkMode ? (
                      <Moon className="h-5 w-5 mr-2 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 mr-2 text-primary" />
                    )}
                    <div>
                      <Label>Theme</Label>
                      <div className="text-sm text-muted-foreground">
                        {darkMode ? 'Dark mode is enabled' : 'Light mode is enabled'}
                      </div>
                    </div>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode}
                  />
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <Button onClick={handleSavePreferences} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Manage your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="location-tracking">Location Tracking</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow the app to track your location for better ride matching
                    </div>
                  </div>
                  <Switch 
                    id="location-tracking" 
                    checked={locationTracking} 
                    onCheckedChange={setLocationTracking}
                  />
                </div>
                
                <Separator />
                
                <div>
                  <Label>Data & Privacy</Label>
                  <div className="text-sm text-muted-foreground mb-2">
                    Manage how your data is collected and used
                  </div>
                  <Button variant="outline" size="sm">
                    Download My Data
                  </Button>
                </div>
                
                <Separator />
                
                <div className="pt-4">
                  <Button onClick={handleSavePreferences} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Settings;
