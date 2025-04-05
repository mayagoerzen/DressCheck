import { ComplianceCheckResponse, IndustryType } from "@shared/schema";

// Mock data for healthcare industry
const healthcareMockResponses: ComplianceCheckResponse[] = [
  {
    isCompliant: true,
    issues: [],
    compliantItems: [
      {
        item: "Scrubs",
        description: "Clean, properly fitted blue scrubs"
      },
      {
        item: "ID Badge",
        description: "Properly displayed at chest level"
      },
      {
        item: "Footwear",
        description: "Clean white closed-toe shoes"
      },
      {
        item: "Hair containment",
        description: "Hair is properly secured and not touching collar"
      },
      {
        item: "Face mask",
        description: "Wearing a properly fitted surgical mask covering nose and mouth"
      }
    ],
    recommendations: [
      {
        title: "Consider reducing jewelry",
        description: "While your current jewelry is within acceptable limits, consider minimizing further for infection control purposes."
      }
    ]
  },
  {
    isCompliant: false,
    issues: [
      {
        type: "missing",
        item: "Face mask",
        description: "No mask is visible or mentioned. Face masks are required for all healthcare workers."
      },
      {
        type: "missing",
        item: "ID Badge",
        description: "No ID badge is visible in the image or mentioned in the description"
      },
      {
        type: "prohibited",
        item: "Footwear",
        description: "Open-toed sandals are not permitted in healthcare settings"
      }
    ],
    compliantItems: [
      {
        item: "Scrubs",
        description: "Properly wearing clean medical scrubs"
      }
    ],
    recommendations: [
      {
        title: "Wear a face mask",
        description: "Always wear a properly fitted surgical mask or appropriate respirator that covers both nose and mouth completely."
      },
      {
        title: "Display ID badge",
        description: "Ensure your ID badge is visible and properly displayed at chest level. Contact your department administrator if you need a replacement."
      },
      {
        title: "Change footwear",
        description: "Switch to closed-toe, non-slip shoes that meet healthcare facility guidelines. Athletic shoes with leather uppers are recommended."
      }
    ]
  }
];

// Mock data for construction industry
const constructionMockResponses: ComplianceCheckResponse[] = [
  {
    isCompliant: true,
    issues: [],
    compliantItems: [
      {
        item: "Hard Hat",
        description: "ANSI-approved yellow hard hat in good condition"
      },
      {
        item: "High-visibility clothing",
        description: "Class 2 high-visibility vest with reflective strips"
      },
      {
        item: "Safety footwear",
        description: "Steel-toed boots that meet ASTM standards"
      },
      {
        item: "Eye protection",
        description: "Safety glasses with side shields"
      },
      {
        item: "Proper workwear",
        description: "Long-sleeve shirt and full-length pants"
      }
    ],
    recommendations: [
      {
        title: "Consider adding gloves",
        description: "While not always required, task-appropriate gloves would provide additional protection for your hands."
      }
    ]
  },
  {
    isCompliant: false,
    issues: [
      {
        type: "missing",
        item: "Hard Hat",
        description: "No hard hat or safety helmet is visible in the image or mentioned in the description. This is a critical safety requirement for construction sites."
      },
      {
        type: "missing",
        item: "Eye protection",
        description: "No safety glasses or goggles are visible or mentioned"
      },
      {
        type: "prohibited",
        item: "Footwear",
        description: "Regular sneakers or athletic shoes do not provide adequate protection for construction sites. Safety boots with reinforced toes are required."
      }
    ],
    compliantItems: [
      {
        item: "High-visibility clothing",
        description: "Properly wearing high-visibility vest with reflective elements"
      }
    ],
    recommendations: [
      {
        title: "Wear appropriate hard hat",
        description: "Always wear an approved hard hat that meets ANSI/ISEA Z89.1 standards. Hard hats can be various colors including yellow, white, orange, or blue. Replace if damaged or older than 5 years."
      },
      {
        title: "Use proper eye protection",
        description: "Wear safety glasses or goggles that meet ANSI Z87.1 standards. Consider side shields for additional protection."
      },
      {
        title: "Upgrade footwear",
        description: "Use steel-toed or composite-toed boots that meet ASTM F2413 standards. These typically have reinforced toes and thick soles. Ensure they provide ankle support and puncture resistance."
      }
    ]
  }
];

export function getMockComplianceResponse(industry: IndustryType): ComplianceCheckResponse {
  const mockResponses = industry === "healthcare" 
    ? healthcareMockResponses 
    : constructionMockResponses;
  
  // Randomly select one of the mock responses
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  return mockResponses[randomIndex];
}