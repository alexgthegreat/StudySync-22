import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = parseInt(id);
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch group details
  const { 
    data: group, 
    isLoading: isLoadingGroup,
    error: groupError
  } = useQuery({
    queryKey: [`/api/groups/${groupId}`],
    enabled: !!groupId,
  });

  // Check if user is member of the group
  const { data: userGroups } = useQuery({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });
  
  const isGroupMember = userGroups?.some(g => g.id === groupId) || false;

  // Redirect if group not found
  useEffect(() => {
    if (groupError) {
      toast({
        title: "Group not found",
        description: "The requested group does not exist.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [groupError, toast, navigate]);

  if (isLoadingGroup) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button 
                variant="outline" 
                onClick={() => navigate(`/groups/${groupId}`)}
                className="mb-2"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Group
              </Button>
              <h1 className="text-2xl font-bold">{group.name} Chat</h1>
            </div>
          </div>

          {isGroupMember ? (
            <div className="h-[calc(100vh-200px)]">
              <ChatInterface groupId={groupId} groupName={group.name} />
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4">
                  <i className="ri-lock-line text-3xl"></i>
                </div>
                <h3 className="text-xl font-medium text-gray-700">Group Access Required</h3>
                <p className="text-gray-500 mt-2 text-center max-w-md">
                  You need to be a member of this group to access the chat.
                </p>
                <Button 
                  onClick={() => navigate(`/groups/${groupId}`)}
                  className="mt-4"
                >
                  View Group Details
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
