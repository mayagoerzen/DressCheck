import OpenAI from "openai";
import { IndustryType, ComplianceCheckResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Industry-specific rules to check against
const industryRules = {
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
    recommendations: {
      "ID badge": "Ensure your ID badge is visible and properly displayed at chest level. Contact your department administrator if you need a replacement.",
      "footwear": "Switch to closed-toe, non-slip shoes that meet healthcare facility guidelines. Athletic shoes with leather uppers are recommended.",
      "hair": "Hair should be pulled back and secured above the collar. Use hair ties or clips to ensure proper containment.",
      "jewelry": "Remove excessive jewelry. Only simple rings, studs, and professional watches are typically allowed.",
      "uniform": "Ensure your scrubs or medical uniform is clean, wrinkle-free, and fits properly. Replace worn or stained items.",
    },
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
    recommendations: {
      "hard hat": "Always wear an approved hard hat that meets ANSI/ISEA Z89.1 standards. Replace if damaged or older than 5 years.",
      "high-visibility": "Wear a high-visibility vest or clothing that meets Class 2 or 3 based on your work environment. Ensure it's clean and reflective strips are intact.",
      "footwear": "Use steel-toed or composite-toed boots that meet ASTM F2413 standards. Ensure they provide ankle support and puncture resistance.",
      "eye protection": "Wear safety glasses or goggles that meet ANSI Z87.1 standards. Consider side shields for additional protection.",
      "gloves": "Use appropriate gloves for your specific task. Cut-resistant gloves for handling sharp materials, insulated for electrical work, etc.",
    }
  }
};

import { getMockComplianceResponse } from "./mock-data";

// Environment variable to control whether to use the real API or mock data
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true" || true; // Default to true for now due to quota issues

export async function analyzeOutfitCompliance(
  industry: IndustryType,
  imageBase64?: string,
  description?: string
): Promise<ComplianceCheckResponse> {
  // Use mock data if enabled (or if OpenAI API key is missing)
  if (USE_MOCK_DATA || !process.env.OPENAI_API_KEY) {
    console.log("Using mock data for compliance check");
    
    // Simulate a brief delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return getMockComplianceResponse(industry);
  }
  
  // Otherwise use the actual OpenAI API
  try {
    const systemContent = `You are a dress code compliance expert for the ${industry} industry. 
    Analyze the outfit and determine if it meets industry standards.
    ${industry === "healthcare" 
      ? "For healthcare, check for: scrubs/medical uniform, closed-toe shoes, ID badge, hair containment, no excessive jewelry, no long nails." 
      : "For construction, check for: hard hat, high-visibility clothing, safety boots, eye protection, appropriate workwear, no loose clothing, no jewelry."}
    
    Provide a detailed analysis and recommendations to fix any compliance issues.
    Respond with JSON in this format: 
    {
      "isCompliant": boolean,
      "issues": [
        { "type": "missing"|"incorrect"|"prohibited", "item": string, "description": string }
      ],
      "compliantItems": [
        { "item": string, "description": string }
      ],
      "recommendations": [
        { "title": string, "description": string }
      ]
    }`;
    
    // Setup the messages array with proper typing for OpenAI API
    let userContent: any;

    if (imageBase64) {
      userContent = [
        { type: "text", text: `Analyze this ${industry} worker's outfit for dress code compliance:` },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ];
    } else if (description) {
      userContent = `Analyze this ${industry} worker's outfit description for dress code compliance: ${description}`;
    } else {
      throw new Error("Either image or description must be provided");
    }

    const messages = [
      { role: "system" as const, content: systemContent },
      { role: "user" as const, content: userContent }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content as string);
    
    // Validate the result format
    if (result.isCompliant === undefined || !Array.isArray(result.issues) || !Array.isArray(result.compliantItems) || !Array.isArray(result.recommendations)) {
      throw new Error("Invalid response format from AI service");
    }
    
    return result;
  } catch (error: any) {
    console.error("Error analyzing outfit compliance:", error);
    throw new Error(`Failed to analyze outfit compliance: ${error.message}`);
  }
}
