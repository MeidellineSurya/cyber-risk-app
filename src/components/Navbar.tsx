import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <ShieldAlert size={20} className="text-red-500" />
          CyberRisk AI
        </Link>
        <Link href="/assess">
          <Button size="sm">Run assessment</Button>
        </Link>
      </div>
    </nav>
  );
}