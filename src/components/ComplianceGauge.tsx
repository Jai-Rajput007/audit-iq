import { cn } from "@/lib/utils";

interface ComplianceGaugeProps {
  value: number;
  size?: number;
  thickness?: number;
  className?: string;
  showLabel?: boolean;
}

export const ComplianceGauge = ({
  value,
  size = 80,
  thickness = 8,
  className,
  showLabel = true,
}: ComplianceGaugeProps) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color =
    value >= 90 ? "hsl(var(--success))" : value >= 75 ? "hsl(var(--accent))" : value >= 60 ? "hsl(var(--warning))" : "hsl(var(--destructive))";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={thickness} stroke="hsl(var(--muted))" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
          stroke={color}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-base font-bold leading-none">{value}%</span>
        </div>
      )}
    </div>
  );
};
