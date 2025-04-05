import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";

interface UseImageUploadOptions {
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

interface UseImageUploadResult {
  file: File | null;
  preview: string | null;
  error: string | null;
  handleFileChange: (file: File | null) => void;
  removeFile: () => void;
  isValidFile: (file: File) => boolean;
  isCompressing: boolean;
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadResult {
  const { 
    maxSizeMB = 10, 
    acceptedFormats = ['image/jpeg', 'image/png', 'image/heic']
  } = options;
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  
  const isValidFile = useCallback((file: File): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    if (!acceptedFormats.includes(file.type)) {
      setError(`Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`);
      return false;
    }
    
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    
    return true;
  }, [maxSizeMB, acceptedFormats]);
  
  const handleFileChange = useCallback(async (file: File | null) => {
    setError(null);
    
    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }
    
    if (isValidFile(file)) {
      try {
        setIsCompressing(true);
        
        // Compress image before processing
        const compressionOptions = {
          maxSizeMB: 1,      // Maximum size in MB
          maxWidthOrHeight: 1920, // Maximum width/height
          useWebWorker: true,
          fileType: file.type
        };
        
        // Apply compression if the file is a recognized image type
        let processedFile = file;
        if (file.type.startsWith('image/')) {
          try {
            processedFile = await imageCompression(file, compressionOptions);
            console.log('Image compressed:', 
              `Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`, 
              `Compressed size: ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`
            );
          } catch (compressError) {
            console.warn('Image compression failed, using original file:', compressError);
            // Continue with original file if compression fails
          }
        }
        
        setFile(processedFile);
        
        // Create preview from the processed file
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
          setIsCompressing(false);
        };
        reader.onerror = () => {
          setError('Failed to read the file. Please try again.');
          setIsCompressing(false);
        };
        reader.readAsDataURL(processedFile);
        
      } catch (error) {
        console.error('Error processing file:', error);
        setError('Error processing file. Please try again.');
        setFile(null);
        setPreview(null);
        setIsCompressing(false);
      }
    } else {
      setFile(null);
      setPreview(null);
    }
  }, [isValidFile]);
  
  const removeFile = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);
  
  return { 
    file,
    preview,
    error,
    handleFileChange,
    removeFile,
    isValidFile,
    isCompressing
  };
}
