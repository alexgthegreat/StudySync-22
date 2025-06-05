import { useState, useRef, useCallback } from 'react';
import { Upload, File, Image, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { uploadFile } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileUploaded: (fileData: {
    url: string;
    storageKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    type: string;
  }) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({ 
  onFileUploaded, 
  accept = "image/*,.pdf,.doc,.docx,.txt,.ppt,.pptx",
  maxSize = 10,
  className 
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setUploadingFiles(prev => [...prev, {
          file,
          progress: 0,
          status: 'error',
          error: `File size exceeds ${maxSize}MB limit`
        }]);
        continue;
      }

      // Add file to uploading list
      const uploadingFile: UploadingFile = {
        file,
        progress: 0,
        status: 'uploading'
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);

      try {
        const result = await uploadFile(file, (progress) => {
          setUploadingFiles(prev => 
            prev.map(f => 
              f.file === file ? { ...f, progress } : f
            )
          );
        });

        // Update status to success
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === file ? { ...f, status: 'success', progress: 100 } : f
          )
        );

        // Call the callback with file data
        onFileUploaded(result);

        // Remove from uploading list after delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.file !== file));
        }, 2000);

      } catch (error) {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === file ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } : f
          )
        );
      }
    }
  };

  const removeFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== file));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="w-5 h-5" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="w-5 h-5" />;
    } else {
      return <File className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50",
        )}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
        <p className="text-sm text-gray-500">
          Supports images, PDFs, documents up to {maxSize}MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <Card key={index} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadingFile.file)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(uploadingFile.file.size)}
                    </p>
                    {uploadingFile.status === 'uploading' && (
                      <Progress value={uploadingFile.progress} className="mt-1" />
                    )}
                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {uploadingFile.status === 'uploading' && (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                    {uploadingFile.status === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {uploadingFile.status === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadingFile.file)}
                      className="ml-2 p-1 h-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}