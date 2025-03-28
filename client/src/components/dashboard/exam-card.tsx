import { format, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  title: string;
  description: string;
  date: Date;
  location?: string;
  subject: string;
  onJoinStudyGroup?: () => void;
  onFindFlashcards?: () => void;
  onViewRubric?: () => void;
}

export function ExamCard({
  title,
  description,
  date,
  location,
  subject,
  onJoinStudyGroup,
  onFindFlashcards,
  onViewRubric
}: ExamCardProps) {
  const now = new Date();
  const daysDiff = differenceInDays(date, now);
  
  let borderColor = 'border-green-500';
  let badgeColor = 'bg-green-100 text-green-800';
  let badgeText = `${daysDiff} days`;
  
  if (daysDiff <= 2) {
    borderColor = 'border-red-500';
    badgeColor = 'bg-red-100 text-red-800';
    badgeText = `${daysDiff} days`;
  } else if (daysDiff <= 7) {
    borderColor = 'border-yellow-500';
    badgeColor = 'bg-yellow-100 text-yellow-800';
    badgeText = `${daysDiff} days`;
  } else if (daysDiff <= 14) {
    badgeText = `${Math.floor(daysDiff / 7)} weeks`;
  }
  
  const formattedDate = format(date, 'MMM d, h:mm a');
  
  return (
    <div className={cn("border-l-4 pl-3 py-2", borderColor)}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-sm">{title}</h3>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded", badgeColor)}>
          {badgeText}
        </span>
      </div>
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <i className="ri-calendar-line mr-1"></i>
        <span>{formattedDate}</span>
        {location && (
          <>
            <span className="mx-2">•</span>
            <i className="ri-map-pin-line mr-1"></i>
            <span>{location}</span>
          </>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {onJoinStudyGroup && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onJoinStudyGroup}
            className="text-xs bg-primary-50 text-primary-700 hover:bg-primary-100 rounded flex items-center h-7 px-2"
          >
            <i className="ri-group-line mr-1"></i>
            Join Study Group
          </Button>
        )}
        
        {onFindFlashcards && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onFindFlashcards}
            className="text-xs text-gray-600 hover:text-gray-800 rounded flex items-center h-7 px-2"
          >
            <i className="ri-flashcard-line mr-1"></i>
            Find Flashcards
          </Button>
        )}
        
        {onViewRubric && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewRubric}
            className="text-xs text-gray-600 hover:text-gray-800 rounded flex items-center h-7 px-2"
          >
            <i className="ri-file-list-line mr-1"></i>
            View Rubric
          </Button>
        )}
      </div>
    </div>
  );
}

export function AddExamCard({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      onClick={onClick}
      className="flex items-center justify-center w-full py-2 border border-dashed border-gray-300 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
    >
      <i className="ri-add-line mr-2"></i>
      Add Exam or Assignment
    </Button>
  );
}
