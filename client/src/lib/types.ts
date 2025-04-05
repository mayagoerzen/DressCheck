import { IndustryType } from "@shared/schema";

export interface ComplianceIssue {
  type: "missing" | "incorrect" | "prohibited";
  item: string;
  description: string;
}

export interface ComplianceItem {
  item: string;
  description: string;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  issues: ComplianceIssue[];
  compliantItems: ComplianceItem[];
  recommendations: Recommendation[];
}

export interface IndustryRules {
  requiredItems: string[];
  prohibitedItems: string[];
}

export interface IndustryConfig {
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  bgColor: string;
  borderHover: string;
  features: string[];
  placeholder: string;
}

export type IndustryConfigMap = {
  [key in IndustryType]: IndustryConfig;
};
