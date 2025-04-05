import * as React from "react";
import { cn } from "@/lib/utils";

export interface FileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange?: (file: File | null) => void;
  preview?: string;
  onRemoveFile?: () => void;
  children?: React.ReactNode;
}

const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, onFileChange, preview, onRemoveFile, children, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    
    const [dragActive, setDragActive] = React.useState(false);
    
    const handleClick = () => {
      inputRef.current?.click();
    };
    
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(true);
    };
    
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
    };
    
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileChange?.(e.dataTransfer.files[0]);
      }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFileChange?.(e.target.files[0]);
      }
    };
    
    return (
      <div 
        ref={containerRef}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 bg-gray-50 text-center cursor-pointer transition-colors",
          dragActive ? "bg-gray-100" : "hover:bg-gray-100",
          className
        )}
      >
        <div className="flex flex-col items-center">
          {preview ? (
            <div className="mb-4 relative">
              <img 
                src={preview} 
                alt="File preview" 
                className="max-h-64 rounded-lg" 
              />
              {onRemoveFile && (
                <button 
                  type="button"
                  className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile();
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          ) : (
            children || (
              <div>
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
                </div>
                <p className="text-gray-600 mb-2">Drag and drop your image here</p>
                <p className="text-gray-500 text-sm mb-4">or</p>
                <button 
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Browse Files
                </button>
                <p className="mt-3 text-xs text-gray-500">
                  Supported formats: JPEG, PNG, HEIC<br/>Max size: 10MB
                </p>
              </div>
            )
          )}
        </div>
        <input
          type="file"
          className="hidden"
          ref={(el) => {
            // Assign to both refs
            if (typeof ref === "function") {
              ref(el);
            } else if (ref) {
              ref.current = el;
            }
            inputRef.current = el;
          }}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);

FileInput.displayName = "FileInput";

export { FileInput };
