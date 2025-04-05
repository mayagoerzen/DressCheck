import { users, type User, type InsertUser, type InsertComplianceCheck, type ComplianceCheck, type ComplianceCheckResponse, IndustryType, complianceChecks } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

// Industry compliance rules
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

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    return user;
  }

  // Compliance check methods
  async createComplianceCheck(
    insertCheck: InsertComplianceCheck,
    result: ComplianceCheckResponse
  ): Promise<ComplianceCheck> {
    const [check] = await db
      .insert(complianceChecks)
      .values({
        industry: insertCheck.industry,
        imageBase64: insertCheck.imageBase64,
        description: insertCheck.description,
        timestamp: insertCheck.timestamp,
        result: result
      })
      .returning();
    
    return check;
  }

  async getComplianceChecks(industry: IndustryType): Promise<ComplianceCheck[]> {
    return db
      .select()
      .from(complianceChecks)
      .where(eq(complianceChecks.industry, industry));
  }

  async getComplianceCheck(id: number): Promise<ComplianceCheck | undefined> {
    const [check] = await db
      .select()
      .from(complianceChecks)
      .where(eq(complianceChecks.id, id));
    
    return check || undefined;
  }

  getComplianceRules(industry: IndustryType) {
    return industryRules[industry];
  }
}