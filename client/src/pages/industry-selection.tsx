import { useCallback } from "react";
import { useLocation } from "wouter";
import { IndustryCard } from "@/components/industry-card";
import { IndustryType } from "@shared/schema";
import { FaUserMd, FaHardHat } from "react-icons/fa";

export default function IndustrySelection() {
  const [_, navigate] = useLocation();
  
  const handleIndustrySelect = useCallback((industry: IndustryType) => {
    navigate(`/upload/${industry}`);
  }, [navigate]);

  return (
    <main>
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Select Your Industry</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Choose your profession to check if your outfit complies with industry-specific dress code standards</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div 
            className="bg-blue-50 border-2 border-blue-200 hover:border-blue-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center"
            onClick={() => handleIndustrySelect("healthcare")}
          >
            <div className="bg-blue-100 rounded-full p-5 mb-4">
              <FaUserMd className="text-blue-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Healthcare</h3>
            <p className="text-gray-600 text-center">Medical professionals, nursing staff, and clinical workers</p>
            <ul className="mt-4 text-sm text-gray-600 space-y-2">
              <li className="flex items-center"><span className="mr-2 text-blue-500">✓</span> Scrubs & Lab Coats</li>
              <li className="flex items-center"><span className="mr-2 text-blue-500">✓</span> PPE Standards</li>
              <li className="flex items-center"><span className="mr-2 text-blue-500">✓</span> Footwear Requirements</li>
            </ul>
          </div>
          
          <div 
            className="bg-amber-50 border-2 border-amber-200 hover:border-amber-500 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center"
            onClick={() => handleIndustrySelect("construction")}
          >
            <div className="bg-amber-100 rounded-full p-5 mb-4">
              <FaHardHat className="text-amber-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Construction</h3>
            <p className="text-gray-600 text-center">Construction workers, engineers, and site safety personnel</p>
            <ul className="mt-4 text-sm text-gray-600 space-y-2">
              <li className="flex items-center"><span className="mr-2 text-amber-500">✓</span> High-Visibility Wear</li>
              <li className="flex items-center"><span className="mr-2 text-amber-500">✓</span> Safety Equipment</li>
              <li className="flex items-center"><span className="mr-2 text-amber-500">✓</span> Protective Footwear</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
