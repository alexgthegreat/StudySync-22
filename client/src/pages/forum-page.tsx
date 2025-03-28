import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MessageSquare } from "lucide-react";

// Post form schema
const postFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  groupId: z.string().optional(),
});

// Comment form schema
const commentFormSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

type PostFormValues = z.infer<typeof postFormSchema>;
type CommentFormValues = z.infer<typeof commentFormSchema>;

export default function ForumPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingPostId, setViewingPostId] = useState<number | null>(null);

  // Fetch all posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts,
    refetch: refetchPosts
  } = useQuery({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  // Fetch user groups for post creation
  const { data: userGroups } = useQuery({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });

  // Fetch comments for the selected post
  const { 
    data: comments, 
    isLoading: isLoadingComments,
    refetch: refetchComments
  } = useQuery({
    queryKey: [`/api/posts/${viewingPostId}/comments`],
    enabled: !!viewingPostId,
  });

  // Get the currently viewed post
  const currentPost = viewingPostId ? posts?.find(p => p.id === viewingPostId) : null;

  // Post form
  const postForm = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      content: "",
      groupId: "",
    },
  });

  // Comment form
  const commentForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (data: PostFormValues) => {
      const res = await apiRequest('POST', '/api/posts', {
        ...data,
        groupId: data.groupId ? parseInt(data.groupId) : undefined,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your question has been posted successfully.",
      });
      postForm.reset();
      setCreatePostOpen(false);
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

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (data: CommentFormValues) => {
      if (!viewingPostId) throw new Error("No post selected");
      const res = await apiRequest('POST', `/api/posts/${viewingPostId}/comments`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment added",
        description: "Your response has been posted.",
      });
      commentForm.reset();
      refetchComments();
      refetchPosts(); // To update comment counts
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Submit post form
  const onPostSubmit = (data: PostFormValues) => {
    createPostMutation.mutate(data);
  };

  // Submit comment form
  const onCommentSubmit = (data: CommentFormValues) => {
    createCommentMutation.mutate(data);
  };

  // Filter posts based on search and active tab
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "mine") {
      return matchesSearch && post.createdBy === user?.id;
    } else if (activeTab === "answered") {
      return matchesSearch && (post.commentCount || 0) > 0;
    } else if (activeTab === "unanswered") {
      return matchesSearch && (post.commentCount || 0) === 0;
    }
    
    return matchesSearch;
  }) || [];

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by state change
  };

  // Handle back from post detail
  const handleBackToList = () => {
    setViewingPostId(null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {/* Post Detail View */}
          {viewingPostId ? (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                onClick={handleBackToList}
                className="mb-2"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Q&A Forum
              </Button>

              {currentPost && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-xl">{currentPost.title}</CardTitle>
                        <div className="flex items-center mt-1">
                          <Avatar className="h-6 w-6 mr-2">
                            {currentPost.creator?.avatarUrl && (
                              <AvatarImage src={currentPost.creator.avatarUrl} />
                            )}
                            <AvatarFallback>
                              {(currentPost.creator?.displayName || currentPost.creator?.username || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-500">
                            {currentPost.creator?.displayName || currentPost.creator?.username}
                            <span className="mx-1">•</span>
                            {formatDistanceToNow(new Date(currentPost.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {currentPost.groupId && (
                        <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 h-fit rounded">
                          From group
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line">{currentPost.content}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>
                    {isLoadingComments ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading responses...
                      </div>
                    ) : (
                      `${comments?.length || 0} Responses`
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!isLoadingComments && comments?.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      Be the first to respond to this question!
                    </div>
                  )}

                  <div className="space-y-4">
                    {comments?.map(comment => (
                      <div key={comment.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start">
                          <Avatar className="h-8 w-8 mr-3 mt-1">
                            {comment.creator?.avatarUrl && (
                              <AvatarImage src={comment.creator.avatarUrl} />
                            )}
                            <AvatarFallback>
                              {(comment.creator?.displayName || comment.creator?.username || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="font-semibold text-sm">
                                {comment.creator?.displayName || comment.creator?.username}
                              </span>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="mt-1 text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Form {...commentForm}>
                    <form onSubmit={commentForm.handleSubmit(onCommentSubmit)} className="w-full">
                      <FormField
                        control={commentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex">
                              <FormControl>
                                <Input 
                                  placeholder="Add your response..." 
                                  className="flex-1 mr-2"
                                  {...field} 
                                />
                              </FormControl>
                              <Button 
                                type="submit" 
                                disabled={createCommentMutation.isPending}
                              >
                                {createCommentMutation.isPending ? "Posting..." : "Post"}
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hero Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="md:flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Q&A Forum</h1>
                    <p className="text-gray-500 mt-1">
                      Ask questions, get answers, and help your classmates
                    </p>
                  </div>

                  <Button 
                    onClick={() => setCreatePostOpen(true)}
                    className="mt-4 md:mt-0 flex items-center"
                  >
                    <i className="ri-question-line mr-2"></i>
                    Ask a Question
                  </Button>
                </div>

                <form onSubmit={handleSearch} className="mt-6">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search for questions..."
                      className="pl-10 py-6"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <i className="ri-search-line absolute left-3 top-3 text-gray-400"></i>
                  </div>
                </form>
              </div>

              {/* Tabs and Posts List */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-white rounded-lg p-1 shadow-sm">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="all">All Questions</TabsTrigger>
                    <TabsTrigger value="mine">My Questions</TabsTrigger>
                    <TabsTrigger value="answered">Answered</TabsTrigger>
                    <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="mt-6">
                  {isLoadingPosts ? (
                    <div className="flex items-center justify-center h-64">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPosts.map(post => (
                        <Card key={post.id} className="cursor-pointer hover:border-primary-200 transition-colors" onClick={() => setViewingPostId(post.id)}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle>{post.title}</CardTitle>
                              <div className="flex items-center">
                                <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                                  <i className="ri-chat-1-line mr-1"></i>
                                  {post.commentCount || 0}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center mt-1">
                              <Avatar className="h-5 w-5 mr-2">
                                {post.creator?.avatarUrl && (
                                  <AvatarImage src={post.creator.avatarUrl} />
                                )}
                                <AvatarFallback>
                                  {(post.creator?.displayName || post.creator?.username || "U").charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">
                                {post.creator?.displayName || post.creator?.username}
                                <span className="mx-1">•</span>
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="line-clamp-2 text-sm text-gray-600">
                              {post.content}
                            </p>
                          </CardContent>
                          <CardFooter className="pt-0 pb-4">
                            <Button variant="ghost" size="sm">
                              View Question
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16">
                        <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-700">No questions found</h3>
                        <p className="text-gray-500 mt-2 text-center max-w-md">
                          {searchQuery 
                            ? `No questions match your search query "${searchQuery}"`
                            : "There are no questions in this category yet."}
                        </p>
                        <Button 
                          onClick={() => setCreatePostOpen(true)}
                          className="mt-4"
                        >
                          Ask a Question
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </main>
      </div>

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ask a Question</DialogTitle>
          </DialogHeader>
          <Form {...postForm}>
            <form onSubmit={postForm.handleSubmit(onPostSubmit)} className="space-y-4">
              <FormField
                control={postForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. How do I solve this calculus problem?" {...field} />
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
                    <FormLabel>Question Details</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide more details about your question..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {userGroups && userGroups.length > 0 && (
                <FormField
                  control={postForm.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Post to Group (Optional)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Public - Not group specific</SelectItem>
                          {userGroups.map(group => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreatePostOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? "Posting..." : "Post Question"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
