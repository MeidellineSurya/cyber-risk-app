import { RiskItem, Severity } from "@/types";

export function getSeverity(score: number): Severity {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function calculateOverallScore(risks: RiskItem[]): number {
  if (risks.length === 0) return 0;
  const top = risks.slice(0, 5);
  return Math.round(top.reduce((sum, r) => sum + r.score, 0) / top.length);
}

export function getSummary(score: number): string {
  if (score >= 80) return "Critical risk posture — immediate action required.";
  if (score >= 60) return "High risk posture — significant vulnerabilities detected.";
  if (score >= 30) return "Moderate risk posture — some areas need attention.";
  return "Low risk posture — keep monitoring.";
}