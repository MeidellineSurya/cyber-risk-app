import { RiskItem } from "@/types";

const RISK_KNOWLEDGE_BASE: Record<string, { risk: string; likelihood: number; impact: number; exposure: number }[]> = {
  AWS: [
    { risk: "Misconfigured S3 bucket exposing sensitive data", likelihood: 4, impact: 5, exposure: 5 },
    { risk: "IAM privilege escalation via overly permissive roles", likelihood: 3, impact: 5, exposure: 4 },
    { risk: "Publicly exposed EC2 instance", likelihood: 3, impact: 4, exposure: 4 },
  ],
  MongoDB: [
    { risk: "Open database with no authentication enabled", likelihood: 3, impact: 5, exposure: 5 },
    { risk: "Unencrypted data at rest", likelihood: 4, impact: 4, exposure: 3 },
  ],
  React: [
    { risk: "Cross-site scripting (XSS) via unsanitised inputs", likelihood: 3, impact: 3, exposure: 4 },
    { risk: "Sensitive data exposed in client-side state", likelihood: 3, impact: 4, exposure: 3 },
  ],
  Node: [
    { risk: "Prototype pollution via unvalidated user input", likelihood: 3, impact: 4, exposure: 3 },
    { risk: "Dependency vulnerability in npm packages", likelihood: 4, impact: 3, exposure: 4 },
  ],
  "Node.js": [
    { risk: "Prototype pollution via unvalidated user input", likelihood: 3, impact: 4, exposure: 3 },
    { risk: "Dependency vulnerability in npm packages", likelihood: 4, impact: 3, exposure: 4 },
  ],
  Stripe: [
    { risk: "API key leakage via client-side code or logs", likelihood: 3, impact: 5, exposure: 4 },
    { risk: "Webhook signature not verified", likelihood: 3, impact: 4, exposure: 3 },
  ],
  PostgreSQL: [
    { risk: "SQL injection via unsanitised queries", likelihood: 3, impact: 5, exposure: 4 },
    { risk: "Database port publicly accessible", likelihood: 2, impact: 5, exposure: 3 },
  ],
  Firebase: [
    { risk: "Firestore rules misconfigured — public read/write", likelihood: 4, impact: 5, exposure: 5 },
    { risk: "Firebase API keys exposed in frontend bundle", likelihood: 4, impact: 3, exposure: 5 },
  ],
  Docker: [
    { risk: "Container running as root user", likelihood: 4, impact: 4, exposure: 3 },
    { risk: "Exposed Docker daemon socket", likelihood: 2, impact: 5, exposure: 3 },
  ],
  Kubernetes: [
    { risk: "RBAC misconfiguration granting excessive permissions", likelihood: 3, impact: 5, exposure: 4 },
    { risk: "Exposed Kubernetes dashboard", likelihood: 2, impact: 5, exposure: 3 },
  ],
  Next: [
    { risk: "Server-side environment variables leaked to client bundle", likelihood: 3, impact: 4, exposure: 4 },
  ],
  "Next.js": [
    { risk: "Server-side environment variables leaked to client bundle", likelihood: 3, impact: 4, exposure: 4 },
  ],
  Vercel: [
    { risk: "Environment variables misconfigured in preview deployments", likelihood: 3, impact: 4, exposure: 3 },
  ],
  Redis: [
    { risk: "Redis instance exposed without authentication", likelihood: 3, impact: 4, exposure: 4 },
    { risk: "Sensitive session data stored unencrypted", likelihood: 3, impact: 4, exposure: 3 },
  ],
  GraphQL: [
    { risk: "Introspection enabled in production — schema exposed", likelihood: 4, impact: 3, exposure: 5 },
    { risk: "Deeply nested query causing DoS (query depth attack)", likelihood: 3, impact: 4, exposure: 3 },
  ],
};

function getSeverity(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

export function mapStackToRisks(stack: string[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const seen = new Set<string>();

  for (const tech of stack) {
    const normalised = tech.trim();
    const entries = RISK_KNOWLEDGE_BASE[normalised] ?? [];

    for (const entry of entries) {
      if (seen.has(entry.risk)) continue;
      seen.add(entry.risk);

      const score = entry.likelihood * entry.impact * entry.exposure;
      risks.push({
        id: crypto.randomUUID(),
        risk: entry.risk,
        source: normalised,
        likelihood: entry.likelihood,
        impact: entry.impact,
        exposure: entry.exposure,
        score,
        severity: getSeverity(score),
      });
    }
  }

  return risks.sort((a, b) => b.score - a.score);
}