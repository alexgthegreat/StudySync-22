import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';

interface Message {
  id: number;
  content: string;
  userId: number;
  sentAt: Date;
  user: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

interface ChatInterfaceProps {
  groupId: number;
  groupName: string;
}

export function ChatInterface({ groupId, groupName }: ChatInterfaceProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get initial messages from API
  const { data: initialMessages, isLoading } = useQuery({
    queryKey: [`/api/groups/${groupId}/messages`],
    enabled: !!user && !!groupId,
  });
  
  // Initialize messages from API
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);
  
  // Setup WebSocket connection
  useEffect(() => {
    if (!user || !groupId) return;
    
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);
    
    newSocket.onopen = () => {
      setIsConnected(true);
      // Join the group's chat
      newSocket.send(JSON.stringify({
        type: 'join',
        userId: user.id,
        groupId
      }));
    };
    
    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message' && data.groupId === groupId) {
          setMessages(prev => [...prev, {
            id: Date.now(), // Temporary ID until refresh
            content: data.content,
            userId: data.userId,
            sentAt: new Date(data.timestamp),
            user: {
              id: data.userId,
              username: data.username || 'Unknown',
              displayName: data.displayName,
              avatarUrl: data.avatarUrl
            }
          }]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    newSocket.onclose = () => {
      setIsConnected(false);
    };
    
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.close();
    };
  }, [user, groupId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !socket || !isConnected || !user) return;
    
    // Send message through WebSocket
    socket.send(JSON.stringify({
      type: 'message',
      userId: user.id,
      groupId,
      content: message,
      timestamp: new Date(),
      username: user.username,
      displayName: user.displayName
    }));
    
    setMessage('');
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-semibold">{groupName} Chat</h2>
        <div className="flex items-center text-sm text-gray-500">
          <span className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.userId === user?.id;
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} gap-2 max-w-[80%]`}>
                    {!isCurrentUser && (
                      <div className="flex-shrink-0 h-8 w-8">
                        {msg.user?.avatarUrl ? (
                          <img 
                            src={msg.user.avatarUrl} 
                            alt={msg.user.displayName || msg.user.username} 
                            className="h-full w-full rounded-full"
                          />
                        ) : (
                          <div className="h-full w-full rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
                            {(msg.user?.displayName || msg.user?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <div 
                        className={`px-3 py-2 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div 
                        className={`text-xs text-gray-500 mt-1 ${
                          isCurrentUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {isCurrentUser ? 'You' : (msg.user?.displayName || msg.user?.username)} • {
                          formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true })
                        }
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSendMessage} className="p-4 border-t flex">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 mr-2"
          disabled={!isConnected}
        />
        <Button type="submit" disabled={!isConnected || !message.trim()}>
          <Send className="h-4 w-4 mr-1" />
          Send
        </Button>
      </form>
    </div>
  );
}
