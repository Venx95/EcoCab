
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Loader2 } from 'lucide-react';
import MessageList from '@/components/messages/MessageList';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';

interface Conversation {
  id: string;
  driverName: string;
  driverPhoto?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
}

const Messages = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Get all conversations where the current user is a participant
        const { data: conversationsData, error } = await supabase
          .from('conversations')
          .select(`
            id,
            user1_id,
            user2_id,
            last_message,
            last_message_time
          `)
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);
          
        if (error) throw error;
        
        // Get details of other participants
        const conversationsWithDetails = await Promise.all(
          (conversationsData || []).map(async (conv) => {
            // Determine which user is the other participant
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
            
            // Get the other participant's profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, photo_url')
              .eq('id', otherUserId)
              .single();
              
            // Get unread message count
            const { data: unreadMessages, error: unreadError } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('conversation_id', conv.id)
              .eq('receiver_id', user.id)
              .eq('read', false);
              
            if (unreadError) throw unreadError;
              
            return {
              id: conv.id,
              driverName: profile?.name || 'Unknown User',
              driverPhoto: profile?.photo_url,
              lastMessage: conv.last_message || 'No messages yet',
              lastMessageTime: conv.last_message_time ? new Date(conv.last_message_time) : new Date(),
              unread: (unreadMessages?.length || 0) > 0
            };
          })
        );
        
        setConversations(conversationsWithDetails);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversations();
  }, [user]);

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
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length > 0 ? (
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
