import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export const RiskBadge = ({ level, className }: { level: RiskLevel; className?: string }) => {
  const styles = {
    high: "bg-destructive/15 text-destructive border-destructive/30",
    medium: "bg-warning/15 text-warning border-warning/30",
    low: "bg-success/15 text-success border-success/30",
  };
  const label = { high: "High Risk", medium: "Medium", low: "Low Risk" };
  return (
    <Badge variant="outline" className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium border", styles[level], className)}>
      <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full",
        level === "high" ? "bg-destructive" : level === "medium" ? "bg-warning" : "bg-success")} />
      {label[level]}
    </Badge>
  );
};
