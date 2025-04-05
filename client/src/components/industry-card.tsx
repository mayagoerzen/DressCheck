import { useCallback } from "react";
import { IndustryType } from "@shared/schema";

interface IndustryCardProps {
  industry: IndustryType;
  onClick: (industry: IndustryType) => void;
}

const industryConfig = {
  healthcare: {
    title: "Healthcare",
    subtitle: "Medical professionals, nurses, clinicians, care providers",
    icon: "fa-heartbeat",
    color: "text-healthcare",
    bgColor: "bg-healthcare",
    borderHover: "hover:border-healthcare",
    features: [
      "Scrubs, lab coats, medical uniforms",
      "PPE, hygiene standards, footwear"
    ]
  },
  construction: {
    title: "Construction",
    subtitle: "Workers, engineers, supervisors, site personnel",
    icon: "fa-hard-hat",
    color: "text-construction",
    bgColor: "bg-construction",
    borderHover: "hover:border-construction",
    features: [
      "Hard hats, safety vests, protective gear",
      "Safety footwear, gloves, eye protection"
    ]
  }
};

export function IndustryCard({ industry, onClick }: IndustryCardProps) {
  const config = industryConfig[industry];
  
  const handleClick = useCallback(() => {
    onClick(industry);
  }, [industry, onClick]);

  return (
    <div 
      className={`cursor-pointer bg-white rounded-xl border border-gray-200 p-6 ${config.borderHover} hover:shadow-md transition-all`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className={`${config.bgColor} bg-opacity-10 p-3 rounded-lg mr-4`}>
          <i className={`fas ${config.icon} text-xl ${config.color}`}></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
          <p className="text-gray-600 text-sm">{config.subtitle}</p>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {config.features.map((feature, index) => (
          <div key={index} className="flex items-center mb-1">
            <i className={`fas fa-check-circle ${config.color} mr-2`}></i>
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
