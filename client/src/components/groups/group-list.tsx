import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { GroupCard, CreateGroupCard } from '@/components/dashboard/group-card';

interface GroupListProps {
  limit?: number;
  showCreateButton?: boolean;
  onCreateClick: () => void;
}

export function GroupList({ limit, showCreateButton = true, onCreateClick }: GroupListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Get all groups
  const { data: groups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['/api/groups/popular'],
    enabled: !!user,
  });
  
  // Get user's groups
  const { data: userGroups, isLoading: isLoadingUserGroups } = useQuery({
    queryKey: ['/api/groups/my-groups'],
    enabled: !!user,
  });
  
  // Join group mutation
  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: number) => {
      const res = await apiRequest('POST', `/api/groups/${groupId}/join`);
      return await res.json();
    },
    onSuccess: () => {
      // Refresh groups data
      queryClient.invalidateQueries({ queryKey: ['/api/groups/my-groups'] });
      
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
  
  // Handler for joining a group
  const handleJoinGroup = (groupId: number) => {
    joinGroupMutation.mutate(groupId);
  };
  
  if (isLoadingGroups || isLoadingUserGroups) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Popular Study Groups</h2>
        </div>
        <div className="animate-pulse space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3 mb-3"></div>
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Create a map of user's groups for faster lookup
  const userGroupsMap = new Map(
    (userGroups || []).map(group => [group.id, group])
  );
  
  // Limit the number of groups if limit is provided
  const displayGroups = limit ? (groups || []).slice(0, limit) : (groups || []);
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">Popular Study Groups</h2>
        <button className="text-sm text-gray-500 hover:text-gray-700">Explore All</button>
      </div>
      
      <div className="space-y-4">
        {displayGroups.map(group => (
          <GroupCard
            key={group.id}
            id={group.id}
            name={group.name}
            description={group.description || ""}
            isActive={group.isActive}
            isMember={userGroupsMap.has(group.id)}
            onJoin={() => handleJoinGroup(group.id)}
          />
        ))}
        
        {displayGroups.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No study groups available. Create a new one!
          </p>
        )}
        
        {showCreateButton && (
          <CreateGroupCard onClick={onCreateClick} />
        )}
      </div>
    </div>
  );
}
