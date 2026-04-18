import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComplianceGauge } from "@/components/ComplianceGauge";
import { RiskBadge } from "@/components/RiskBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid,
} from "recharts";
import {
  ChevronRight, Download, GitCompare, Trash2, Send, Sparkles, FileText, AlertTriangle, Lightbulb, BarChart3, ScrollText, MessageSquare,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { mockChatStarters, RiskLevel } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const SEV_COLORS: Record<string, string> = {
  High: "hsl(var(--destructive))",
  Medium: "hsl(var(--warning))",
  Low: "hsl(var(--success))",
};
const PIE_COLORS = ["hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--success))"];

export default function ReportViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, deleteReport } = useAppStore();
  const report = reports.find((r) => r.id === id);
  const [exportOpen, setExportOpen] = useState(false);

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Report not found.</p>
        <Button asChild className="mt-4 rounded-xl"><Link to="/reports">Back to reports</Link></Button>
      </div>
    );
  }

  const handleDelete = () => {
    deleteReport(report.id);
    toast.success("Report deleted");
    navigate("/reports");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/reports" className="hover:text-foreground">Reports</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground truncate">{report.title}</span>
      </nav>

      {/* Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-border bg-gradient-to-br from-card to-secondary/30 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <ComplianceGauge value={report.compliance} size={100} thickness={10} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="rounded-full">{report.type}</Badge>
              <RiskBadge level={report.risk} />
              <Badge variant="outline" className="rounded-full bg-success/10 text-success border-success/30">{report.status}</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{report.title}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>Uploaded {report.uploadedAt}</span>
              <span>{report.fileSize}</span>
              <span>{report.fileType}</span>
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground flex-1 lg:flex-none">
                  <Download className="h-4 w-4 mr-1.5" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                <DropdownMenuItem onClick={() => setExportOpen(true)}>Preview & download PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Word export ready")}>Word (.docx)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("CSV export ready")}>CSV</DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success("Share link copied")}>Share link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="rounded-xl" onClick={() => toast.info("Compare mode")}>
              <GitCompare className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="rounded-xl text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete report?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList className="w-full justify-start overflow-x-auto rounded-xl bg-muted/50 p-1 h-auto flex-nowrap">
          {[
            { v: "summary", l: "Executive Summary", i: FileText },
            { v: "findings", l: "Key Findings", i: AlertTriangle },
            { v: "risks", l: "Risks & Issues", i: AlertTriangle },
            { v: "recs", l: "Recommendations", i: Lightbulb },
            { v: "charts", l: "Charts", i: BarChart3 },
            { v: "original", l: "Original", i: ScrollText },
            { v: "chat", l: "AI Chat", i: MessageSquare },
          ].map((t) => (
            <TabsTrigger key={t.v} value={t.v} className="rounded-lg gap-1.5 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <t.i className="h-3.5 w-3.5" /> {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <SummaryTab report={report} />
        </TabsContent>
        <TabsContent value="findings" className="mt-6">
          <FindingsTab findings={report.findings} />
        </TabsContent>
        <TabsContent value="risks" className="mt-6">
          <RisksTab findings={report.findings} />
        </TabsContent>
        <TabsContent value="recs" className="mt-6">
          <RecsTab recs={report.recommendations} />
        </TabsContent>
        <TabsContent value="charts" className="mt-6">
          <ChartsTab report={report} />
        </TabsContent>
        <TabsContent value="original" className="mt-6">
          <OriginalTab title={report.title} />
        </TabsContent>
        <TabsContent value="chat" className="mt-6">
          <ChatTab reportTitle={report.title} />
        </TabsContent>
      </Tabs>

      {/* Export modal */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="rounded-2xl max-w-2xl">
          <DialogHeader><DialogTitle>Export preview</DialogTitle></DialogHeader>
          <div className="rounded-xl border border-border bg-muted/30 p-6 max-h-[60vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-2">{report.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">Compliance: {report.compliance}% · Risk: {report.risk}</p>
            <p className="text-sm leading-relaxed">{report.summary.replace(/\*\*/g, "")}</p>
          </div>
          <Button onClick={() => { toast.success("PDF downloaded"); setExportOpen(false); }} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">
            <Download className="h-4 w-4 mr-2" /> Download PDF
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SummaryTab = ({ report }: { report: any }) => (
  <div className="grid lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-xs text-accent mb-3">
        <Sparkles className="h-3.5 w-3.5" /> AI-generated summary
      </div>
      <div
        className="prose prose-sm max-w-none text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{
          __html: report.summary.replace(/\*\*(.+?)\*\*/g, '<strong class="text-accent">$1</strong>'),
        }}
      />
    </div>
    <div className="rounded-2xl border border-border bg-card p-6 flex flex-col items-center justify-center">
      <div className="text-xs text-muted-foreground mb-3">Overall compliance</div>
      <ComplianceGauge value={report.compliance} size={160} thickness={14} />
      <div className="text-xs text-muted-foreground mt-3">across {report.findings.length + 5} controls</div>
    </div>
  </div>
);

const FindingsTab = ({ findings }: { findings: any[] }) => (
  <div className="rounded-2xl border border-border bg-card p-2">
    <Accordion type="single" collapsible>
      {findings.map((f) => (
        <AccordionItem key={f.id} value={f.id} className="border-border">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <span className={cn("h-2.5 w-2.5 rounded-full",
                f.severity === "high" ? "bg-destructive" : f.severity === "medium" ? "bg-warning" : "bg-success")} />
              <span className="font-medium">{f.title}</span>
              <Badge variant="outline" className="rounded-full text-xs ml-2">{f.category}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-muted-foreground mb-2">{f.description}</p>
            <div className="rounded-lg bg-accent/5 border border-accent/20 p-3 mt-2">
              <div className="text-xs font-semibold text-accent mb-1">Recommendation</div>
              <p className="text-sm">{f.recommendation}</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
);

const RisksTab = ({ findings }: { findings: any[] }) => {
  const [filter, setFilter] = useState<RiskLevel | "all">("all");
  const filtered = findings.filter((f) => filter === "all" || f.severity === filter);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {["all", "high", "medium", "low"].map((f) => (
          <Button key={f} variant={filter === f ? "secondary" : "outline"} size="sm" onClick={() => setFilter(f as any)} className="rounded-full capitalize">
            {f}
          </Button>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Issue</TableHead><TableHead>Category</TableHead><TableHead>Severity</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((f) => (
              <TableRow key={f.id} className="border-border">
                <TableCell><div className="font-medium">{f.title}</div><div className="text-xs text-muted-foreground">{f.description}</div></TableCell>
                <TableCell><Badge variant="outline" className="rounded-full">{f.category}</Badge></TableCell>
                <TableCell><RiskBadge level={f.severity} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const RecsTab = ({ recs }: { recs: any[] }) => (
  <div className="grid md:grid-cols-2 gap-4">
    {recs.map((r, idx) => (
      <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
        className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-accent/10 text-accent font-bold flex items-center justify-center text-sm">{idx + 1}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{r.title}</h3>
              <Badge variant="outline" className={cn("rounded-full text-xs",
                r.priority === "P1" ? "bg-destructive/10 text-destructive border-destructive/30" :
                r.priority === "P2" ? "bg-warning/10 text-warning border-warning/30" :
                "bg-muted text-muted-foreground")}>
                {r.priority}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Owner: <span className="text-foreground">{r.owner}</span></span>
              <span>Due: <span className="text-foreground">{r.due}</span></span>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const ChartsTab = ({ report }: { report: any }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current.querySelectorAll(".chart-card"),
      { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5 });
  }, []);

  return (
    <div ref={ref} className="grid lg:grid-cols-2 gap-4">
      <div className="chart-card rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Risk Heatmap</h3>
        <div className="grid grid-cols-4 gap-2">
          {report.heatmap.map((h: any) => {
            const score = h.impact * h.likelihood;
            const color = score >= 6 ? "bg-destructive/30 border-destructive/50" :
                          score >= 3 ? "bg-warning/30 border-warning/50" :
                          "bg-success/20 border-success/40";
            return (
              <div key={h.area} className={cn("rounded-xl border p-4 text-center", color)}>
                <div className="text-xs text-muted-foreground">{h.area}</div>
                <div className="text-lg font-bold mt-1">{score}</div>
                <div className="text-[10px] text-muted-foreground">I:{h.impact} · L:{h.likelihood}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-card rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Findings by Category</h3>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={report.categories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
              {report.categories.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Severity Distribution</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={report.severity}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {report.severity.map((s: any, i: number) => <Cell key={i} fill={SEV_COLORS[s.name]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card rounded-2xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Compliance Trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={report.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[60, 100]} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            <Line type="monotone" dataKey="compliance" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--accent))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const OriginalTab = ({ title }: { title: string }) => (
  <div className="rounded-2xl border border-border bg-card p-8 max-w-3xl mx-auto">
    <div className="bg-white text-slate-900 rounded-xl shadow-inner p-8 sm:p-12 min-h-[600px] font-serif">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-xs text-slate-500 mb-6">Confidential — Internal use only</p>
      <p className="leading-relaxed mb-4">
        This audit report presents the findings from a comprehensive review of the engagement scope,
        covering operational controls, financial reporting, and compliance with applicable standards.
      </p>
      <p className="bg-yellow-200 px-1 leading-relaxed mb-4 cursor-pointer hover:bg-yellow-300 transition-colors">
        Section 3.1 — Material weakness identified in revenue recognition controls.
      </p>
      <p className="leading-relaxed mb-4">
        Our procedures included examination of supporting documentation, inquiries of management,
        and analytical procedures designed to identify unusual relationships or trends.
      </p>
      <p className="bg-yellow-200 px-1 leading-relaxed mb-4 cursor-pointer hover:bg-yellow-300 transition-colors">
        Section 5.4 — Three vendors lack signed Data Processing Agreements.
      </p>
      <p className="leading-relaxed">
        Management's response and remediation plans are detailed in Appendix B. We will follow up
        on the status of these items in our subsequent engagement.
      </p>
    </div>
  </div>
);

const ChatTab = ({ reportTitle }: { reportTitle: string }) => {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: `Hi! I've fully analyzed "${reportTitle}". Ask me anything about the findings, risks, or recommendations.` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, {
        role: "ai",
        content: "Based on the report, the top concerns are concentration risk in third-party SaaS providers and gaps in DSAR response times. I'd prioritize the P1 recommendations to mitigate near-term exposure.",
      }]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-border bg-card flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className={m.role === "ai" ? "bg-accent/15 text-accent" : "bg-muted"}>
                {m.role === "ai" ? <Sparkles className="h-4 w-4" /> : "Y"}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
              m.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted"
            )}>
              {m.content}
            </div>
          </motion.div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8"><AvatarFallback className="bg-accent/15 text-accent"><Sparkles className="h-4 w-4" /></AvatarFallback></Avatar>
            <div className="bg-muted rounded-2xl px-4 py-3 flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-border p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {mockChatStarters.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-xs rounded-full border border-border bg-background px-3 py-1.5 hover:border-accent hover:text-accent transition-colors">
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about this report..." className="rounded-xl" />
          <Button type="submit" size="icon" className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
