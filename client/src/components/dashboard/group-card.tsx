import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GroupCardProps {
  id: number;
  name: string;
  description: string;
  isActive?: boolean;
  members?: { id: number; avatarUrl?: string; displayName?: string; username: string }[];
  isMember?: boolean;
  onJoin?: () => void;
  className?: string;
}

export function GroupCard({
  id,
  name,
  description,
  isActive = true,
  members = [],
  isMember = false,
  onJoin,
  className,
}: GroupCardProps) {
  return (
    <div className={cn(
      "border border-gray-200 rounded-lg p-4 hover:border-primary-200 hover:bg-primary-50 transition-colors",
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm">{name}</h3>
        {isActive && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">Active</span>
        )}
      </div>
      <p className="text-gray-500 text-xs mb-3">{description}</p>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {members.slice(0, 3).map(member => (
            <div key={member.id} className="h-6 w-6 rounded-full border border-white overflow-hidden">
              {member.avatarUrl ? (
                <img src={member.avatarUrl} alt={member.displayName || member.username} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
                  {(member.displayName || member.username).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}
          
          {members.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-xs font-medium text-gray-500">
              +{members.length - 3}
            </div>
          )}
        </div>
        
        {isMember ? (
          <Link href={`/groups/${id}`}>
            <a className="text-primary-600 hover:text-primary-700 text-xs font-medium">
              View
            </a>
          </Link>
        ) : (
          <button 
            onClick={onJoin}
            className="text-primary-600 hover:text-primary-700 text-xs font-medium"
          >
            Join
          </button>
        )}
      </div>
    </div>
  );
}

export function CreateGroupCard({ onClick }: { onClick: () => void }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center justify-center">
      <Button 
        variant="ghost" 
        onClick={onClick}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        <i className="ri-add-circle-line mr-2 text-lg"></i>
        Create New Study Group
      </Button>
    </div>
  );
}
