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

export default function OutfitUpload() {
  const { industry } = useParams<{ industry: IndustryType }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isValidIndustry, setIsValidIndustry] = useState(false);
  
  // Validate industry from URL parameter
  useEffect(() => {
    console.log("URL industry parameter check:", industry);
    console.log("Type of industry:", typeof industry);
    console.log("Is healthcare?", industry === "healthcare");
    console.log("Is construction?", industry === "construction");
    
    if (industry !== "healthcare" && industry !== "construction") {
      console.log("INVALID INDUSTRY DETECTED:", industry);
      toast({
        title: "Invalid Industry",
        description: "Please select a valid industry (healthcare or construction).",
        variant: "destructive"
      });
      navigate("/");
    } else {
      console.log("VALID INDUSTRY DETECTED:", industry);
      setIsValidIndustry(true);
    }
  }, [industry, navigate, toast]);
  
  // Handle file upload
  const handleFileChange = useCallback((file: File | null) => {
    setUploadedImage(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, []);
  
  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setUploadedImage(null);
    setImagePreview(null);
  }, []);
  
  // Handle description change
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);
  
  // Check if form is valid for submission
  const isFormValid = !!uploadedImage || description.trim().length > 10;
  
  // API mutation for checking compliance
  const complianceMutation = useMutation({
    mutationFn: async () => {
      try {
        // Convert image to base64 if it exists
        let imageBase64 = null;
        if (uploadedImage) {
          const reader = new FileReader();
          try {
            imageBase64 = await new Promise<string>((resolve, reject) => {
              reader.onload = (e) => {
                try {
                  const result = e.target?.result as string;
                  // Remove the data:image/jpeg;base64, prefix
                  const base64 = result.split(',')[1];
                  resolve(base64);
                } catch (err) {
                  reject(new Error("Failed to process image. The file may be corrupted."));
                }
              };
              reader.onerror = () => {
                reject(new Error("Failed to read the image file. Please try a different image."));
              };
              reader.readAsDataURL(uploadedImage);
            });
          } catch (err) {
            // Safe error handling regardless of error type
            let errorMessage = "Unknown error";
            if (err instanceof Error) {
              errorMessage = err.message;
            } else if (typeof err === 'string') {
              errorMessage = err;
            } else if (err && typeof err === 'object' && 'message' in err) {
              errorMessage = err.message as string;
            }
            
            console.error("Error processing image:", err);
            throw new Error("Failed to process image: " + errorMessage);
          }
        }
        
        // Log the data being sent to the API
        const requestData = {
          industry,
          imageBase64,
          description: description || undefined
        };
        
        // For debugging only - don't log the entire base64 string
        console.log("Sending request data:", JSON.stringify({
          ...requestData,
          imageBase64: imageBase64 ? "[BASE64_IMAGE_DATA]" : null
        }));
        
        const response = await apiRequest('POST', '/api/check-compliance', requestData);
        
        if (response.status === 413) {
          throw new Error("The image file is too large. Please use a smaller image or compress it further.");
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Server error. Please try again.");
        }
        
        const responseData = await response.json();
        console.log("Received response:", JSON.stringify(responseData));
        
        return responseData;
      } catch (error) {
        console.error("Error in compliance mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      try {
        // Store results temporarily in sessionStorage for the results page
        sessionStorage.setItem('complianceResult', JSON.stringify(data));
        
        // Only store image reference instead of the full base64 data to avoid quota issues
        // For large images, we'll avoid storing them in sessionStorage altogether
        if (imagePreview && imagePreview.length > 500000) {
          // Just store a flag that an image was used, but don't store the actual image
          sessionStorage.setItem('uploadedImage', 'large-image-used');
        } else if (imagePreview) {
          // For smaller images, we can still store them
          sessionStorage.setItem('uploadedImage', imagePreview);
        } else {
          sessionStorage.setItem('uploadedImage', '');
        }
      } catch (storageError) {
        console.error("Storage error:", storageError);
        // If we can't store the image, continue without it
        // The results page will just not show the image preview
      }
      
      // Navigate to results page
      console.log("Navigation to results with industry:", industry);
      console.log("Navigation path:", `/results/${industry}`);
      
      // Use a small timeout to ensure state updates are processed first
      setTimeout(() => {
        navigate(`/results/${industry}`);
      }, 100);
    },
    onError: (error) => {
      // Provide user-friendly error messages
      let errorMessage = "Failed to check compliance. Please try again.";
      
      if (error.message) {
        if (error.message.includes("too large")) {
          errorMessage = "The image file is too large. Please use a smaller image or provide a text description instead.";
        } else if (error.message.includes("failed to process")) {
          errorMessage = "We couldn't process your image. Please try a different image or provide a text description instead.";
        } else if (error.message.includes("AI service")) {
          errorMessage = "Our analysis service is temporarily unavailable. Please try again later or provide a text description of your outfit.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (!isFormValid) return;
    
    // Add console logs to debug the industry parameter
    console.log("Submitting form with industry:", industry);
    console.log("Industry type validation:", 
      industry === "healthcare" || industry === "construction" ? "valid" : "invalid",
      "Type:", typeof industry
    );
    
    complianceMutation.mutate();
  }, [isFormValid, complianceMutation, industry]);
  
  // Define industry-specific elements
  const industryTitle = industry === "healthcare" ? "Healthcare" : "Construction";
  const iconColor = industry === "healthcare" ? "text-healthcare" : "text-construction";
  const placeholderText = industry === "healthcare" 
    ? "Example: I'm wearing blue scrubs, white sneakers, a stethoscope, and have my ID badge clipped to my shirt pocket."
    : "Example: I'm wearing a yellow hard hat, high-visibility vest, work boots, jeans, and safety glasses.";
  
  if (!isValidIndustry) return null;
  
  return (
    <main>
      <NavigationBreadcrumb currentStep={`${industryTitle} Outfit Upload`} industry={industry} />
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{industryTitle} Outfit Compliance</h2>
        <p className="text-gray-600">Upload an image of your outfit or describe what you're wearing</p>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center mb-4">
            <i className={`fas fa-image ${iconColor} mr-2`}></i>
            <h3 className="text-lg font-medium">Upload Image</h3>
          </div>
          
          <FileInput
            accept="image/jpeg,image/png,image/heic"
            onFileChange={handleFileChange}
            preview={imagePreview || undefined}
            onRemoveFile={handleRemoveFile}
          />
          
          <div className="mt-4 flex items-center">
            <span className="text-gray-500 text-sm">Or</span>
            <span className="flex-grow border-t border-gray-200 ml-2"></span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex items-center mb-4">
            <i className={`fas fa-align-left ${iconColor} mr-2`}></i>
            <h3 className="text-lg font-medium">Describe Your Outfit</h3>
          </div>
          <Textarea
            rows={4}
            placeholder={placeholderText}
            value={description}
            onChange={handleDescriptionChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || complianceMutation.isPending}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{complianceMutation.isPending ? "Checking..." : "Check Compliance"}</span>
          <i className="fas fa-arrow-right ml-2"></i>
        </Button>
      </div>
    </main>
  );
}
