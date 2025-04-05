import OpenAI from "openai";
import { IndustryType, ComplianceCheckResponse } from "@shared/schema";

// Import app settings - must use require to avoid circular dependencies
// This works because we're using CommonJS modules under the hood
let appSettings: { apiKey: string; useMockData: boolean };
try {
  appSettings = require("../routes").appSettings;
} catch (e) {
  // Fallback if import fails
  appSettings = {
    apiKey: process.env.OPENAI_API_KEY || "",
    useMockData: !process.env.OPENAI_API_KEY
  };
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Initialize OpenAI client - this will be recreated whenever a new API key is set
let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  // Clear the client if it exists but the key has changed
  if (openaiClient && openaiClient.apiKey !== process.env.OPENAI_API_KEY) {
    openaiClient = null;
  }
  
  // Create a new client if needed
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    try {
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } catch (error) {
      console.error("Failed to create OpenAI client:", error);
      return null;
    }
  }
  
  return openaiClient;
}

// Industry-specific rules to check against
const industryRules = {
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
    recommendations: {
      "ID badge": "Ensure your ID badge is visible and properly displayed at chest level. Contact your department administrator if you need a replacement.",
      "footwear": "Switch to closed-toe, non-slip shoes that meet healthcare facility guidelines. Athletic shoes with leather uppers are recommended.",
      "hair": "Hair should be pulled back and secured above the collar. Use hair ties or clips to ensure proper containment.",
      "jewelry": "Remove excessive jewelry. Only simple rings, studs, and professional watches are typically allowed.",
      "uniform": "Ensure your scrubs or medical uniform is clean, wrinkle-free, and fits properly. Replace worn or stained items.",
      "mask": "Wear a properly fitted surgical mask or respirator (N95, KN95) as required by facility policy. Ensure it covers both nose and mouth completely.",
    },
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
      "regular sneakers or casual shoes",
      "sandals or open-toed footwear",
      "shorts (on most sites)",
      "damaged protective equipment",
    ],
    recommendations: {
      "hard hat": "Always wear an approved hard hat that meets ANSI/ISEA Z89.1 standards. Replace if damaged or older than 5 years. Hard hats can be various colors including yellow, white, orange, or blue.",
      "high-visibility": "Wear a high-visibility vest or clothing that meets Class 2 or 3 based on your work environment. Ensure it's clean and reflective strips are intact.",
      "footwear": "Use steel-toed, composite-toed, or safety boots that meet ASTM F2413 standards. Ensure they provide ankle support and puncture resistance. Safety boots typically have a reinforced toe and thick soles.",
      "eye protection": "Wear safety glasses or goggles that meet ANSI Z87.1 standards. Consider side shields for additional protection.",
      "gloves": "Use appropriate gloves for your specific task. Cut-resistant gloves for handling sharp materials, insulated for electrical work, etc.",
    }
  }
};

import { getMockComplianceResponse } from "./mock-data";

