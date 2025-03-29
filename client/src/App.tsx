import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GroupPage from "@/pages/group-page";
import MaterialsPage from "@/pages/materials-page";
import ForumPage from "@/pages/forum-page";
import ChatPage from "@/pages/chat-page";
import PreviewPage from "@/pages/preview-page";
import NotificationsPage from "@/pages/notifications-page";
import CalendarPage from "@/pages/calendar-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";

// Create a list of all groups to handle multiple entries
import { useState, useEffect, createContext, useContext } from "react";
import { Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/preview" component={PreviewPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/groups/:id" component={GroupPage} />
      <ProtectedRoute path="/groups" component={() => <GroupsIndexPage />} />
      <ProtectedRoute path="/materials" component={MaterialsPage} />
      <ProtectedRoute path="/forum" component={ForumPage} />
      <ProtectedRoute path="/chat/:id" component={ChatPage} />
      <ProtectedRoute path="/chat" component={() => <ChatIndexPage />} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Placeholder components for index pages
function GroupsIndexPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch groups from API
      fetch('/api/groups/popular')
        .then(res => res.json())
        .then(data => {
          setGroups(data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching groups:', err);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Study Groups</h1>
      
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : groups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
              <p className="text-gray-600 mb-4">{group.description || "No description available"}</p>
              <Link href={`/groups/${group.id}`} className="text-blue-600 hover:underline inline-flex items-center">
                <Users className="mr-2 h-4 w-4" />
                View Group
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-medium mb-2">No Study Groups Available</h2>
          <p className="text-gray-500 mb-6">Be the first to create a study group!</p>
          <Link href="/groups/create" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            <Users className="mr-2 h-4 w-4" />
            Create a Group
          </Link>
        </div>
      )}
    </div>
  );
}

function ChatIndexPage() {
  const [chatGroups, setChatGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fetch groups for chat
      fetch('/api/groups/my-groups')
        .then(res => res.json())
        .then(data => {
          setChatGroups(data || []);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching chat groups:', err);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Chat Rooms</h1>
      
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      ) : chatGroups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{group.name}</h2>
              <p className="text-gray-600 mb-4">
                {group.lastMessage ? 
                  `Last message: ${group.lastMessage.substring(0, 30)}${group.lastMessage.length > 30 ? '...' : ''}` : 
                  'No messages yet'
                }
              </p>
              <Link href={`/chat/${group.id}`} className="text-blue-600 hover:underline flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Open Chat
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
          <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <h2 className="text-xl font-medium mb-2">No Chat Rooms Available</h2>
          <p className="text-gray-500 mb-6">Join or create a study group to start chatting!</p>
          <Link href="/groups" className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            <Users className="mr-2 h-4 w-4" />
            Browse Groups
          </Link>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
