
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  sender_id: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface ConversationProfile {
  id: string;
  name: string;
  photo_url?: string | null;
}

type ConversationType = {
  user1_id: string;
  user2_id: string;
};

type MessageType = {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  timestamp: string;
  read: boolean;
};

const Conversation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<ConversationProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id || !user) return;
    
    // First, fetch conversation details and other user's profile
    const fetchConversationDetails = async () => {
      try {
        setLoading(true);
        
        // Get conversation to verify user is a participant
        const { data, error: convError } = await supabase
          .from('conversations')
          .select('user1_id, user2_id')
          .eq('id', id)
          .single();
          
        if (convError) throw convError;

        const conversation = data as ConversationType;
        
        // Make sure user is part of this conversation
        if (conversation && (conversation.user1_id !== user.id && conversation.user2_id !== user.id)) {
          toast.error("You don't have access to this conversation");
          navigate('/messages');
          return;
        }
        
        // Get other user's profile
        const otherUserId = conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .eq('id', otherUserId)
          .single();
          
        if (profileError) throw profileError;
        
        const profile = profileData as ConversationProfile;
        setOtherUser(profile);
        
        // Get messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', id)
          .order('timestamp', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        // Format messages
        const formattedMessages = (messagesData || []).map((message: MessageType) => ({
          id: message.id,
          sender_id: message.sender_id,
          text: message.text,
          timestamp: new Date(message.timestamp),
          read: message.read
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        const unreadMessages = messagesData
          .filter((msg: MessageType) => msg.receiver_id === user.id && !msg.read)
          .map((msg: MessageType) => msg.id);
          
        if (unreadMessages.length > 0) {
          await supabase
            .from('messages')
            .update({ read: true })
            .in('id', unreadMessages);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        toast.error("Couldn't load conversation");
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversationDetails();
    
    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, (payload) => {
        // Add new message to the list
        const newMessage = payload.new as MessageType;
        setMessages(prev => [...prev, {
          id: newMessage.id,
          sender_id: newMessage.sender_id,
          text: newMessage.text,
          timestamp: new Date(newMessage.timestamp),
          read: newMessage.read
        }]);
        
        // Mark message as read if it's for the current user
        if (newMessage.receiver_id === user.id) {
          supabase
            .from('messages')
            .update({ read: true })
            .eq('id', newMessage.id);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!messageText.trim() || !id || !user || !otherUser) return;
    
    try {
      // Create new message
      await supabase
        .from('messages')
        .insert({
          conversation_id: id,
          sender_id: user.id,
          receiver_id: otherUser.id,
          text: messageText.trim()
        });
        
      // Update conversation last message
      await supabase
        .from('conversations')
        .update({
          last_message: messageText.trim(),
          last_message_time: new Date().toISOString()
        })
        .eq('id', id);
        
      // Clear input
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Couldn't send message");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center p-3 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/messages')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={otherUser?.photo_url || undefined} />
          <AvatarFallback>{otherUser ? otherUser.name[0] : '?'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{otherUser?.name || 'Unknown User'}</h2>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id;
            
            return (
              <div 
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </motion.div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="p-3 border-t">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!messageText.trim()}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Conversation;
