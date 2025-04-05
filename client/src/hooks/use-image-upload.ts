import { useState, useCallback } from "react";

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
}

export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadResult {
  const { 
    maxSizeMB = 10, 
    acceptedFormats = ['image/jpeg', 'image/png', 'image/heic']
  } = options;
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
  
  const handleFileChange = useCallback((file: File | null) => {
    setError(null);
    
    if (!file) {
      setFile(null);
      setPreview(null);
      return;
    }
    
    if (isValidFile(file)) {
      setFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
    isValidFile
  };
}
