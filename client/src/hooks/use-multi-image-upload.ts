import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";

export interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface UseMultiImageUploadOptions {
  maxImages?: number;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  onChange?: (files: File[]) => void;
}

export function useMultiImageUpload(options: UseMultiImageUploadOptions = {}) {
  const {
    maxImages = 5,
    maxSizeMB = 5,
    acceptedFormats = ['image/jpeg', 'image/png', 'image/heic'],
    onChange
  } = options;

  const [files, setFiles] = useState<ImageFile[]>([]);
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

  const processFile = useCallback(async (file: File): Promise<ImageFile | null> => {
    if (!isValidFile(file)) return null;

    try {
      setIsCompressing(true);
      
      // Compress image before processing
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
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
      
      // Create preview
      return new Promise<ImageFile>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          resolve({
            file: processedFile,
            preview,
            id: crypto.randomUUID()
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Error processing file. Please try again.');
      return null;
    } finally {
      setIsCompressing(false);
    }
  }, [isValidFile]);

  const addImage = useCallback(async (file: File) => {
    if (files.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }
    
    const processedFile = await processFile(file);
    if (processedFile) {
      const updatedFiles = [...files, processedFile];
      setFiles(updatedFiles);
      onChange?.(updatedFiles.map(f => f.file));
    }
  }, [files, maxImages, processFile, onChange]);

  const removeImage = useCallback((id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    onChange?.(updatedFiles.map(f => f.file));
  }, [files, onChange]);
  
  const removeAllImages = useCallback(() => {
    setFiles([]);
    onChange?.([]);
  }, [onChange]);

  return {
    files,
    error,
    isCompressing,
    addImage,
    removeImage,
    removeAllImages,
    hasMaxImages: files.length >= maxImages
  };
}