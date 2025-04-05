import OpenAI from "openai";
import type { 
  ThreadCreateParams, 
  AssistantCreateParams,
  RunCreateParams
} from "openai/resources";
import { IndustryType, ComplianceCheckResponse } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Assistants for each industry
let healthcareAssistantId: string | null = null;
let constructionAssistantId: string | null = null;

// Helper function to get appropriate assistant ID 
async function getAssistantId(industry: IndustryType): Promise<string> {
  if (industry === "healthcare" && healthcareAssistantId) {
    return healthcareAssistantId;
  }
  
  if (industry === "construction" && constructionAssistantId) {
    return constructionAssistantId;
  }
  
  // Need to create the assistant
  const assistantName = industry === "healthcare" 
    ? "Healthcare Dress Code Compliance Assistant" 
    : "Construction Dress Code Compliance Assistant";
    
  const instructions = industry === "healthcare"
    ? `You are a specialized healthcare dress code compliance expert. 
       Your role is to analyze outfits and determine if they meet healthcare industry standards.
       Check for: scrubs/medical uniform, closed-toe shoes, ID badge, hair containment, no excessive jewelry, no long nails.
       Provide detailed analysis and recommendations to fix any compliance issues.
       Always respond in JSON format.`
    : `You are a specialized construction site dress code compliance expert.
       Your role is to analyze worker outfits and determine if they meet construction industry safety standards.
       Check for: hard hat, high-visibility clothing, safety boots, eye protection, appropriate workwear, no loose clothing, no jewelry.
       Provide detailed analysis and recommendations to fix any compliance issues.
       Always respond in JSON format.`;
       
  // Create industry specific assistant
  const assistant = await openai.beta.assistants.create({
    name: assistantName,
    instructions: instructions,
    model: "gpt-4o", // Use the latest model
    tools: [{ type: "code_interpreter" }], // Optional for image analysis
    response_format: { type: "json_object" }
  });
  
  // Store the assistant ID
  if (industry === "healthcare") {
    healthcareAssistantId = assistant.id;
  } else {
    constructionAssistantId = assistant.id;
  }
  
  return assistant.id;
}

// Main function to analyze outfit compliance using OpenAI Assistant
export async function analyzeOutfitComplianceWithAssistant(
  industry: IndustryType,
  imageBase64?: string | null,
  referenceImagesBase64?: string[],
  description?: string | null,
  maxRetries = 5,
  retryDelay = 1000
): Promise<ComplianceCheckResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not set. Please set the OPENAI_API_KEY environment variable.");
  }
  
  try {
    // Get or create assistant for the industry
    const assistantId = await getAssistantId(industry);
    
    // Create a thread
    const thread = await openai.beta.threads.create();
    
    // Add user message to the thread
    const messageContent = [];
    
    // Add text description
    if (description) {
      messageContent.push(`Analyze this ${industry} worker's outfit description for dress code compliance: ${description}`);
    }
    
    // Add main image instruction if available
    if (imageBase64) {
      messageContent.push(`Analyze this ${industry} worker's outfit in the image for dress code compliance.`);
    }
    
    // Add reference images instruction if available
    if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
      messageContent.push("Here are additional reference images from different angles to help with the assessment.");
    }
    
    // Submit the message text
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: messageContent.join("\n\n"),
    });
    
    // Add images if available
    if (imageBase64) {
      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: [
          {
            type: "image_file",
            image_file: {
              file_id: await uploadBase64Image(imageBase64)
            }
          }
        ]
      });
    }
    
    // Add reference images if available
    if (referenceImagesBase64 && referenceImagesBase64.length > 0) {
      for (const refImage of referenceImagesBase64) {
        await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: [
            {
              type: "image_file",
              image_file: {
                file_id: await uploadBase64Image(refImage)
              }
            }
          ]
        });
      }
    }
    
    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: `Analyze the outfit for ${industry} dress code compliance. 
                    Respond in JSON format with these fields:
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
                    }`
    });
    
    // Poll for results
    let attempts = 0;
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    
    while (runStatus.status !== "completed" && attempts < maxRetries) {
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      attempts++;
      
      // Increase delay with exponential backoff
      retryDelay *= 1.5;
    }
    
    // If still not completed, throw error
    if (runStatus.status !== "completed") {
      throw new Error(`Assistant analysis timed out after ${attempts} attempts`);
    }
    
    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(thread.id);
    
    // Find the last assistant message
    const assistantMessages = messages.data.filter(msg => msg.role === "assistant");
    
    if (assistantMessages.length === 0) {
      throw new Error("No response received from the assistant");
    }
    
    const lastMessage = assistantMessages[0];
    
    // Parse the JSON response
    if (typeof lastMessage.content[0].text === 'undefined') {
      throw new Error("Invalid response format from the assistant");
    }
    
    // Extract and parse JSON
    const responseText = lastMessage.content[0].text.value;
    const jsonMatch = responseText.match(/```json([\s\S]*?)```/) || 
                      responseText.match(/{[\s\S]*}/);
    
    if (!jsonMatch) {
      throw new Error("Could not extract JSON from the assistant's response");
    }
    
    const jsonText = jsonMatch[0].replace(/```json|```/g, '').trim();
    const result = JSON.parse(jsonText);
    
    // Validate the result format
    if (result.isCompliant === undefined || 
        !Array.isArray(result.issues) || 
        !Array.isArray(result.compliantItems) || 
        !Array.isArray(result.recommendations)) {
      throw new Error("Invalid response format from the assistant");
    }
    
    return result;
  } catch (error: any) {
    console.error("Error analyzing outfit compliance with assistant:", error);
    throw new Error(`Failed to analyze with assistant: ${error.message}`);
  }
}

// Helper function to upload a base64 image
async function uploadBase64Image(base64String: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Create a file object
    const file = await openai.files.create({
      file: buffer,
      purpose: "assistants",
    });
    
    return file.id;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

// Export both approaches for flexibility
export { analyzeOutfitComplianceWithAssistant as analyzeOutfitCompliance };