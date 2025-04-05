import { useCallback } from "react";
import { IndustryType } from "@shared/schema";
import { Heart, HardHat, CheckCircle } from "lucide-react";

interface IndustryCardProps {
  industry: IndustryType;
  onClick: (industry: IndustryType) => void;
}

const industryConfig = {
  healthcare: {
    title: "Healthcare",
    subtitle: "Medical professionals, nurses, clinicians, care providers",
    icon: Heart,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderHover: "hover:border-blue-400",
    features: [
      "Scrubs, lab coats, medical uniforms",
      "PPE, hygiene standards, footwear"
    ]
  },
  construction: {
    title: "Construction",
    subtitle: "Workers, engineers, supervisors, site personnel",
    icon: HardHat,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderHover: "hover:border-yellow-400",
    features: [
      "Hard hats, safety vests, protective gear",
      "Safety footwear, gloves, eye protection"
    ]
  }
};

export function IndustryCard({ industry, onClick }: IndustryCardProps) {
  const config = industryConfig[industry];
  const Icon = config.icon;
  
  const handleClick = useCallback(() => {
    onClick(industry);
  }, [industry, onClick]);

  return (
    <div 
      className={`cursor-pointer bg-white rounded-xl border border-gray-200 p-6 ${config.borderHover} hover:shadow-md transition-all`}
      onClick={handleClick}
    >
      <div className="flex items-start">
        <div className={`${config.bgColor} p-3 rounded-lg mr-4`}>
          <Icon className={`w-6 h-6 ${config.color}`} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{config.title}</h3>
          <p className="text-gray-600 text-sm">{config.subtitle}</p>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        {config.features.map((feature, index) => (
          <div key={index} className="flex items-center mb-1">
            <CheckCircle className={`w-4 h-4 ${config.color} mr-2`} />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
