export type Severity = "critical" | "high" | "medium" | "low";

export interface RiskItem {
  id: string;
  risk: string;
  source: string;
  likelihood: number;  // 1-5
  impact: number;      // 1-5
  exposure: number;    // 1-5
  score: number;       // likelihood × impact × exposure
  severity: Severity;
  description?: string;
  businessImpact?: string;
  mitigation?: string;
}

export interface AssessmentInput {
  companyType: string;
  stack: string[];
  notes?: string;
}

export interface AssessmentResult {
  id: string;
  overallScore: number;
  summary: string;
  risks: RiskItem[];
  topActions: string[];
  createdAt: string;
}