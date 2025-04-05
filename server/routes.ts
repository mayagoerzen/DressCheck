import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeOutfitCompliance } from "./api/openai";
import { insertComplianceCheckSchema, complianceCheckResponseSchema, IndustryType } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Global settings (stored in-memory for simplicity) - exported for use in other modules
export const appSettings = {
  apiKey: process.env.OPENAI_API_KEY || "",
  useMockData: !process.env.OPENAI_API_KEY
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to check outfit compliance
  app.post('/api/check-compliance', async (req, res) => {
    try {
      // Validate request body
      const validatedData = insertComplianceCheckSchema.parse(req.body);
      
      // Explicitly validate the industry parameter
      if (!validatedData.industry || !['healthcare', 'construction'].includes(validatedData.industry)) {
        return res.status(400).json({ 
          message: "Invalid industry. Please select a valid industry (healthcare or construction)." 
        });
      }
      
      // Ensure at least one of imageBase64 or description is provided
      if (!validatedData.imageBase64 && !validatedData.description) {
        return res.status(400).json({ 
          message: "Either image or description must be provided" 
        });
      }

      try {
        // Prepare parameters for the API call
        const industry = validatedData.industry as IndustryType;
        const imageBase64 = validatedData.imageBase64 ? validatedData.imageBase64 : undefined;
        const description = validatedData.description ? validatedData.description : undefined;
        
        // Call OpenAI API to analyze outfit compliance
        const result = await analyzeOutfitCompliance(
          industry,
          imageBase64,
          description
        );

        // Parse the response with Zod to ensure correct format
        const validatedResult = complianceCheckResponseSchema.parse(result);

        // Store compliance check in database
        const complianceCheck = await storage.createComplianceCheck(
          {
            industry: validatedData.industry,
            imageBase64: validatedData.imageBase64 || null,
            description: validatedData.description || null,
            timestamp: new Date().toISOString(),
          }, 
          validatedResult
        );

        return res.status(200).json(validatedResult);
      } catch (err: unknown) {
        const error = err as Error;
        console.error("Error analyzing outfit compliance:", error);
        
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        
        // Check for payload size error
        if (error.message && error.message.includes("payload size")) {
          return res.status(413).json({ 
            message: "The image file is too large. Please use an image that is less than 20MB or use a more compressed format." 
          });
        }
        
        // Check for OpenAI quota errors
        if (error.message && error.message.includes("quota")) {
          console.log("OpenAI quota exceeded. Falling back to mock data.");
          
          // Try to get mock data as a fallback
          try {
            const mockResult = await import('./api/mock-data').then(module => 
              module.getMockComplianceResponse(validatedData.industry as IndustryType)
            );
            return res.status(200).json(mockResult);
          } catch (mockError) {
            console.error("Failed to get mock data:", mockError);
          }
        }
        
        // Check for other OpenAI-specific errors
        if (error.message && error.message.includes("OpenAI")) {
          return res.status(503).json({ 
            message: "The AI service is currently unavailable. Please try again later or use the text description option instead." 
          });
        }
        
        return res.status(500).json({ 
          message: "Error analyzing outfit compliance. Please try again or provide a text description instead." 
        });
      }
    } catch (error) {
      console.error("Error validating request:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      
      return res.status(400).json({ 
        message: "Invalid request data. Please check your input and try again." 
      });
    }
  });

  // API endpoint to get compliance rules for an industry
  app.get('/api/compliance-rules/:industry', (req, res) => {
    const { industry } = req.params;
    
    if (!['healthcare', 'construction'].includes(industry)) {
      return res.status(400).json({ message: "Invalid industry. Must be 'healthcare' or 'construction'." });
    }
    
    const complianceRules = storage.getComplianceRules(industry as IndustryType);
    
    if (!complianceRules) {
      return res.status(404).json({ message: `Compliance rules not found for industry: ${industry}` });
    }
    
    return res.status(200).json(complianceRules);
  });
  
  // Use the appSettings declared at the top of the file
  
  // API endpoint to get settings
  app.get('/api/settings', (req, res) => {
    // Do not expose the actual API key in the response
    return res.status(200).json({
      apiKey: appSettings.apiKey ? "*****" : "",
      useMockData: appSettings.useMockData
    });
  });
  
  // API endpoint to update settings
  app.post('/api/settings', (req, res) => {
    try {
      const { apiKey, useMockData } = req.body;
      
      // Validate settings
      if (apiKey !== undefined && typeof apiKey !== 'string') {
        return res.status(400).json({ message: "API key must be a string" });
      }
      
      if (useMockData !== undefined && typeof useMockData !== 'boolean') {
        return res.status(400).json({ message: "useMockData must be a boolean" });
      }
      
      // Update settings
      if (apiKey !== undefined) {
        appSettings.apiKey = apiKey;
        // Update environment variable for OpenAI API calls
        if (apiKey) {
          process.env.OPENAI_API_KEY = apiKey;
        }
      }
      
      if (useMockData !== undefined) {
        appSettings.useMockData = useMockData;
      }
      
      return res.status(200).json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating settings:", error);
      return res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
