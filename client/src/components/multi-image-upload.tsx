import { useCallback } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useMultiImageUpload, ImageFile } from "@/hooks/use-multi-image-upload";

interface MultiImageUploadProps {
  onChange: (files: File[]) => void;
  maxImages?: number;
  label?: string;
}

export function MultiImageUpload({ onChange, maxImages = 5, label = "Add Reference Image" }: MultiImageUploadProps) {
  const {
    files,
    error,
    isCompressing,
    addImage,
    removeImage,
    hasMaxImages
  } = useMultiImageUpload({
    maxImages,
    onChange,
    maxSizeMB: 5,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/heic']
  });

  const handleFileSelect = useCallback(() => {
    // Create a hidden file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/heic';
    input.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        await addImage(target.files[0]);
      }
    };
    input.click();
  }, [addImage]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-500 mb-2">{error}</div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((fileData: ImageFile) => (
          <div key={fileData.id} className="relative rounded-lg overflow-hidden border border-gray-200">
            <img
              src={fileData.preview}
              alt="Reference angle"
              className="w-full h-48 object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(fileData.id)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
        
        {!hasMaxImages && (
          <div
            onClick={handleFileSelect}
            className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {isCompressing ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <span className="text-sm text-gray-500 mt-2">Processing...</span>
              </>
            ) : (
              <>
                <Plus className="h-10 w-10 text-gray-400" />
                <span className="text-sm text-gray-500 mt-2">{label}</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="text-sm text-gray-500">
          {files.length} of {maxImages} reference images added
        </div>
      )}
    </div>
  );
}