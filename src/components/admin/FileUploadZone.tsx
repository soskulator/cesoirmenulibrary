import { useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Upload, File, Loader2, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadZoneProps {
  bucketName: string;
  folderPath?: string;
  acceptedTypes: string;
  maxSizeMB?: number;
  onUploadComplete?: (url: string, fileName: string) => void;
  label: string;
  description: string;
  variant?: 'default' | 'compact';
  disabled?: boolean;
}

export function FileUploadZone({
  bucketName,
  folderPath = '',
  acceptedTypes,
  maxSizeMB = 10,
  onUploadComplete,
  label,
  description,
  variant = 'default',
  disabled = false,
}: FileUploadZoneProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Maximum file size is ${maxSizeMB}MB.`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadedFile(null);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = folderPath 
        ? `${folderPath}/${timestamp}-${sanitizedName}`
        : `${timestamp}-${sanitizedName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      setUploadedFile(file.name);
      
      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded.`,
      });

      onUploadComplete?.(urlData.publicUrl, file.name);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [bucketName, folderPath, maxSizeMB, onUploadComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, isUploading, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const clearUpload = () => {
    setUploadedFile(null);
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {label}
        </Button>
        {uploadedFile && (
          <div className="flex items-center gap-1 text-xs text-jade">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{uploadedFile}</span>
            <button onClick={clearUpload} className="p-0.5 hover:bg-muted rounded">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
      />
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors",
          isDragOver && "border-terra-cotta bg-terra-cotta/10",
          !isDragOver && !disabled && "hover:border-terra-cotta/50 hover:bg-terra-cotta/5",
          disabled && "opacity-50 cursor-not-allowed",
          uploadedFile && "border-jade/50 bg-jade/5"
        )}
      >
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3",
          uploadedFile ? "bg-jade/20" : "bg-muted/80"
        )}>
          {isUploading ? (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-terra-cotta animate-spin" />
          ) : uploadedFile ? (
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-jade" />
          ) : (
            <File className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          )}
        </div>
        
        {uploadedFile ? (
          <>
            <p className="text-xs sm:text-sm font-medium text-jade mb-1">
              Uploaded successfully
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[200px] mx-auto">
              {uploadedFile}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
              {label}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {description}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
