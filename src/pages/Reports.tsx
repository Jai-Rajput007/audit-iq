import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComplianceGauge } from "@/components/ComplianceGauge";
import { RiskBadge } from "@/components/RiskBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye, Download, Share2, Trash2, GitCompare, LayoutGrid, List as ListIcon } from "lucide-react";
import { AuditType, RiskLevel } from "@/lib/mockData";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const auditTypes: AuditType[] = ["Financial", "Compliance", "IT Security", "Operational", "ESG", "Internal Audit", "Vendor", "Quality"];

export default function Reports() {
  const { reports, deleteReport } = useAppStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "cards">("table");

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || r.type === typeFilter;
      const matchesRisk = riskFilter === "all" || r.risk === riskFilter;
      return matchesSearch && matchesType && matchesRisk;
    });
  }, [reports, search, typeFilter, riskFilter]);

  const handleDelete = (id: string) => {
    deleteReport(id);
    toast.success("Report deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Reports</h1>
        <p className="text-muted-foreground mt-1">{reports.length} total · {filtered.length} shown</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by report name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="rounded-xl lg:w-48"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All types</SelectItem>
            {auditTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="rounded-xl lg:w-40"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All risks</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="hidden lg:flex border border-border rounded-xl p-0.5">
          <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" onClick={() => setView("table")} className="rounded-lg h-9 w-9">
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button variant={view === "cards" ? "secondary" : "ghost"} size="icon" onClick={() => setView("cards")} className="rounded-lg h-9 w-9">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile: cards always */}
      <div className="lg:hidden grid gap-3">
        {filtered.map((r, idx) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Link to={`/report/${r.id}`} className="block rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="rounded-full text-xs">{r.type}</Badge>
                <RiskBadge level={r.risk} />
              </div>
              <h3 className="font-semibold text-sm mb-3 line-clamp-2">{r.title}</h3>
              <div className="flex items-center justify-between">
                <ComplianceGauge value={r.compliance} size={56} thickness={5} />
                <div className="text-xs text-muted-foreground text-right">
                  <div>{r.uploadedAt}</div>
                  <div>{r.fileSize}</div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Desktop: table or cards */}
      <div className="hidden lg:block">
        {view === "table" ? (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Report</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r, idx) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <Link to={`/report/${r.id}`} className="font-medium hover:text-accent">
                        {r.title}
                      </Link>
                      <div className="text-xs text-muted-foreground">{r.fileSize} · {r.fileType}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="rounded-full">{r.type}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.uploadedAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${r.compliance}%` }} />
                        </div>
                        <span className="text-sm font-medium">{r.compliance}%</span>
                      </div>
                    </TableCell>
                    <TableCell><RiskBadge level={r.risk} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-full bg-success/10 text-success border-success/30">
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-lg">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem asChild><Link to={`/report/${r.id}`}><Eye className="h-4 w-4 mr-2" /> View</Link></DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Export ready")}><Download className="h-4 w-4 mr-2" /> Export</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.info("Compare mode")}><GitCompare className="h-4 w-4 mr-2" /> Compare</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Share link copied")}><Share2 className="h-4 w-4 mr-2" /> Share</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(r.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <Link to={`/report/${r.id}`} key={r.id} className="rounded-2xl border border-border bg-card p-5 hover:border-accent/40 transition-all">
                <div className="flex justify-between mb-3">
                  <Badge variant="outline" className="rounded-full">{r.type}</Badge>
                  <RiskBadge level={r.risk} />
                </div>
                <h3 className="font-semibold mb-4 line-clamp-2 min-h-[3rem]">{r.title}</h3>
                <div className="flex items-center justify-between">
                  <ComplianceGauge value={r.compliance} size={70} thickness={6} />
                  <div className="text-xs text-muted-foreground text-right">
                    <div>{r.uploadedAt}</div>
                    <div>{r.fileSize}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground">No reports match your filters.</p>
        </div>
      )}
    </div>
  );
}
