import OpenAI from "openai";
import type { 
  ChatCompletionMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
  ChatCompletionContentPart
} from "openai/resources/chat/completions";
import { IndustryType, ComplianceCheckResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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
const USE_MOCK_DATA = process.env.USE_MOCK_DATA === "true" || false; // Setting to false to use real OpenAI API

export async function analyzeOutfitCompliance(
  industry: IndustryType,
  imageBase64?: string | null,
  referenceImagesBase64?: string[],
  description?: string | null
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
    const systemContent = `You are a specialized dress code compliance expert for the ${industry} industry with extensive professional experience in workplace safety standards and regulations.
    
    ${industry === "healthcare" 
      ? `For healthcare, meticulously check for:
        - Medical uniform/scrubs standards (color, fit, cleanliness, condition)
        - Proper footwear (closed-toe, non-slip, clean, professional)
        - ID badge placement and visibility
        - Hair containment and coverage requirements
        - Jewelry restrictions (minimal, secure, non-dangling)
        - Nail length and polish regulations
        - PPE requirements for specific roles (masks, gloves, eye protection)
        - Professional appearance standards`
      : `For construction, thoroughly check for:
        - Hard hat requirements (type, condition, proper wear)
        - High-visibility clothing standards (class rating, reflective elements, condition)
        - Safety footwear specifications (steel/composite toe, ankle support, condition)
        - Eye protection requirements and standards
        - Hand protection appropriate for tasks
        - Hearing protection when required
        - Fall protection harness requirements
        - Proper work clothing (no loose items, proper coverage, flame-resistant when needed)
        - Weather-appropriate layers that maintain safety standards`}
    
    Analysis Instructions:
    1. Examine all provided images carefully, looking for both visible and missing elements
    2. Consider context-specific requirements based on apparent work environment
    3. Distinguish between critical safety violations and minor issues
    4. Base your assessment on current industry standards, OSHA regulations, and proven safety best practices
    
    Provide detailed, actionable recommendations with specific product types or standards when possible.
    Explain the safety rationale behind each recommendation.
    
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
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemContent }
    ];

    if (imageBase64) {
      // Start building the content array for the user message
      const userContent: ChatCompletionContentPart[] = [
        { type: "text", text: `Analyze this ${industry} worker's outfit for dress code compliance:` },
        { 
          type: "image_url", 
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
        }
      ];
      
      // Add reference images if provided
      if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
        userContent.push({ 
          type: "text", 
          text: "Here are additional reference images from different angles to help with the assessment:" 
        });
        
        for (const refImage of referenceImagesBase64) {
          userContent.push({
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${refImage}` }
          });
        }
      }
      
      const userMessage: ChatCompletionUserMessageParam = {
        role: "user",
        content: userContent
      };
      
      messages.push(userMessage);
    } else if (description) {
      messages.push({
        role: "user",
        content: `Analyze this ${industry} worker's outfit description for dress code compliance: ${description}`
      });
    } else {
      throw new Error("Either image or description must be provided");
    }

    // Ensure OpenAI client exists
    if (!openai) {
      throw new Error("OpenAI client is not initialized. Please provide an API key.");
    }
    
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
