import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Create industry enum
export const IndustryType = z.enum(["healthcare", "construction"]);
export type IndustryType = z.infer<typeof IndustryType>;

// Create compliance check schema
export const complianceChecks = pgTable("compliance_checks", {
  id: serial("id").primaryKey(),
  industry: text("industry").notNull(),
  imageBase64: text("image_base64"),
  description: text("description"),
  result: jsonb("result"),
  timestamp: text("timestamp").notNull(),
});

export const insertComplianceCheckSchema = createInsertSchema(complianceChecks)
  .pick({
    industry: true,
    imageBase64: true,
    description: true,
  })
  .extend({
    // Override industry field validation to ensure it's one of our allowed types
    industry: z.enum(["healthcare", "construction"], {
      errorMap: (issue, ctx) => ({
        message: "Invalid industry. Please select a valid industry (healthcare or construction)."
      })
    }),
    // Add reference images base64 array
    referenceImagesBase64: z.array(z.string()).optional(),
    // Add an optional timestamp field to be used when creating a compliance check
    timestamp: z.string().optional()
  });

export const complianceCheckResponseSchema = z.object({
  isCompliant: z.boolean(),
  issues: z.array(
    z.object({
      type: z.enum(["missing", "incorrect", "prohibited"]),
      item: z.string(),
      description: z.string(),
    })
  ),
  compliantItems: z.array(
    z.object({
      item: z.string(),
      description: z.string(),
    })
  ),
  recommendations: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertComplianceCheck = z.infer<typeof insertComplianceCheckSchema>;
export type ComplianceCheck = typeof complianceChecks.$inferSelect;
export type ComplianceCheckResponse = z.infer<typeof complianceCheckResponseSchema>;
