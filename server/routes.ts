import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeOutfitCompliance } from "./api/openai";
import { insertComplianceCheckSchema, complianceCheckResponseSchema, IndustryType } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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
        // Call OpenAI API to analyze outfit compliance
        const result = await analyzeOutfitCompliance(
          validatedData.industry as IndustryType,
          validatedData.imageBase64 || undefined,
          validatedData.referenceImagesBase64, // Pass reference images
          validatedData.description || undefined
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
      } catch (error) {
        console.error("Error analyzing outfit compliance:", error);
        
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          return res.status(400).json({ message: validationError.message });
        }
        
        return res.status(500).json({ 
          message: "Error analyzing outfit compliance. Please try again." 
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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
