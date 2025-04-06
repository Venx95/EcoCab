
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/hooks/useUser';
import { useRidesContext } from '@/providers/RidesProvider';
import { toast } from 'sonner';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}

interface ConversationData {
  id: string;
  driverId: string;
  driverName: string;
  driverPhoto?: string;
  messages: Message[];
}

const Conversation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const { rides } = useRidesContext();
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Find the ride associated with this conversation
  const ride = rides.find(r => r.id === id);

  useEffect(() => {
    // Load existing conversation or create a new one
    const storedConversations = localStorage.getItem('ecocab_messages');
    let conversations = storedConversations ? JSON.parse(storedConversations) : {};
    
    if (id && ride) {
      if (!conversations[id]) {
        // Initialize new conversation
        conversations[id] = {
          id,
          driverId: ride.driverId,
          driverName: ride.driverName,
          driverPhoto: ride.driverPhoto,
          messages: []
        };
        
        localStorage.setItem('ecocab_messages', JSON.stringify(conversations));
      }
      
      setConversation(conversations[id]);
    } else if (id) {
      // Try to load conversation directly
      if (conversations[id]) {
        setConversation(conversations[id]);
      } else {
        toast.error("Conversation not found");
        navigate('/messages');
      }
    }
  }, [id, ride, navigate]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const sendMessage = () => {
    if (!messageText.trim() || !id || !user) return;
    
    // Create new message
    const newMessage = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      text: messageText.trim(),
      timestamp: new Date(),
      read: false
    };
    
    // Update conversation in state
    setConversation(prev => {
      if (!prev) return null;
      
      const updatedConversation = {
        ...prev,
        messages: [...prev.messages, newMessage]
      };
      
      // Save to localStorage
      const storedConversations = localStorage.getItem('ecocab_messages');
      let conversations = storedConversations ? JSON.parse(storedConversations) : {};
      conversations[id] = updatedConversation;
      localStorage.setItem('ecocab_messages', JSON.stringify(conversations));
      
      // Update conversations list for unread badge
      const conversationsList = localStorage.getItem('ecocab_conversations');
      if (conversationsList) {
        const list = JSON.parse(conversationsList);
        const updatedList = list.map((conv: any) => {
          if (conv.id === id) {
            return {
              ...conv,
              lastMessage: newMessage.text,
              lastMessageTime: newMessage.timestamp
            };
          }
          return conv;
        });
        localStorage.setItem('ecocab_conversations', JSON.stringify(updatedList));
      }
      
      return updatedConversation;
    });
    
    // Clear input
    setMessageText('');
  };

  if (!conversation) {
    return <div className="flex justify-center items-center h-full">Loading conversation...</div>;
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
          <AvatarImage src={conversation.driverPhoto} />
          <AvatarFallback>{conversation.driverName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-medium">{conversation.driverName}</h2>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Send a message to start the conversation</p>
          </div>
        ) : (
          conversation.messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            
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
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