export async function analyzeOutfitCompliance(
  industry: IndustryType,
  imageBase64?: string,
  description?: string
): Promise<ComplianceCheckResponse> {
  // Get the current settings at runtime
  const useMockData = typeof appSettings !== 'undefined' ? appSettings.useMockData : true;
  
  // Use mock data if enabled or if OpenAI API key is missing
  if (useMockData || !process.env.OPENAI_API_KEY) {
    console.log("Using mock data for compliance check");
    
    // Simulate a brief delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock data
    return getMockComplianceResponse(industry);
  }
  
  // Otherwise use the actual OpenAI API
  try {
    const rules = industryRules[industry];
    const requiredItems = rules.requiredItems.join(", ");
    const prohibitedItems = rules.prohibitedItems.join(", ");
    
    const systemContent = `You are a dress code compliance expert specializing in the ${industry} industry.
    Your task is to analyze the outfit with extreme precision and determine if it meets industry standards.
    
    INDUSTRY REQUIREMENTS FOR ${industry.toUpperCase()}:
    - Required items: ${requiredItems}
    - Prohibited items: ${prohibitedItems}
    
    ITEM RECOGNITION GUIDELINES:
    ${industry === "healthcare" ? `
    - Face masks: Recognize surgical masks, N95 respirators, or any medical-grade face coverings. These are REQUIRED. They may be blue, white, or other colors.
    - Scrubs: Can be various colors like blue, green, or patterned. Typically consist of a top and matching pants.
    - ID badges: Look for identification cards typically worn on lanyards or clips at chest level.` : `
    - Hard hats/safety helmets: These may be yellow, white, orange, blue, or other colors. They must cover the top of the head. Look carefully for this critical safety item.
    - Safety boots: These have reinforced toes (steel or composite), thick soles, often leather, and typically cover the ankle. Regular sneakers, running shoes, or casual footwear are NOT compliant.
    - High-visibility clothing: Usually yellow or orange vests or clothing with reflective strips.`}
    
    ANALYSIS INSTRUCTIONS:
    1. Carefully examine all visible elements in the image (if provided) or analyze the description thoroughly.
    2. Identify each required item and verify it is present and correctly worn.
    3. Check for any prohibited items.
    4. For each item, provide specific details about what you observe.
    5. Be extremely specific in your analysis - mention colors, positioning, and condition of items.
    
    COMPLIANCE RULES:
    - For an outfit to be compliant, ALL required items must be present AND properly worn.
    - ANY prohibited item will make the outfit non-compliant.
    - If an item cannot be clearly seen or determined from the image/description, consider it missing.
    
    Provide a detailed analysis and actionable recommendations to fix any compliance issues.
    
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
        { 
          type: "text", 
          text: `Please analyze this ${industry} worker's outfit for dress code compliance. Look carefully at all visible elements and be extremely detailed in your analysis.

${industry === "healthcare" ? 
`IMPORTANT: Carefully check if the person is wearing a mask. This is a critical requirement for healthcare workers.
Also look for an ID badge which must be visible. Pay attention to shoe type - they must be closed-toe.` 
: 
`IMPORTANT: Carefully examine the head area for a hard hat or safety helmet - this is a critical safety requirement.
Also carefully check the footwear - regular sneakers/athletic shoes are NOT compliant - workers need protective boots.
Look for high-visibility clothing which is typically yellow or orange with reflective elements.`}

Pay special attention to: clothing type/color, footwear, protective equipment, accessories, and overall appearance. If you can't clearly see an item, note it as potentially missing.` 
        },
        { 
          type: "image_url", 
          image_url: { url: `data:image/jpeg;base64,${imageBase64}` } 
        }
      ];
    } else if (description) {
      userContent = `Please analyze this ${industry} worker's outfit description for dress code compliance in extreme detail: "${description}".

${industry === "healthcare" ? 
`IMPORTANT: Check if a mask or face covering is mentioned - this is REQUIRED for healthcare workers.
Also check for ID badge which must be visible. Pay attention to shoe type - they must be closed-toe.` 
: 
`IMPORTANT: Check if a hard hat or safety helmet is mentioned - this is a CRITICAL safety requirement.
Also check the footwear - regular sneakers/athletic shoes are NOT compliant - workers need protective boots.
Look for mention of high-visibility clothing which is typically yellow or orange with reflective elements.`}

Evaluate every item mentioned against the required and prohibited lists. For items not explicitly mentioned in the description, consider them as potentially missing.`;
    } else {
      throw new Error("Either image or description must be provided");
    }

    const messages = [
      { role: "system" as const, content: systemContent },
      { role: "user" as const, content: userContent }
    ];

    // Get or create the OpenAI client
    const openai = getOpenAIClient();
    
    if (!openai) {
      throw new Error("OpenAI client could not be initialized. Please check your API key.");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
      max_tokens: 1500,
      temperature: 0.2, // Lower temperature for more consistent, predictable outputs
      top_p: 0.95,      // High top_p for comprehensive consideration
      presence_penalty: 0.1, // Slight encouragement for diverse elements
      frequency_penalty: 0.2, // Discourage repetition
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
