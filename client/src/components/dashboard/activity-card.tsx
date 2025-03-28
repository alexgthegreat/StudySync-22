import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  type: 'file' | 'discussion' | 'flashcard' | 'exam';
  title: string;
  description: string;
  timestamp: Date;
  subject?: string;
  subjectColor?: 'primary' | 'secondary' | 'accent' | 'red';
  metadata?: {
    commentCount?: number;
    cardCount?: number;
  };
  onViewClick?: () => void;
  onReplyClick?: () => void;
  onStudyClick?: () => void;
}

export function ActivityCard({
  type,
  title,
  description,
  timestamp,
  subject,
  subjectColor = 'primary',
  metadata,
  onViewClick,
  onReplyClick,
  onStudyClick,
}: ActivityCardProps) {
  const iconMap = {
    'file': 'ri-file-upload-line',
    'discussion': 'ri-message-3-line',
    'flashcard': 'ri-flashcard-line',
    'exam': 'ri-calendar-event-line',
  };

  const bgColorMap = {
    'file': 'bg-primary-100',
    'discussion': 'bg-purple-100',
    'flashcard': 'bg-secondary-100',
    'exam': 'bg-red-100',
  };

  const textColorMap = {
    'file': 'text-primary-600',
    'discussion': 'text-purple-600',
    'flashcard': 'text-secondary-600',
    'exam': 'text-red-600',
  };

  const subjectBgColorMap = {
    'primary': 'bg-primary-50 text-primary-700',
    'secondary': 'bg-secondary-50 text-secondary-700',
    'accent': 'bg-purple-50 text-purple-700',
    'red': 'bg-red-50 text-red-700',
  };

  const timeAgo = formatDistanceToNow(new Date(timestamp), { addSuffix: true });

  return (
    <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={cn(
        "h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center",
        bgColorMap[type], textColorMap[type]
      )}>
        <i className={iconMap[type]}></i>
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{title}</h3>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="mt-2 flex items-center">
          {subject && (
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-md",
              subjectBgColorMap[subjectColor]
            )}>
              {subject}
            </span>
          )}
          
          {metadata?.commentCount !== undefined && (
            <div className="ml-2 flex items-center text-xs text-gray-500">
              <i className="ri-chat-1-line mr-1"></i>
              <span>{metadata.commentCount} responses</span>
            </div>
          )}
          
          {metadata?.cardCount !== undefined && (
            <div className="ml-2 flex items-center text-xs text-gray-500">
              <i className="ri-flashcard-line mr-1"></i>
              <span>{metadata.cardCount} terms</span>
            </div>
          )}
          
          {onViewClick && (
            <button 
              onClick={onViewClick} 
              className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              View
            </button>
          )}
          
          {onReplyClick && (
            <button 
              onClick={onReplyClick} 
              className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Reply
            </button>
          )}
          
          {onStudyClick && (
            <button 
              onClick={onStudyClick} 
              className="ml-auto text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Study
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
