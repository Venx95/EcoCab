
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/hooks/useUser';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  sender_id: string;
  receiver_id: string;
  timestamp: string;
  read: boolean;
}

interface ConversationData {
  id: string;
  user1_id: string;
  user2_id: string;
  other_user_name?: string;
}

const Conversation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (!id) {
      console.log('No conversation ID found, redirecting to messages');
      navigate('/messages');
      return;
    }

    fetchConversation();
    fetchMessages();
  }, [id, user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    if (!user || !id) return;

    try {
      console.log('Fetching conversation:', id);
      
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (conversationError) {
        console.error('Error fetching conversation:', conversationError);
        toast.error('Conversation not found');
        navigate('/messages');
        return;
      }

      // Check if user is part of this conversation
      if (conversationData.user1_id !== user.id && conversationData.user2_id !== user.id) {
        console.error('User not authorized for this conversation');
        toast.error('You are not authorized to view this conversation');
        navigate('/messages');
        return;
      }

      // Get other user details
      const otherUserId = conversationData.user1_id === user.id 
        ? conversationData.user2_id 
        : conversationData.user1_id;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', otherUserId)
        .single();

      setConversation({
        ...conversationData,
        other_user_name: profileData?.name || 'Unknown User'
      });
    } catch (error) {
      console.error('Error in fetchConversation:', error);
      toast.error('Failed to load conversation');
      navigate('/messages');
    }
  };

  const fetchMessages = async () => {
    if (!user || !id) return;

    try {
      console.log('Fetching messages for conversation:', id);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('timestamp', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      console.log('Messages fetched:', messagesData);
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !conversation || sending) return;

    const otherUserId = conversation.user1_id === user.id 
      ? conversation.user2_id 
      : conversation.user1_id;

    try {
      setSending(true);

      const messageData = {
        conversation_id: id!,
        sender_id: user.id,
        receiver_id: otherUserId,
        text: newMessage.trim(),
        read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: newMessage.trim(),
          last_message_time: new Date().toISOString()
        })
        .eq('id', id!);

      setMessages(prev => [...prev, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardContent className="text-center py-8">
            <p>Please log in to view messages.</p>
            <Button onClick={() => navigate('/login')} className="mt-4">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Card className="h-[calc(100vh-8rem)]">
        <CardHeader className="flex flex-row items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/messages')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">
              {conversation?.other_user_name || 'Loading...'}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="flex flex-col h-full p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No messages yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start the conversation by sending a message
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg ${
                      message.sender_id === user.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user.id 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Conversation;
