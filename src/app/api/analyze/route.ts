import { NextRequest, NextResponse } from "next/server";
import { mapStackToRisks } from "@/lib/riskMapping";
import { enrichRisk } from "@/lib/groqClient";
import { supabase } from "@/lib/supabase";
import { AssessmentInput, AssessmentResult } from "@/types";

export async function POST(req: NextRequest) {
  const body: AssessmentInput = await req.json();
  const { companyType, stack, notes } = body;

  if (!stack || stack.length === 0) {
    return NextResponse.json({ error: "Stack is required" }, { status: 400 });
  }

  const risks = mapStackToRisks(stack);

  const topRisks = risks.slice(0, 5);
  const enriched = await Promise.all(
    topRisks.map(async (r) => {
      const ai = await enrichRisk(r.risk, companyType);
      return { ...r, ...ai };
    })
  );

  const allRisks = [...enriched, ...risks.slice(5)];

  const overallScore = Math.round(
    allRisks.slice(0, 5).reduce((sum, r) => sum + r.score, 0) / Math.min(allRisks.length, 5)
  );

  const summary =
    overallScore >= 80 ? "Critical risk posture — immediate action required."
    : overallScore >= 60 ? "High risk posture — significant vulnerabilities detected."
    : overallScore >= 30 ? "Moderate risk posture — some areas need attention."
    : "Low risk posture — keep monitoring.";

  const topActions = enriched
    .slice(0, 3)
    .map((r) => r.mitigation ?? "Review this risk")
    .filter(Boolean);

  // Save to Supabase
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .insert({
      company_type: companyType,
      stack,
      notes,
      overall_score: overallScore,
      summary,
      top_actions: topActions,
    })
    .select()
    .single();

  if (assessmentError || !assessment) {
    console.error("Failed to save assessment:", assessmentError);
    return NextResponse.json({ error: "Failed to save assessment" }, { status: 500 });
  }

  // Save risks
  await supabase.from("risks").insert(
    allRisks.map((r) => ({
      assessment_id: assessment.id,
      risk: r.risk,
      source: r.source,
      severity: r.severity,
      score: r.score,
      likelihood: r.likelihood,
      impact: r.impact,
      exposure: r.exposure,
      description: r.description ?? null,
      business_impact: r.businessImpact ?? null,
      mitigation: r.mitigation ?? null,
    }))
  );

  const result: AssessmentResult = {
    id: assessment.id,
    overallScore,
    summary,
    risks: allRisks,
    topActions,
    createdAt: assessment.created_at,
  };

  return NextResponse.json(result);
}