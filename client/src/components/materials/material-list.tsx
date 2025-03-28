import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Material {
  id: number;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  uploader: {
    id: number;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  subject?: string;
}

interface MaterialListProps {
  materials: Material[];
  onUploadClick: () => void;
}

export function MaterialList({ materials, onUploadClick }: MaterialListProps) {
  const [filter, setFilter] = useState('All Subjects');
  
  const filteredMaterials = filter === 'All Subjects' 
    ? materials 
    : materials.filter(m => m.subject === filter);
  
  const uniqueSubjects = ['All Subjects', ...new Set(materials.map(m => m.subject).filter(Boolean))];
  
  const getIconClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'ri-file-pdf-line text-red-500';
      case 'doc':
      case 'docx':
      case 'word':
        return 'ri-file-word-line text-blue-500';
      case 'xls':
      case 'xlsx':
      case 'excel':
        return 'ri-file-excel-line text-green-500';
      case 'ppt':
      case 'pptx':
      case 'powerpoint':
        return 'ri-file-ppt-line text-orange-500';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'ri-image-line text-purple-500';
      case 'link':
      case 'url':
        return 'ri-link text-primary-500';
      default:
        return 'ri-file-line text-gray-500';
    }
  };
  
  const getBgClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'bg-red-100';
      case 'doc':
      case 'docx':
      case 'word':
        return 'bg-blue-100';
      case 'xls':
      case 'xlsx':
      case 'excel':
        return 'bg-green-100';
      case 'ppt':
      case 'pptx':
      case 'powerpoint':
        return 'bg-orange-100';
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'bg-purple-100';
      case 'link':
      case 'url':
        return 'bg-primary-100';
      default:
        return 'bg-gray-100';
    }
  };
  
  const getSubjectBadgeClass = (subject?: string) => {
    if (!subject) return 'bg-gray-50 text-gray-700';
    
    const subjectColors: Record<string, string> = {
      'AP Biology': 'bg-primary-50 text-primary-700',
      'Calculus II': 'bg-purple-50 text-purple-700',
      'World History': 'bg-secondary-50 text-secondary-700'
    };
    
    return subjectColors[subject] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">Study Materials</h2>
        <div className="flex items-center">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="mr-2 text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring focus:ring-primary-200 w-40">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:text-gray-700">
            See all
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded by</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-8 w-8 ${getBgClass(material.type)} rounded-md flex items-center justify-center ${getIconClass(material.type)}`}>
                      <i className={getIconClass(material.type)}></i>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">{material.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {material.subject && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${getSubjectBadgeClass(material.subject)}`}>
                      {material.subject}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {material.uploader.avatarUrl ? (
                      <img src={material.uploader.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
                        {(material.uploader.displayName || material.uploader.username).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="ml-2 text-sm text-gray-900">
                      {material.uploader.displayName || material.uploader.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {formatDistanceToNow(new Date(material.uploadedAt), { addSuffix: true })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700 mr-3">View</Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">Download</Button>
                </td>
              </tr>
            ))}
            
            {filteredMaterials.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No materials found for the selected subject.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button 
          variant="outline" 
          onClick={onUploadClick}
          className="flex items-center justify-center w-full py-2 border border-dashed border-gray-300 rounded-lg text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
        >
          <i className="ri-upload-2-line mr-2"></i>
          Upload New Study Material
        </Button>
      </div>
    </div>
  );
}
