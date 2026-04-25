import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, ArrowDown, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Severity } from "@/types";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "text-red-600",
  high: "text-orange-500",
  medium: "text-yellow-600",
  low: "text-green-600",
};

const SEVERITY_BG: Record<Severity, string> = {
  critical: "bg-red-50 border-red-200",
  high: "bg-orange-50 border-orange-200",
  medium: "bg-yellow-50 border-yellow-200",
  low: "bg-green-50 border-green-200",
};

const BEFORE_RISKS = [
  { risk: "Misconfigured S3 bucket exposing sensitive data", source: "AWS", score: 100, severity: "critical" as Severity },
  { risk: "Open database with no authentication enabled", source: "MongoDB", score: 75, severity: "high" as Severity },
  { risk: "IAM privilege escalation via overly permissive roles", source: "AWS", score: 60, severity: "high" as Severity },
  { risk: "API key leakage via client-side code or logs", source: "Stripe", score: 60, severity: "high" as Severity },
  { risk: "Publicly exposed EC2 instance", source: "AWS", score: 48, severity: "medium" as Severity },
  { risk: "Unencrypted data at rest", source: "MongoDB", score: 48, severity: "medium" as Severity },
];

const AFTER_RISKS = [
  { risk: "Webhook signature not verified", source: "Stripe", score: 36, severity: "medium" as Severity },
  { risk: "Cross-site scripting (XSS) via unsanitised inputs", source: "React", score: 36, severity: "medium" as Severity },
  { risk: "Sensitive data exposed in client-side state", source: "React", score: 36, severity: "medium" as Severity },
  { risk: "Dependency vulnerability in npm packages", source: "Node.js", score: 24, severity: "low" as Severity },
  { risk: "Prototype pollution via unvalidated user input", source: "Node.js", score: 18, severity: "low" as Severity },
];

const FIXES_APPLIED = [
  {
    icon: "🪣",
    title: "S3 buckets locked down",
    detail: "Applied least-privilege bucket policies, disabled public access, enabled versioning and server-side encryption.",
  },
  {
    icon: "🔐",
    title: "MongoDB authentication enabled",
    detail: "Enabled SCRAM authentication, restricted connections to trusted IPs only, encrypted data at rest with AES-256.",
  },
  {
    icon: "🛡️",
    title: "IAM roles scoped to least privilege",
    detail: "Audited all IAM roles, removed wildcard permissions, enforced MFA for all admin accounts.",
  },
  {
    icon: "🔑",
    title: "Stripe API keys moved to server-side",
    detail: "Removed all API keys from client bundles, rotated exposed keys, moved to server-side environment variables.",
  },
  {
    icon: "🖥️",
    title: "EC2 security groups hardened",
    detail: "Restricted inbound rules to necessary ports only, placed instances behind a load balancer, enabled VPC flow logs.",
  },
];

function ScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#dc2626" : score >= 60 ? "#f97316" : score >= 30 ? "#ca8a04" : "#16a34a";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="600" fill={color}>{score}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="11" fill="#6b7280">/100</text>
      </svg>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function RiskRow({ risk, source, score, severity }: { risk: string; source: string; score: number; severity: Severity }) {
  return (
    <div className={`rounded-lg border px-4 py-3 flex items-center justify-between gap-3 ${SEVERITY_BG[severity]}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-snug">{risk}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{source} · score {score}</p>
      </div>
      <Badge variant="outline" className={`text-xs shrink-0 ${SEVERITY_COLORS[severity]} border-current capitalize`}>
        {severity}
      </Badge>
    </div>
  );
}

export default function CaseStudyPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-2">
        <Badge variant="secondary" className="mb-4">Case Study</Badge>
        <h1 className="text-3xl font-semibold mb-2">PayFlow Fintech</h1>
        <p className="text-muted-foreground">
          A payments startup processing $2M/month discovered 6 critical and high vulnerabilities
          across their AWS + MongoDB + Stripe stack. Here's how CyberRisk AI identified and
          helped them fix it in two weeks.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 my-10">
        {[
          { label: "Risk score reduction", value: "58%" },
          { label: "Critical risks resolved", value: "1 → 0" },
          { label: "High risks resolved", value: "3 → 0" },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Before / After scores */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-6">Overall risk score</h2>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Before</p>
            <ScoreRing score={82} label="High risk posture" />
          </div>
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ArrowDown size={24} />
            <span className="text-xs">2 weeks</span>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">After</p>
            <ScoreRing score={35} label="Moderate risk posture" />
          </div>
        </div>
      </div>

      {/* Fixes applied */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Fixes applied</h2>
        <div className="space-y-3">
          {FIXES_APPLIED.map((fix) => (
            <div key={fix.title} className="flex gap-4 p-4 rounded-lg border bg-muted/40">
              <span className="text-xl shrink-0">{fix.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={14} className="text-green-600" />
                  <p className="text-sm font-medium">{fix.title}</p>
                </div>
                <p className="text-sm text-muted-foreground">{fix.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Before risks */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-1">Before — risks identified</h2>
        <p className="text-sm text-muted-foreground mb-4">6 risks including 1 critical, 3 high severity</p>
        <div className="space-y-2">
          {BEFORE_RISKS.map((r) => <RiskRow key={r.risk} {...r} />)}
        </div>
      </div>

      {/* After risks */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-1">After — remaining risks</h2>
        <p className="text-sm text-muted-foreground mb-4">5 residual risks, all medium or low severity</p>
        <div className="space-y-2">
          {AFTER_RISKS.map((r) => <RiskRow key={r.risk} {...r} />)}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl border bg-muted/40 p-8 text-center">
        <ShieldAlert size={28} className="text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">See your risk score</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Run a free assessment on your stack. Takes 30 seconds.
        </p>
        <Link href="/assess">
          <Button size="lg">Run your assessment →</Button>
        </Link>
      </div>

    </main>
  );
}