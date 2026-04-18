import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-base", orb: "h-2 w-2" },
    md: { icon: "h-8 w-8", text: "text-lg", orb: "h-2.5 w-2.5" },
    lg: { icon: "h-10 w-10", text: "text-2xl", orb: "h-3 w-3" },
  };
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <Shield className={cn(s.icon, "text-foreground")} strokeWidth={2.2} />
        <span
          className={cn(
            s.orb,
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent shadow-[0_0_12px_hsl(var(--accent))] animate-pulse"
          )}
        />
      </div>
      {showText && (
        <span className={cn(s.text, "font-bold tracking-tight")}>
          AuditSummar <span className="gradient-text">AI</span>
        </span>
      )}
    </div>
  );
};
