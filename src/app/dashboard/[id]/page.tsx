"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssessmentResult, RiskItem, Severity } from "@/types";
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";

const SEVERITY_CONFIG: Record<Severity, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  critical: { label: "Critical", color: "text-red-600", bg: "bg-red-50 border-red-200", icon: <ShieldAlert size={14} /> },
  high:     { label: "High",     color: "text-orange-500", bg: "bg-orange-50 border-orange-200", icon: <AlertTriangle size={14} /> },
  medium:   { label: "Medium",   color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200", icon: <Info size={14} /> },
  low:      { label: "Low",      color: "text-green-600",  bg: "bg-green-50 border-green-200",  icon: <ShieldCheck size={14} /> },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#dc2626" : score >= 60 ? "#f97316" : score >= 30 ? "#ca8a04" : "#16a34a";

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="600" fill={color}>{score}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill="#6b7280">/100</text>
      </svg>
    </div>
  );
}

function RiskCard({ risk }: { risk: RiskItem }) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[risk.severity];

  return (
    <div className={`rounded-lg border p-4 ${cfg.bg} transition-all`}>
      <div
        className="flex items-start justify-between cursor-pointer gap-3"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className={`mt-0.5 shrink-0 ${cfg.color}`}>{cfg.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug">{risk.risk}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{risk.source} · score {risk.score}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-xs ${cfg.color} border-current`}>
            {cfg.label}
          </Badge>
          {open ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>

      {open && (risk.description || risk.mitigation) && (
        <div className="mt-4 space-y-3 border-t border-black/10 pt-3">
          {risk.description && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">What it is</p>
              <p className="text-sm">{risk.description}</p>
            </div>
          )}
          {risk.businessImpact && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Business impact</p>
              <p className="text-sm">{risk.businessImpact}</p>
            </div>
          )}
          {risk.mitigation && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">How to fix it</p>
              <p className="text-sm">{risk.mitigation}</p>
            </div>
          )}
          <div className="flex gap-4 pt-1">
            {[["Likelihood", risk.likelihood], ["Impact", risk.impact], ["Exposure", risk.exposure]].map(([label, val]) => (
              <div key={label as string} className="text-center">
                <p className="text-lg font-semibold">{val}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`assessment-${id}`);
    if (stored) setResult(JSON.parse(stored));
  }, [id]);

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading assessment...</p>
      </main>
    );
  }

  const counts = result.risks.reduce(
    (acc, r) => { acc[r.severity] = (acc[r.severity] ?? 0) + 1; return acc; },
    {} as Record<Severity, number>
  );

  return (
    <main className="min-h-screen bg-background px-6 py-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-1">Risk Assessment</h1>
        <p className="text-muted-foreground text-sm">
          {new Date(result.createdAt).toLocaleDateString("en-AU", { dateStyle: "long" })}
        </p>
      </div>

      {/* Score + summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center gap-2">
            <ScoreRing score={result.overallScore} />
            <p className="text-sm text-center text-muted-foreground max-w-[200px]">{result.summary}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Risk breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(["critical", "high", "medium", "low"] as Severity[]).map((s) => {
              const cfg = SEVERITY_CONFIG[s];
              const count = counts[s] ?? 0;
              return (
                <div key={s} className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 text-sm ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </div>
                  <span className="text-sm font-medium">{count} risk{count !== 1 ? "s" : ""}</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Top actions */}
      {result.topActions.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Top actions</h2>
          <div className="space-y-2">
            {result.topActions.map((action, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted text-sm">
                <span className="font-semibold shrink-0 text-muted-foreground">{i + 1}.</span>
                <p>{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk list */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          All risks <span className="text-muted-foreground font-normal text-sm">({result.risks.length})</span>
        </h2>
        <div className="space-y-3">
          {result.risks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </div>
      </div>

      {/* Re-run */}
      <div className="mt-12 text-center">
        <a href="/assess" className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
          Run another assessment
        </a>
      </div>
    </main>
  );
}