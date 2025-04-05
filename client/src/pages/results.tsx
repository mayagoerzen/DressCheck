import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb";
import { ComplianceIssuesList } from "@/components/compliance-issues-list";
import { RecommendationItem } from "@/components/recommendation-item";
import { IndustryType, ComplianceCheckResponse } from "@shared/schema";

export default function Results() {
  const { industry } = useParams<{ industry: IndustryType }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const [isValidIndustry, setIsValidIndustry] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceCheckResponse | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Validate industry from URL parameter and load data from session storage
  useEffect(() => {
    if (industry !== "healthcare" && industry !== "construction") {
      toast({
        title: "Invalid Industry",
        description: "Please select a valid industry (healthcare or construction).",
        variant: "destructive"
      });
      navigate("/");
      return;
    }
    
    // Load results from session storage
    const storedResult = sessionStorage.getItem('complianceResult');
    const storedImage = sessionStorage.getItem('uploadedImage');
    
    if (!storedResult) {
      toast({
        title: "No Results Found",
        description: "Please upload an outfit image or description first.",
        variant: "destructive"
      });
      navigate(`/upload/${industry}`);
      return;
    }
    
    try {
      const parsedResult = JSON.parse(storedResult) as ComplianceCheckResponse;
      setComplianceResult(parsedResult);
      
      // Handle the case where the image was too large to store
      if (storedImage === 'large-image-used') {
        // Just set a flag that an image was used but we couldn't store it
        setUploadedImage(null);
        console.log("Image was too large to store in session storage");
        
        toast({
          title: "Note",
          description: "Your image was analyzed successfully, but was too large to display in the results.",
          variant: "default"
        });
      } else {
        setUploadedImage(storedImage);
      }
      
      setIsValidIndustry(true);
    } catch (error) {
      console.error("Error parsing results:", error);
      toast({
        title: "Error",
        description: "Invalid result data. Please try again.",
        variant: "destructive"
      });
      navigate(`/upload/${industry}`);
    }
  }, [industry, navigate, toast]);
  
  // Handle "Check Another Outfit" button
  const handleCheckAnother = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem('complianceResult');
    sessionStorage.removeItem('uploadedImage');
    
    // Navigate to industry selection
    navigate("/");
  }, [navigate]);
  
  // Handle "Download Report" button
  const handleDownloadReport = useCallback(() => {
    if (!complianceResult) return;
    
    // Create report content
    const industryTitle = industry === "healthcare" ? "Healthcare" : "Construction";
    const isCompliant = complianceResult.isCompliant ? "Compliant" : "Non-Compliant";
    
    let reportContent = `${industryTitle} Outfit Compliance Report\n`;
    reportContent += `Status: ${isCompliant}\n\n`;
    
    if (complianceResult.issues.length > 0) {
      reportContent += "Issues:\n";
      complianceResult.issues.forEach((issue) => {
        reportContent += `- ${issue.item}: ${issue.description}\n`;
      });
      reportContent += "\n";
    }
    
    if (complianceResult.compliantItems.length > 0) {
      reportContent += "Compliant Items:\n";
      complianceResult.compliantItems.forEach((item) => {
        reportContent += `- ${item.item}: ${item.description}\n`;
      });
      reportContent += "\n";
    }
    
    if (complianceResult.recommendations.length > 0) {
      reportContent += "Recommendations:\n";
      complianceResult.recommendations.forEach((rec) => {
        reportContent += `- ${rec.title}: ${rec.description}\n`;
      });
    }
    
    // Create and download text file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${industryTitle.toLowerCase()}-compliance-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [complianceResult, industry]);
  
  if (!isValidIndustry || !complianceResult) return null;
  
  // Define industry-specific elements
  const industryTitle = industry === "healthcare" ? "Healthcare" : "Construction";
  
  return (
    <main>
      <NavigationBreadcrumb currentStep="Compliance Results" industry={industry} />
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{industryTitle} Outfit Compliance Results</h2>
        <p className="text-gray-600">Review your outfit compliance with industry standards</p>
      </div>
      
      {/* Compliance Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        {complianceResult.isCompliant ? (
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <i className="fas fa-check text-xl text-secondary"></i>
            </div>
            <div>
              <h3 className="text-lg font-medium text-secondary">Your outfit is compliant!</h3>
              <p className="text-gray-600">Your outfit meets all required industry standards</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <i className="fas fa-exclamation-triangle text-xl text-danger"></i>
            </div>
            <div>
              <h3 className="text-lg font-medium text-danger">Your outfit is not compliant</h3>
              <p className="text-gray-600">We found some items that don't meet industry standards</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Results Image and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Your Outfit</h3>
          <div className="aspect-w-4 aspect-h-3 bg-gray-100 rounded-lg overflow-hidden">
            {uploadedImage ? (
              <img 
                src={uploadedImage} 
                alt="Uploaded outfit" 
                className="object-cover w-full h-full" 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <span>No image uploaded</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Compliance Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-medium mb-4">Compliance Analysis</h3>
          <ComplianceIssuesList result={complianceResult} />
        </div>
      </div>
      
      {/* Recommendations */}
      {complianceResult.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Recommendations</h3>
          <div className="space-y-4">
            {complianceResult.recommendations.map((recommendation, index) => (
              <RecommendationItem 
                key={index}
                title={recommendation.title}
                description={recommendation.description}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handleCheckAnother}
          variant="outline"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
        >
          <i className="fas fa-redo mr-2"></i>
          <span>Check Another Outfit</span>
        </Button>
        <Button
          onClick={handleDownloadReport}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <i className="fas fa-download mr-2"></i>
          <span>Download Report</span>
        </Button>
      </div>
    </main>
  );
}
