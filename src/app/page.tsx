import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert size={32} className="text-red-500" />
        <span className="text-xl font-semibold tracking-tight">CyberRisk AI</span>
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold max-w-xl leading-tight mb-4">
        AI Cyber Risk Assessment for Startups
      </h1>

      <p className="text-muted-foreground text-lg max-w-md mb-10">
        Tell us your tech stack. We'll map your vulnerabilities, score your risk, and give you a prioritised fix list — in seconds.
      </p>

      <Link href="/assess">
        <Button size="lg" className="px-8">
          Run your assessment →
        </Button>
      </Link>

      <p className="text-xs text-muted-foreground mt-6">
        No sign-up required · Powered by Groq + Llama 3
      </p>
    </main>
  );
}