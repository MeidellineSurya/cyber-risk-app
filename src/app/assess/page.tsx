"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const COMPANY_TYPES = ["fintech", "healthtech", "saas", "ecommerce", "startup", "enterprise"];

const SUGGESTED_STACK = ["AWS", "React", "Node.js", "MongoDB", "PostgreSQL", "Stripe",
  "Firebase", "Docker", "Kubernetes", "Next.js", "Redis", "GraphQL", "Vercel"];

export default function AssessPage() {
  const router = useRouter();
  const [companyType, setCompanyType] = useState("");
  const [stack, setStack] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const addTech = (tech: string) => {
    const t = tech.trim();
    if (t && !stack.includes(t)) setStack([...stack, t]);
    setInput("");
  };

  const removeTech = (tech: string) => setStack(stack.filter((t) => t !== tech));

  const handleSubmit = async () => {
    if (!companyType || stack.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyType, stack, notes }),
      });
      const data = await res.json();
      // Store result temporarily in sessionStorage
      sessionStorage.setItem(`assessment-${data.id}`, JSON.stringify(data));
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-16 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-2">Run your assessment</h1>
      <p className="text-muted-foreground mb-10">Tell us about your stack and we'll map your risks.</p>

      {/* Company type */}
      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block">Company type</label>
        <div className="flex flex-wrap gap-2">
          {COMPANY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setCompanyType(type)}
              className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                companyType === type
                  ? "bg-foreground text-background border-foreground"
                  : "border-border hover:bg-muted"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Stack input */}
      <div className="mb-8">
        <label className="text-sm font-medium mb-2 block">Tech stack</label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Type a technology and press Enter"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTech(input)}
          />
          <Button variant="outline" onClick={() => addTech(input)}>Add</Button>
        </div>
        {/* Selected stack */}
        {stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {stack.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 pr-1">
                {t}
                <button onClick={() => removeTech(t)} className="ml-1 hover:text-destructive">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        {/* Suggestions */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_STACK.filter((s) => !stack.includes(s)).map((s) => (
            <button
              key={s}
              onClick={() => addTech(s)}
              className="px-3 py-1 text-xs rounded-full border border-dashed border-border hover:bg-muted transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-10">
        <label className="text-sm font-medium mb-2 block">Notes <span className="text-muted-foreground">(optional)</span></label>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          placeholder="e.g. handles payments and user PII, deployed on AWS us-east-1"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!companyType || stack.length === 0 || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Analysing your stack..." : "Run risk assessment →"}
      </Button>
    </main>
  );
}