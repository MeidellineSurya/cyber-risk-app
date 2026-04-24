import { NextRequest, NextResponse } from "next/server";
import { mapStackToRisks } from "@/lib/riskMapping";
import { enrichRisk } from "@/lib/groqClient";
import { AssessmentInput, AssessmentResult } from "@/types";

export async function POST(req: NextRequest) {
  const body: AssessmentInput = await req.json();
  const { companyType, stack, notes } = body;

  if (!stack || stack.length === 0) {
    return NextResponse.json({ error: "Stack is required" }, { status: 400 });
  }

  // 1. Map stack to risks + score them
  const risks = mapStackToRisks(stack);

  // 2. Enrich top 5 risks with Groq (limit to avoid rate limits)
  const topRisks = risks.slice(0, 5);
  const enriched = await Promise.all(
    topRisks.map(async (r) => {
      const ai = await enrichRisk(r.risk, companyType);
      return { ...r, ...ai };
    })
  );

  // Merge enriched back
  const allRisks = [
    ...enriched,
    ...risks.slice(5),
  ];

  // 3. Calculate overall score (weighted average of top risks)
  const overallScore = Math.round(
    allRisks.slice(0, 5).reduce((sum, r) => sum + r.score, 0) / Math.min(allRisks.length, 5)
  );

  const summary =
    overallScore >= 80
      ? "Critical risk posture — immediate action required."
      : overallScore >= 60
      ? "High risk posture — significant vulnerabilities detected."
      : overallScore >= 30
      ? "Moderate risk posture — some areas need attention."
      : "Low risk posture — keep monitoring.";

  const topActions = enriched
    .slice(0, 3)
    .map((r) => r.mitigation ?? "Review this risk")
    .filter(Boolean);

  const result: AssessmentResult = {
    id: crypto.randomUUID(),
    overallScore,
    summary,
    risks: allRisks,
    topActions,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(result);
}