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
      "face mask or respirator",
    ],
    prohibitedItems: [
      "open-toed shoes",
      "excessive jewelry",
      "long nails",
      "strong perfume/cologne",
      "casual clothing (jeans, t-shirts)",
      "damaged or soiled PPE",
    ],
  },
  construction: {
    requiredItems: [
      "hard hat or safety helmet",
      "high-visibility vest or clothing",
      "safety boots or protective footwear",
      "eye protection",
      "appropriate workwear (pants, long-sleeve shirts)",
    ],
    prohibitedItems: [
      "loose clothing",
      "jewelry",
      "regular sneakers or athletic shoes",
      "sandals or open-toed footwear",
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
      "Scrubs, lab coats, medical uniforms, masks",
      "PPE, hygiene standards, closed-toe footwear"
    ],
    placeholder: "Example: I'm wearing blue scrubs, a surgical mask, white sneakers, a stethoscope, and have my ID badge clipped to my shirt pocket.",
  },
  construction: {
    title: "Construction",
    subtitle: "Workers, engineers, supervisors, site personnel",
    icon: "fa-hard-hat",
    color: "text-construction",
    bgColor: "bg-construction",
    borderHover: "hover:border-construction",
    features: [
      "Hard hats/safety helmets, high-vis clothing",
      "Steel-toe/safety boots, eye protection"
    ],
    placeholder: "Example: I'm wearing a yellow hard hat, high-visibility vest, steel-toe safety boots, jeans, and safety glasses.",
  }
};
