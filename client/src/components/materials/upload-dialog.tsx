import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';

// Define form schema
const uploadSchema = z.object({
  name: z.string().min(1, 'Material name is required'),
  description: z.string().optional(),
  type: z.string().min(1, 'Material type is required'),
  url: z.string().min(1, 'URL is required'),
  groupId: z.number().optional(),
  subject: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  groupId?: number;
  availableGroups?: { id: number; name: string }[];
}

export function UploadDialog({ open, onClose, groupId, availableGroups = [] }: UploadDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState('file');
  
  // Default form values
  const defaultValues: UploadFormValues = {
    name: '',
    description: '',
    type: 'pdf',
    url: '',
    groupId: groupId,
  };
  
  // Form setup
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues,
  });
  
  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormValues) => {
      const response = await apiRequest('POST', '/api/materials', data);
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate materials queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      queryClient.invalidateQueries({ queryKey: ['/api/materials/recent'] });
      
      toast({
        title: "Upload successful",
        description: "Your study material has been uploaded.",
      });
      
      onClose();
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form submission
  const onSubmit = (data: UploadFormValues) => {
    if (!user) {
      toast({
        title: "Authentication error",
        description: "You must be logged in to upload materials.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Study Material</DialogTitle>
          <DialogDescription>
            Share study materials with your classmates. Upload a file or add a link to online resources like Quizlet.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">Upload File</TabsTrigger>
            <TabsTrigger value="link">Add Link</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Biology Chapter 8 Notes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of this material" 
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <TabsContent value="file" className="space-y-4 mt-0">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('type', value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select file type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="doc">Word Document</SelectItem>
                          <SelectItem value="ppt">PowerPoint</SelectItem>
                          <SelectItem value="image">Image</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>File URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter URL to the file" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="link" className="space-y-4 mt-0">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link Type</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          form.setValue('type', value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select link type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quizlet">Quizlet</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="link">Website</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {availableGroups.length > 0 && (
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Share with Group (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          const numValue = value ? parseInt(value) : undefined;
                          field.onChange(numValue);
                          form.setValue('groupId', numValue);
                        }}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a group to share with" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Public - Not group specific</SelectItem>
                          {availableGroups.map(group => (
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
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
