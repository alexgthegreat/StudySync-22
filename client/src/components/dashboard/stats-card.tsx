import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  badgeText?: string;
  badgeColor?: 'primary' | 'secondary' | 'accent' | 'red';
  children?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
}

export function StatsCard({ 
  title, 
  value, 
  badgeText, 
  badgeColor = 'primary',
  children,
  actionText,
  onActionClick
}: StatsCardProps) {
  
  const badgeStyles = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-purple-100 text-purple-800',
    red: 'bg-red-100 text-red-800'
  };
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {badgeText && (
          <span className={cn(
            "py-1 px-2.5 rounded-lg text-xs font-medium",
            badgeStyles[badgeColor]
          )}>
            {badgeText}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-3xl font-bold">{value}</span>
        {children}
        {actionText && (
          <button 
            onClick={onActionClick}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            {actionText} <i className="ri-arrow-right-line ml-1"></i>
          </button>
        )}
      </div>
    </div>
  );
}

interface UserAvatarGroupProps {
  users: { id: number; avatarUrl?: string; displayName?: string; username: string }[];
  max?: number;
}

export function UserAvatarGroup({ users, max = 4 }: UserAvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  return (
    <div className="flex space-x-1 ml-4 -space-x-3">
      {displayUsers.map(user => (
        <div key={user.id} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.displayName || user.username} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

interface FileTypeCountsProps {
  pdfs: number;
  docs: number;
  images: number;
}

export function FileTypeCounts({ pdfs, docs, images }: FileTypeCountsProps) {
  return (
    <div className="flex ml-4 items-center">
      <div className="flex space-x-1 items-center ml-1">
        <i className="ri-file-pdf-line text-red-500 text-lg"></i>
        <span className="text-xs font-medium text-gray-500">{pdfs}</span>
      </div>
      <div className="flex space-x-1 items-center ml-3">
        <i className="ri-file-word-line text-blue-500 text-lg"></i>
        <span className="text-xs font-medium text-gray-500">{docs}</span>
      </div>
      <div className="flex space-x-1 items-center ml-3">
        <i className="ri-image-line text-purple-500 text-lg"></i>
        <span className="text-xs font-medium text-gray-500">{images}</span>
      </div>
    </div>
  );
}
