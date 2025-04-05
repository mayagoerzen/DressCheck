import { users, type User, type InsertUser, type InsertComplianceCheck, type ComplianceCheck, type ComplianceCheckResponse, IndustryType } from "@shared/schema";

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

// Storage interface
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Compliance check methods
  createComplianceCheck(check: InsertComplianceCheck, result: ComplianceCheckResponse): Promise<ComplianceCheck>;
  getComplianceChecks(industry: IndustryType): Promise<ComplianceCheck[]>;
  getComplianceCheck(id: number): Promise<ComplianceCheck | undefined>;
  getComplianceRules(industry: IndustryType): any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private complianceChecks: Map<number, ComplianceCheck>;
  currentUserId: number;
  currentComplianceCheckId: number;

  constructor() {
    this.users = new Map();
    this.complianceChecks = new Map();
    this.currentUserId = 1;
    this.currentComplianceCheckId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Compliance check methods
  async createComplianceCheck(
    insertCheck: InsertComplianceCheck,
    result: ComplianceCheckResponse
  ): Promise<ComplianceCheck> {
    const id = this.currentComplianceCheckId++;
    const check: ComplianceCheck = { 
      ...insertCheck, 
      id,
      result
    };
    this.complianceChecks.set(id, check);
    return check;
  }

  async getComplianceChecks(industry: IndustryType): Promise<ComplianceCheck[]> {
    return Array.from(this.complianceChecks.values()).filter(
      (check) => check.industry === industry
    );
  }

  async getComplianceCheck(id: number): Promise<ComplianceCheck | undefined> {
    return this.complianceChecks.get(id);
  }

  getComplianceRules(industry: IndustryType) {
    return industryRules[industry];
  }
}

import { DatabaseStorage } from "./database-storage";

// Choose which storage implementation to use
// We'll use the DatabaseStorage now that we have a database configured
export const storage = new DatabaseStorage();
