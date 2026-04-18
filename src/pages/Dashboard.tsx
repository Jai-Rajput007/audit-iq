import { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import gsap from "gsap";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { CountUp } from "@/components/CountUp";
import { ComplianceGauge } from "@/components/ComplianceGauge";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { FileText, AlertTriangle, CheckCircle2, Clock, Plus, ArrowUpRight, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user, reports } = useAppStore();
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll(".stat-card");
    gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: "power3.out" });
  }, []);

  const totalReports = reports.length;
  const avgCompliance = Math.round(reports.reduce((s, r) => s + r.compliance, 0) / Math.max(reports.length, 1));
  const highRisks = reports.filter((r) => r.risk === "high").length;
  const today = reports.filter((r) => r.uploadedAt >= new Date().toISOString().slice(0, 10)).length;

  const stats = [
    { label: "Total Reports", value: totalReports, icon: FileText, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg Compliance", value: avgCompliance, suffix: "%", icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
    { label: "High Risks Flagged", value: highRisks, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { label: "Processed Today", value: today, icon: Clock, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/40 p-6 sm:p-8"
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-accent mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            AI insights ready
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, {user?.name?.split(" ")[0] ?? "Auditor"}
          </h1>
          <p className="text-muted-foreground">
            You've processed <span className="text-foreground font-semibold">{totalReports} reports</span> this month. {highRisks} require attention.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Button onClick={() => navigate("/upload")} className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4 mr-1.5" /> Upload Report
            </Button>
            <Button variant="outline" onClick={() => navigate("/reports")} className="rounded-xl">
              View all reports <ArrowUpRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div ref={cardsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card group rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-all hover:shadow-[var(--shadow-elegant)]">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${s.bg} ${s.color} mb-4`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                <CountUp value={s.value} suffix={s.suffix ?? ""} />
              </div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent reports */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Reports</h2>
          <Link to="/reports" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0 snap-x">
          {reports.slice(0, 6).map((r) => (
            <Link
              to={`/report/${r.id}`}
              key={r.id}
              className="snap-start min-w-[280px] lg:min-w-0 rounded-2xl border border-border bg-card p-5 hover:border-accent/40 hover:shadow-[var(--shadow-elegant)] transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-xs text-muted-foreground">{r.type}</div>
                <RiskBadge level={r.risk} />
              </div>
              <h3 className="font-semibold text-sm mb-4 line-clamp-2 min-h-[2.5rem] group-hover:text-accent transition-colors">{r.title}</h3>
              <div className="flex items-center justify-between">
                <ComplianceGauge value={r.compliance} size={64} thickness={6} />
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">{r.uploadedAt}</div>
                  <Button variant="ghost" size="sm" className="mt-2 h-8 text-accent hover:text-accent">
                    View <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Floating upload button */}
      <button
        onClick={() => navigate("/upload")}
        className="md:hidden fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-[var(--shadow-glow)] animate-pulse-glow flex items-center justify-center"
        aria-label="Upload report"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
