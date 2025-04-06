
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import MessageList from '@/components/messages/MessageList';
import { useUser } from '@/hooks/useUser';
import { useRidesContext } from '@/providers/RidesProvider';

const Messages = () => {
  const { user } = useUser();
  const { rides } = useRidesContext();
  const [conversations, setConversations] = useState<any[]>([]);
  
  useEffect(() => {
    // Load conversations from localStorage
    const storedConversations = localStorage.getItem('ecocab_conversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
    
    // Generate conversations from rides if none exist
    else if (rides.length > 0) {
      const initConversations = rides.map(ride => ({
        id: ride.id,
        driverId: ride.driverId,
        driverName: ride.driverName,
        driverPhoto: ride.driverPhoto,
        lastMessage: 'Click to start conversation',
        lastMessageTime: new Date(),
        unread: false
      }));
      
      setConversations(initConversations);
      localStorage.setItem('ecocab_conversations', JSON.stringify(initConversations));
    }
  }, [rides]);

  return (
    <div className="container mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5 text-primary" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {conversations.length > 0 ? (
              <MessageList conversations={conversations} />
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="max-w-xs mt-2">
                  When you book rides or receive booking requests, your conversations will appear here.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Messages;
