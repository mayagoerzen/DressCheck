import { useCallback } from "react";
import { useLocation, Link } from "wouter";
import { IndustryType } from "@shared/schema";

interface NavigationBreadcrumbProps {
  currentStep: string;
  industry?: IndustryType;
  goBack?: () => void;
}

export function NavigationBreadcrumb({ 
  currentStep, 
  industry,
  goBack 
}: NavigationBreadcrumbProps) {
  const [location, navigate] = useLocation();
  
  const handleBackClick = useCallback(() => {
    if (goBack) {
      goBack();
    } else if (location.includes('/results')) {
      navigate(`/upload/${industry}`);
    } else if (location.includes('/upload')) {
      navigate('/');
    }
  }, [goBack, location, navigate, industry]);

  return (
    <div className="flex items-center mb-6 text-sm">
      <button 
        onClick={handleBackClick}
        className="flex items-center text-gray-600 hover:text-gray-900 mr-2"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        <span>Back</span>
      </button>
      <div className="w-px h-4 bg-gray-300 mx-2"></div>
      <span className="text-primary font-medium">{currentStep}</span>
    </div>
  );
}
