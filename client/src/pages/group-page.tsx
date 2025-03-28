import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MaterialList } from "@/components/materials/material-list";
import { UploadDialog } from "@/components/materials/upload-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChatInterface } from "@/components/chat/chat-interface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// Post form schema
const postFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  // Fetch group details
  const { 
    data: group, 
    isLoading: isLoadingGroup,
    error: groupError
  } = useQuery({
    queryKey: [`/api/groups/${groupId}`],
    enabled: !!groupId,
  });

  // Fetch group members
  const { data: members } = useQuery({
    queryKey: [`/api/groups/${groupId}/members`],
    enabled: !!groupId,
  });

  // Fetch group materials
  const { data: materials } = useQuery({
    queryKey: ["/api/materials", { groupId }],
    enabled: !!groupId,
  });

  // Fetch group posts
  const { data: posts, refetch: refetchPosts } = useQuery({
    queryKey: ["/api/posts", { groupId }],
    enabled: !!groupId,
  });

  // Check if user is member of the group
  const { data: userGroups } = useQuery({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });
  
  const isGroupMember = userGroups?.some(g => g.id === groupId) || false;

  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/groups/${groupId}/join`);
      return await res.json();
    },
    onSuccess: () => {
      // Refresh groups data
      queryClient.invalidateQueries({ queryKey: ['/api/groups/my-groups'] });
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/members`] });
      
      toast({
        title: "Joined group",
        description: "You have successfully joined the group.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to join group",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Post form
  const postForm = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      const res = await apiRequest('POST', '/api/posts', {
        ...data,
        groupId,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      postForm.reset();
      refetchPosts();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit post form
  const onPostSubmit = (data: PostFormValues) => {
    createPostMutation.mutate(data);
  };

  // Handle join group
  const handleJoinGroup = () => {
    joinGroupMutation.mutate();
  };

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
          {/* Group Header */}
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{group.name}</h1>
                <p className="text-gray-500 mt-1">{group.description}</p>
              </div>
              
              {!isGroupMember && (
                <Button
                  onClick={handleJoinGroup}
                  disabled={joinGroupMutation.isPending}
                >
                  {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center mt-4 gap-2">
              <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {members?.length || 0} Members
              </span>
              {group.isActive && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Active
                </span>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                Created {group.createdAt ? formatDistanceToNow(new Date(group.createdAt), { addSuffix: true }) : "recently"}
              </span>
            </div>
          </div>

          {/* Group Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white rounded-lg mb-4 p-1">
              <TabsTrigger value="posts">Discussion</TabsTrigger>
              <TabsTrigger value="materials">Study Materials</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="chat">Group Chat</TabsTrigger>
            </TabsList>

            {/* Discussion Tab */}
            <TabsContent value="posts" className="space-y-4">
              {isGroupMember && (
                <Card>
                  <CardHeader>
                    <CardTitle>Start a Discussion</CardTitle>
                    <CardDescription>
                      Share thoughts, ask questions, or start a discussion with your group members.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...postForm}>
                      <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
                        <FormField
                          control={postForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter post title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={postForm.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Content</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="What's on your mind?"
                                  className="min-h-[120px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          disabled={createPostMutation.isPending}
                        >
                          {createPostMutation.isPending ? "Posting..." : "Post"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {posts && posts.length > 0 ? (
                  posts.map(post => (
                    <Card key={post.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{post.title}</CardTitle>
                            <div className="flex items-center mt-1">
                              <Avatar className="h-6 w-6 mr-2">
                                {post.creator?.avatarUrl && (
                                  <AvatarImage src={post.creator.avatarUrl} />
                                )}
                                <AvatarFallback>
                                  {(post.creator?.displayName || post.creator?.username || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-500">
                                {post.creator?.displayName || post.creator?.username}
                                <span className="mx-1">•</span>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                            <i className="ri-chat-1-line mr-1"></i>
                            {post.commentCount}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-line">{post.content}</p>
                      </CardContent>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <Button variant="outline" size="sm">
                          <i className="ri-chat-1-line mr-2"></i>
                          Comment
                        </Button>
                        <Button variant="ghost" size="sm">
                          Share
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <p className="text-gray-500">No discussions have been started yet.</p>
                      {isGroupMember ? (
                        <p className="text-gray-500 mt-1">Be the first to start a discussion!</p>
                      ) : (
                        <p className="text-gray-500 mt-1">Join this group to participate in discussions.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials">
              <MaterialList 
                materials={materials || []}
                onUploadClick={() => setUploadDialogOpen(true)}
              />
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>Group Members</CardTitle>
                  <CardDescription>
                    {members?.length || 0} members in this group
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members?.map(member => (
                      <div key={member.id} className="flex items-center p-3 border rounded-lg">
                        <Avatar className="h-10 w-10 mr-3">
                          {member.user?.avatarUrl && (
                            <AvatarImage src={member.user.avatarUrl} />
                          )}
                          <AvatarFallback>
                            {(member.user?.displayName || member.user?.username || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{member.user?.displayName || member.user?.username}</p>
                          <p className="text-xs text-gray-500">
                            Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {!members?.length && (
                      <p className="text-gray-500 col-span-full text-center p-4">
                        No members found in this group.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="chat">
              {isGroupMember ? (
                <ChatInterface groupId={groupId} groupName={group.name} />
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <p className="text-gray-500">Join this group to participate in the chat.</p>
                    <Button 
                      onClick={handleJoinGroup} 
                      className="mt-4"
                      disabled={joinGroupMutation.isPending}
                    >
                      {joinGroupMutation.isPending ? "Joining..." : "Join Group"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Upload Dialog */}
      <UploadDialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        groupId={groupId}
        availableGroups={[{ id: groupId, name: group.name }]}
      />
    </div>
  );
}
