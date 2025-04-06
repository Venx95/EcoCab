
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  driverName: string;
  driverPhoto?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unread: boolean;
}

interface MessageListProps {
  conversations: Conversation[];
}

const MessageList = ({ conversations }: MessageListProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div 
          key={conversation.id}
          onClick={() => navigate(`/messages/${conversation.id}`)}
          className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
            conversation.unread ? 'bg-gray-50 dark:bg-gray-900' : ''
          }`}
        >
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={conversation.driverPhoto} />
            <AvatarFallback>{conversation.driverName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-center">
              <h4 className="font-medium truncate">{conversation.driverName}</h4>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
              </span>
            </div>
            <p className={`text-sm truncate ${conversation.unread ? 'font-medium' : 'text-muted-foreground'}`}>
              {conversation.lastMessage}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
