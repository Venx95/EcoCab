
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, CircleDashed } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface ChatComponentProps {
  conversationId: string;
  receiverId: string;
  receiverName: string;
  receiverPhoto?: string;
}

const ChatComponent = ({ 
  conversationId, 
  receiverId,
  receiverName,
  receiverPhoto 
}: ChatComponentProps) => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !conversationId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });
          
        if (error) throw error;
        
        setMessages(data || []);
        
        // Mark unread messages as read
        if (data && data.length > 0) {
          const unreadMessages = data.filter(
            msg => msg.receiver_id === user.id && !msg.read
          );
          
          if (unreadMessages.length > 0) {
            await supabase
              .from('messages')
              .update({ read: true })
              .eq('conversation_id', conversationId)
              .eq('receiver_id', user.id)
              .eq('read', false);
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, 
        payload => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark message as read if it was sent to current user
          if (newMessage.receiver_id === user?.id) {
            supabase
              .from('messages')
              .update({ read: true })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [user, conversationId]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Small delay to ensure content is rendered
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !conversationId || sending) return;
    
    try {
      setSending(true);
      const messageText = newMessage.trim();
      setNewMessage(''); // Clear input immediately for better UX
      
      const newMsg = {
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        text: messageText,
        read: false,
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(newMsg);
        
      if (error) throw error;
      
      // Also update the last_message in the conversation
      await supabase
        .from('conversations')
        .update({
          last_message: messageText,
          last_message_time: new Date().toISOString()
        })
        .eq('id', conversationId);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setNewMessage(newMessage); // Restore message if sending failed
    } finally {
      setSending(false);
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch (error) {
      return '';
    }
  };
  
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      let dateKey;
      
      if (isToday(date)) {
        dateKey = 'Today';
      } else if (isYesterday(date)) {
        dateKey = 'Yesterday';
      } else {
        dateKey = format(date, 'MMMM d, yyyy');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <CircleDashed className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const messageGroups = groupMessagesByDate(messages);
  
  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div 
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto px-2 py-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-4">
                <AvatarImage src={receiverPhoto} />
                <AvatarFallback className="text-lg">{receiverName[0]}</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">
                Start your conversation with {receiverName}
              </p>
            </div>
          </div>
        ) : (
          Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
            <div key={dateKey}>
              <div className="flex justify-center mb-4">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {dateKey}
                </span>
              </div>
              
              {dateMessages.map((message, index) => {
                const isCurrentUser = message.sender_id === user?.id;
                const isConsecutive = index > 0 && 
                  dateMessages[index - 1].sender_id === message.sender_id;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${
                      isConsecutive ? 'mt-1' : 'mt-4'
                    }`}
                  >
                    <div className={`flex items-end gap-2 max-w-[75%] ${
                      isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      {!isCurrentUser && !isConsecutive && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={receiverPhoto} />
                          <AvatarFallback>{receiverName[0]}</AvatarFallback>
                        </Avatar>
                      )}
                      
                      {!isCurrentUser && isConsecutive && (
                        <div className="w-8" /> // Spacer for consecutive messages
                      )}
                      
                      <div className={`rounded-lg px-4 py-2 ${
                        isCurrentUser 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm break-words">{message.text}</p>
                        <p className={`text-xs ${
                          isCurrentUser 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        } text-right mt-1`}>
                          {formatMessageTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-4 border-t bg-background">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${receiverName}...`}
          className="flex-grow"
          disabled={sending}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!newMessage.trim() || sending}
        >
          {sending ? (
            <CircleDashed className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatComponent;
