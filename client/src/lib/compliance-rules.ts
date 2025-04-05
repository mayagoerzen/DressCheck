import { IndustryType } from "@shared/schema";
import { IndustryRules, IndustryConfigMap } from "./types";

// Industry compliance rules
export const industryRules: Record<IndustryType, IndustryRules> = {
  healthcare: {
    requiredItems: [
      "scrubs or medical uniform",
      "closed-toe shoes",
      "ID badge",
      "clean uniform",
      "hair containment (if applicable)",
    ],
    prohibitedItems: [
      "open-toed shoes",
      "excessive jewelry",
      "long nails",
      "strong perfume/cologne",
      "casual clothing (jeans, t-shirts)",
    ],
  },
  construction: {
    requiredItems: [
      "hard hat",
      "high-visibility vest or clothing",
      "safety boots or shoes",
      "eye protection",
      "appropriate workwear (pants, long-sleeve shirts)",
    ],
    prohibitedItems: [
      "loose clothing",
      "jewelry",
      "sandals or casual shoes",
      "shorts (on most sites)",
      "damaged protective equipment",
    ],
  },
};

// Industry UI configuration
export const industryConfig: IndustryConfigMap = {
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
    ],
    placeholder: "Example: I'm wearing blue scrubs, white sneakers, a stethoscope, and have my ID badge clipped to my shirt pocket.",
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
    ],
    placeholder: "Example: I'm wearing a yellow hard hat, high-visibility vest, work boots, jeans, and safety glasses.",
  }
};
