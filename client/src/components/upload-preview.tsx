import { useCallback } from "react";

interface UploadPreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export function UploadPreview({ imageUrl, onRemove }: UploadPreviewProps) {
  const handleRemoveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  return (
    <div className="mb-4 relative">
      <img 
        src={imageUrl} 
        alt="Outfit preview" 
        className="max-h-64 rounded-lg" 
      />
      <button 
        className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
        onClick={handleRemoveClick}
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}
