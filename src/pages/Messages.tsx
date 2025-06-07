
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CircleDashed } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { toast } from 'sonner';

interface ConversationWithProfile {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message: string;
  last_message_time: string;
  otherUser: {
    id: string;
    name: string;
    photo_url?: string;
  };
  unreadCount: number;
}

const Messages = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        setLoading(true);
        
        // Fetch conversations where current user is involved
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .order('last_message_time', { ascending: false });

        if (conversationsError) throw conversationsError;

        if (!conversationsData || conversationsData.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }

        // Get all other user IDs
        const otherUserIds = conversationsData.map(conv => 
          conv.user1_id === user.id ? conv.user2_id : conv.user1_id
        );

        // Fetch profiles for other users
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .in('id', otherUserIds);

        if (profilesError) throw profilesError;

        // Get unread message counts for each conversation
        const conversationsWithProfiles = await Promise.all(
          conversationsData.map(async (conv) => {
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
            const otherUser = profilesData?.find(profile => profile.id === otherUserId);

            // Count unread messages
            const { count: unreadCount } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('receiver_id', user.id)
              .eq('read', false);

            return {
              ...conv,
              otherUser: otherUser || { id: otherUserId, name: 'Unknown User' },
              unreadCount: unreadCount || 0
            };
          })
        );

        setConversations(conversationsWithProfiles);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for conversation updates
    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user1_id=eq.${user.id}`
      }, () => {
        fetchConversations();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `user2_id=eq.${user.id}`
      }, () => {
        fetchConversations();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 pb-20">
        <div className="flex justify-center items-center h-60">
          <CircleDashed className="h-8 w-8 animate-spin text-primary" />
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start chatting by messaging a driver from their ride listing
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationClick(conversation.id)}
                  className="flex items-center p-4 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                >
                  <Avatar className="h-12 w-12 mr-3">
                    <AvatarImage src={conversation.otherUser.photo_url} />
                    <AvatarFallback>{conversation.otherUser.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium truncate">{conversation.otherUser.name}</h4>
                      <div className="flex items-center gap-2">
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {conversation.last_message_time && 
                            formatDistanceToNow(new Date(conversation.last_message_time), { addSuffix: true })
                          }
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message || 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <BottomNavigation />
    </div>
  );
};

export default Messages;
