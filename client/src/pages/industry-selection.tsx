import { useCallback } from "react";
import { useLocation } from "wouter";
import { IndustryCard } from "@/components/industry-card";
import { IndustryType } from "@shared/schema";

export default function IndustrySelection() {
  const [_, navigate] = useLocation();
  
  const handleIndustrySelect = useCallback((industry: IndustryType) => {
    navigate(`/upload/${industry}`);
  }, [navigate]);

  return (
    <main>
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Select Your Industry</h2>
          <p className="text-gray-600">Choose your profession to check outfit compliance with industry standards</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <IndustryCard 
            industry="healthcare" 
            onClick={handleIndustrySelect} 
          />
          <IndustryCard 
            industry="construction" 
            onClick={handleIndustrySelect} 
          />
        </div>
      </div>
    </main>
  );
}
