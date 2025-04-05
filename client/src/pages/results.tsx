import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb";
import { ComplianceIssuesList } from "@/components/compliance-issues-list";
import { RecommendationItem } from "@/components/recommendation-item";
import { IndustryType, ComplianceCheckResponse } from "@shared/schema";
import { FaUserMd, FaHardHat, FaCheckCircle, FaExclamationTriangle, FaRedo, FaDownload } from "react-icons/fa";

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
      setUploadedImage(storedImage);
      setIsValidIndustry(true);
    } catch (error) {
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
  const IndustryIcon = industry === "healthcare" ? FaUserMd : FaHardHat;
  const industryColor = industry === "healthcare" ? "text-blue-500" : "text-amber-500";
  
  return (
    <main>
      <NavigationBreadcrumb currentStep="Compliance Results" industry={industry} />
      
      <div className="mb-6 flex items-center">
        <div className={`p-3 rounded-full mr-3 ${industry === "healthcare" ? "bg-blue-100" : "bg-amber-100"}`}>
          <IndustryIcon className={`text-2xl ${industryColor}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{industryTitle} Outfit Compliance Results</h2>
          <p className="text-gray-600">Review your outfit compliance with industry standards</p>
        </div>
      </div>
      
      {/* Compliance Status */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        {complianceResult.isCompliant ? (
          <div className="flex items-center p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaCheckCircle className="text-xl text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-600">Your outfit is compliant!</h3>
              <p className="text-gray-600">Your outfit meets all required industry standards</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <FaExclamationTriangle className="text-xl text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-red-600">Your outfit is not compliant</h3>
              <p className="text-gray-600">We found some items that don't meet industry standards</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Results Image and Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Left Column: Image */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${industryColor} mr-2`}></span>
            Your Outfit
          </h3>
          <div className="aspect-w-4 aspect-h-3 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
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
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${industryColor} mr-2`}></span>
            Compliance Analysis
          </h3>
          <ComplianceIssuesList result={complianceResult} />
        </div>
      </div>
      
      {/* Recommendations */}
      {complianceResult.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className={`inline-block w-2 h-2 rounded-full ${industryColor} mr-2`}></span>
            Recommendations
          </h3>
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
      <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
        <Button
          onClick={handleCheckAnother}
          variant="outline"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <FaRedo className="mr-2" />
          <span>Check Another Outfit</span>
        </Button>
        <Button
          onClick={handleDownloadReport}
          className="px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center shadow-md"
        >
          <FaDownload className="mr-2" />
          <span>Download Report</span>
        </Button>
      </div>
    </main>
  );
}
