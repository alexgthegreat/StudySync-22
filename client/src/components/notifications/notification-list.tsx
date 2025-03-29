import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Bell, MessageSquare, Users, Calendar, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';

// Types for notifications
interface Notification {
  id: number;
  type: 'message' | 'group' | 'material' | 'exam';
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
  sourceId: number; // ID of the related group, chat, etc.
  userId: number;
}

export function NotificationList() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch group notifications (simulating API call)
  const { data: userGroups = [] } = useQuery<Array<{id: number; name: string; description?: string}>>({
    queryKey: ['/api/groups/my-groups'],
    enabled: !!user,
  });

  // Fetch messages for notifications
  const { data: messages = [] } = useQuery<Array<{id: number; groupId: number; content: string; sentAt?: Date; groupName?: string}>>({
    queryKey: ['/api/messages/recent'],
    enabled: !!user,
  });

  // Generate notifications based on real data from the groups and messages
  useEffect(() => {
    const newNotifications: Notification[] = [];
    
    // Add notifications from groups if available
    if (userGroups.length > 0) {
      userGroups.forEach((group, index) => {
        if (group.id) {
          newNotifications.push({
            id: newNotifications.length + 1,
            type: 'group',
            title: `Group Activity: ${group.name}`,
            description: `New activity in your study group "${group.name}"`,
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 3), // Random time in last 3 days
            read: Math.random() > 0.5,
            sourceId: group.id,
            userId: user?.id || 0
          });
        }
      });
    }

    // Add notifications from messages if available
    if (messages.length > 0) {
      messages.forEach((message, index) => {
        if (message.groupId) {
          newNotifications.push({
            id: 100 + newNotifications.length + 1,
            type: 'message',
            title: `New Message in ${message.groupName || 'Chat'}`,
            description: message.content.substring(0, 40) + (message.content.length > 40 ? '...' : ''),
            timestamp: new Date(message.sentAt || Date.now() - Math.random() * 86400000),
            read: false,
            sourceId: message.groupId,
            userId: user?.id || 0
          });
        }
      });
    }

    // Add a few sample notifications if no real data
    if (newNotifications.length === 0) {
      // Sample notifications for demonstration
      newNotifications.push(
        {
          id: 1,
          type: 'message',
          title: 'New Message in Math 101',
          description: 'Alice: Does anyone have the notes from yesterday\'s lecture?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          sourceId: 1,
          userId: user?.id || 0
        },
        {
          id: 2,
          type: 'group',
          title: 'New Member in CS Study Group',
          description: 'John Smith joined your CS study group',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          sourceId: 2,
          userId: user?.id || 0
        },
        {
          id: 3,
          type: 'exam',
          title: 'Exam Reminder: Physics Final',
          description: 'Your Physics final exam is scheduled for tomorrow',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: false,
          sourceId: 1,
          userId: user?.id || 0
        },
        {
          id: 4,
          type: 'material',
          title: 'New Study Material Available',
          description: 'New study guide for Biology 202 has been uploaded',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          read: true,
          sourceId: 3,
          userId: user?.id || 0
        }
      );
    }

    // Sort notifications by timestamp (newest first)
    newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setNotifications(newNotifications);
  }, [user, userGroups, messages]);

  // Filter notifications based on tab
  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.type === activeTab);

  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'group':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'exam':
        return <Calendar className="w-5 h-5 text-red-500" />;
      case 'material':
        return <FileText className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  // Get route based on notification type
  const getNotificationRoute = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        return `/chat/${notification.sourceId}`;
      case 'group':
        return `/groups/${notification.sourceId}`;
      case 'exam':
        return `/calendar`;
      case 'material':
        return `/materials`;
      default:
        return '/';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="w-full max-w-md mx-auto bg-card border rounded-xl shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5">
              {unreadCount} new
            </span>
          )}
        </h2>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs">
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="px-4 pt-2">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="group">Groups</TabsTrigger>
            <TabsTrigger value="exam">Exams</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="m-0">
          <NotificationItems 
            notifications={filteredNotifications}
            getNotificationIcon={getNotificationIcon}
            getNotificationRoute={getNotificationRoute}
            markAsRead={markAsRead}
          />
        </TabsContent>
        
        <TabsContent value="message" className="m-0">
          <NotificationItems 
            notifications={filteredNotifications}
            getNotificationIcon={getNotificationIcon}
            getNotificationRoute={getNotificationRoute}
            markAsRead={markAsRead}
          />
        </TabsContent>
        
        <TabsContent value="group" className="m-0">
          <NotificationItems 
            notifications={filteredNotifications}
            getNotificationIcon={getNotificationIcon}
            getNotificationRoute={getNotificationRoute}
            markAsRead={markAsRead}
          />
        </TabsContent>
        
        <TabsContent value="exam" className="m-0">
          <NotificationItems 
            notifications={filteredNotifications}
            getNotificationIcon={getNotificationIcon}
            getNotificationRoute={getNotificationRoute}
            markAsRead={markAsRead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NotificationItemsProps {
  notifications: Notification[];
  getNotificationIcon: (type: string) => JSX.Element;
  getNotificationRoute: (notification: Notification) => string;
  markAsRead: (id: number) => void;
}

function NotificationItems({ 
  notifications, 
  getNotificationIcon, 
  getNotificationRoute, 
  markAsRead 
}: NotificationItemsProps) {
  if (notifications.length === 0) {
    return (
      <div className="py-12 px-4 text-center text-gray-500">
        <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No notifications yet</p>
        <p className="text-sm mt-1">We'll notify you when something important happens</p>
      </div>
    );
  }

  return (
    <div className="divide-y max-h-[400px] overflow-y-auto">
      {notifications.map((notification) => (
        <Link 
          key={notification.id} 
          href={getNotificationRoute(notification)}
          onClick={() => markAsRead(notification.id)}
        >
          <div 
            className={`p-4 flex gap-3 hover:bg-accent cursor-pointer ${
              !notification.read ? 'bg-primary/5' : ''
            }`}
          >
            <div className="flex-shrink-0 mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${!notification.read ? 'text-primary' : ''}`}>
                {notification.title}
              </p>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {notification.description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
              </p>
            </div>
            {!notification.read && (
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}