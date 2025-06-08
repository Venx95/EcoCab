
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CircleDashed } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import ChatComponent from '@/components/messages/ChatComponent';

interface ConversationUser {
  id: string;
  name: string;
  photo_url?: string;
}

const Conversation = () => {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState<ConversationUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!user || !conversationId) {
        navigate('/messages');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if we have a valid session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error("Session error:", sessionError);
          navigate('/login');
          return;
        }
        
        // First, fetch the conversation to get the other user's ID
        const { data: conversationData, error: conversationError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();
          
        if (conversationError) {
          console.error("Conversation error:", conversationError);
          throw conversationError;
        }
        
        if (!conversationData) {
          setError('Conversation not found');
          return;
        }
        
        // Determine which user is the receiver
        const receiverId = conversationData.user1_id === user.id 
          ? conversationData.user2_id 
          : conversationData.user1_id;
        
        // Then, fetch the receiver's profile
        const { data: receiverData, error: receiverError } = await supabase
          .from('profiles')
          .select('id, name, photo_url')
          .eq('id', receiverId)
          .single();
          
        if (receiverError) {
          console.error("Receiver error:", receiverError);
          throw receiverError;
        }
        
        setReceiver(receiverData);
      } catch (error) {
        console.error('Error fetching conversation details:', error);
        setError('Failed to load conversation');
        toast.error('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    
    fetchConversationDetails();
  }, [conversationId, user, navigate]);
  
  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center h-60">
        <CircleDashed className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !receiver) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Conversation not found'}</p>
          <Button onClick={() => navigate('/messages')}>Back to Messages</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-2 max-w-3xl">
      <div className="flex items-center mb-4 p-2 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/messages')}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={receiver.photo_url} />
          <AvatarFallback>{receiver.name[0]}</AvatarFallback>
        </Avatar>
        
        <h2 className="font-medium">{receiver.name}</h2>
      </div>
      
      <ChatComponent 
        conversationId={conversationId || ''} 
        receiverId={receiver.id}
        receiverName={receiver.name}
        receiverPhoto={receiver.photo_url}
      />
    </div>
  );
};

export default Conversation;
