import { useState, useCallback, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { FileInput } from "@/components/ui/file-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb";
import { IndustryType } from "@shared/schema";
import { FaUserMd, FaHardHat, FaImage, FaAlignLeft, FaArrowRight } from "react-icons/fa";
import { useImageUpload } from "@/hooks/use-image-upload";

export default function OutfitUpload() {
  const { industry } = useParams<{ industry: IndustryType }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [description, setDescription] = useState("");
  const [isValidIndustry, setIsValidIndustry] = useState(false);
  
  // Use our enhanced image upload hook with compression
  const { 
    file: uploadedImage, 
    preview: imagePreview, 
    error: imageError,
    handleFileChange,
    removeFile: handleRemoveFile,
    isCompressing
  } = useImageUpload({
    maxSizeMB: 5,
    acceptedFormats: ['image/jpeg', 'image/png', 'image/heic']
  });
  
  // Validate industry from URL parameter
  useEffect(() => {
    if (industry !== "healthcare" && industry !== "construction") {
      toast({
        title: "Invalid Industry",
        description: "Please select a valid industry (healthcare or construction).",
        variant: "destructive"
      });
      navigate("/");
    } else {
      setIsValidIndustry(true);
    }
  }, [industry, navigate, toast]);
  
  // Display error toast if image upload fails
  useEffect(() => {
    if (imageError) {
      toast({
        title: "Image Upload Error",
        description: imageError,
        variant: "destructive"
      });
    }
  }, [imageError, toast]);
  
  // Handle description change
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);
  
  // Check if form is valid for submission
  const isFormValid = !!uploadedImage || description.trim().length > 10;
  
  // API mutation for checking compliance
  const complianceMutation = useMutation({
    mutationFn: async () => {
      // Convert image to base64 if it exists
      let imageBase64 = null;
      if (uploadedImage) {
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            const result = e.target?.result as string;
            // Remove the data:image/jpeg;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(uploadedImage);
        });
      }
      
      const requestData = {
        industry,
        imageBase64,
        description: description || undefined
      };
      
      const response = await apiRequest('POST', '/api/check-compliance', requestData);
      return await response.json();
    },
    onSuccess: (data) => {
      // Store results temporarily in sessionStorage for the results page
      sessionStorage.setItem('complianceResult', JSON.stringify(data));
      sessionStorage.setItem('uploadedImage', imagePreview || '');
      
      // Use a small timeout to ensure state updates are processed first
      setTimeout(() => {
        navigate(`/results/${industry}`);
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to check compliance. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!isFormValid) return;
    complianceMutation.mutate();
  }, [isFormValid, complianceMutation]);
  
  // Define industry-specific elements
  const industryTitle = industry === "healthcare" ? "Healthcare" : "Construction";
  const iconColor = industry === "healthcare" ? "text-blue-500" : "text-amber-500";
  const placeholderText = industry === "healthcare" 
    ? "Example: I'm wearing blue scrubs, white sneakers, a stethoscope, and have my ID badge clipped to my shirt pocket."
    : "Example: I'm wearing a yellow hard hat, high-visibility vest, work boots, jeans, and safety glasses.";
  const IndustryIcon = industry === "healthcare" ? FaUserMd : FaHardHat;
  
  if (!isValidIndustry) return null;
  
  return (
    <main>
      <NavigationBreadcrumb currentStep={`${industryTitle} Outfit Upload`} industry={industry} />
      
      <div className="mb-6 flex items-center">
        <div className={`p-3 rounded-full mr-3 ${industry === "healthcare" ? "bg-blue-100" : "bg-amber-100"}`}>
          <IndustryIcon className={`text-2xl ${iconColor}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{industryTitle} Outfit Compliance</h2>
          <p className="text-gray-600">Upload an image of your outfit or describe what you're wearing to check compliance</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <FaImage className={`${iconColor} mr-2 text-lg`} />
            <h3 className="text-lg font-medium">Upload Image</h3>
          </div>
          
          <FileInput
            accept="image/jpeg,image/png,image/heic"
            onFileChange={handleFileChange}
            preview={imagePreview || undefined}
            onRemoveFile={handleRemoveFile}
            isCompressing={isCompressing}
          />
          
          <div className="mt-6 flex items-center">
            <span className="text-gray-500 text-sm font-medium bg-gray-50 px-3 relative z-10">OR</span>
            <span className="flex-grow border-t border-gray-200 -ml-1"></span>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center mb-4">
            <FaAlignLeft className={`${iconColor} mr-2 text-lg`} />
            <h3 className="text-lg font-medium">Describe Your Outfit</h3>
          </div>
          <Textarea
            rows={4}
            placeholder={placeholderText}
            value={description}
            onChange={handleDescriptionChange}
            className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || complianceMutation.isPending || isCompressing}
          className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <span className="font-medium">
            {complianceMutation.isPending 
              ? "Analyzing..." 
              : isCompressing
                ? "Compressing Image..."
                : "Check Compliance"
            }
          </span>
          <FaArrowRight className="ml-2" />
        </Button>
      </div>
    </main>
  );
}
