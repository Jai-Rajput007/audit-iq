// Mock data for AuditSummar AI

export type RiskLevel = "high" | "medium" | "low";
export type AuditType =
  | "Financial"
  | "Compliance"
  | "IT Security"
  | "Operational"
  | "ESG"
  | "Internal Audit"
  | "Vendor"
  | "Quality";

export interface Finding {
  id: string;
  title: string;
  severity: RiskLevel;
  category: string;
  description: string;
  recommendation: string;
}

export interface Recommendation {
  id: string;
  title: string;
  priority: "P1" | "P2" | "P3";
  description: string;
  owner: string;
  due: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
}

export interface Report {
  id: string;
  title: string;
  type: AuditType;
  uploadedAt: string;
  fileSize: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "TXT";
  compliance: number;
  risk: RiskLevel;
  status: "Processed" | "Processing" | "Failed";
  summary: string;
  findings: Finding[];
  recommendations: Recommendation[];
  trend: { period: string; compliance: number }[];
  categories: { name: string; value: number }[];
  severity: { name: string; value: number }[];
  heatmap: { area: string; impact: number; likelihood: number }[];
}

const baseTrend = [
  { period: "Q1 23", compliance: 72 },
  { period: "Q2 23", compliance: 78 },
  { period: "Q3 23", compliance: 81 },
  { period: "Q4 23", compliance: 85 },
  { period: "Q1 24", compliance: 88 },
  { period: "Q2 24", compliance: 91 },
];

export const reports: Report[] = [
  {
    id: "rep-001",
    title: "Q2 2024 Financial Audit – NorthBay Holdings",
    type: "Financial",
    uploadedAt: "2024-06-14",
    fileSize: "2.4 MB",
    fileType: "PDF",
    compliance: 92,
    risk: "low",
    status: "Processed",
    summary:
      "The Q2 2024 financial audit of NorthBay Holdings identified strong overall financial controls with **92% compliance** across 47 control objectives. Three medium-severity findings relate to revenue recognition timing and segregation of duties in accounts payable. Cash management and reconciliation processes are exemplary.",
    findings: [
      { id: "f1", title: "Revenue recognition timing variance", severity: "medium", category: "Revenue", description: "Subscription revenue recognized 1-3 days early in 4% of sampled transactions.", recommendation: "Implement automated revenue cut-off controls in NetSuite." },
      { id: "f2", title: "Segregation of duties – AP", severity: "medium", category: "Controls", description: "Two staff members have both vendor creation and payment approval rights.", recommendation: "Restrict vendor master maintenance to procurement team only." },
      { id: "f3", title: "Manual journal entries lack secondary review", severity: "low", category: "Controls", description: "12% of manual JEs above $10k were not independently reviewed.", recommendation: "Configure mandatory reviewer workflow in ERP." },
    ],
    recommendations: [
      { id: "r1", title: "Automate revenue cut-off controls", priority: "P1", description: "Deploy NetSuite ARM module to enforce period close cutoffs.", owner: "Controller", due: "2024-08-30" },
      { id: "r2", title: "Restrict AP master data access", priority: "P2", description: "Update role-based permissions in ERP.", owner: "IT Security", due: "2024-09-15" },
    ],
    trend: baseTrend,
    categories: [
      { name: "Revenue", value: 1 }, { name: "Controls", value: 2 }, { name: "Reporting", value: 0 }, { name: "Tax", value: 0 },
    ],
    severity: [{ name: "High", value: 0 }, { name: "Medium", value: 2 }, { name: "Low", value: 1 }],
    heatmap: [
      { area: "Revenue", impact: 3, likelihood: 2 },
      { area: "AP", impact: 2, likelihood: 3 },
      { area: "Payroll", impact: 1, likelihood: 1 },
      { area: "Treasury", impact: 1, likelihood: 1 },
    ],
  },
  {
    id: "rep-002",
    title: "GDPR Compliance Review 2024",
    type: "Compliance",
    uploadedAt: "2024-06-02",
    fileSize: "3.1 MB",
    fileType: "PDF",
    compliance: 78,
    risk: "high",
    status: "Processed",
    summary: "GDPR compliance assessment surfaced **5 high-severity gaps** primarily around data subject access request (DSAR) response times and third-party data processor agreements. Privacy-by-design practices are strong in new product development but legacy systems lack adequate controls.",
    findings: [
      { id: "f1", title: "DSAR response exceeds 30 days", severity: "high", category: "Rights", description: "Average response time is 38 days vs. 30-day GDPR mandate.", recommendation: "Implement DSAR ticketing system with SLA tracking." },
      { id: "f2", title: "Missing DPAs with 7 vendors", severity: "high", category: "Vendor", description: "Seven third-party processors lack signed Data Processing Agreements.", recommendation: "Execute DPAs immediately and audit all vendor contracts." },
      { id: "f3", title: "Inadequate consent records", severity: "medium", category: "Consent", description: "Marketing consent timestamps not captured for legacy database.", recommendation: "Re-permission legacy contacts via opt-in campaign." },
    ],
    recommendations: [
      { id: "r1", title: "Deploy DSAR automation platform", priority: "P1", description: "Evaluate OneTrust or DataGrail.", owner: "DPO", due: "2024-07-30" },
      { id: "r2", title: "Vendor DPA remediation sprint", priority: "P1", description: "Legal team to execute outstanding DPAs.", owner: "Legal", due: "2024-07-15" },
    ],
    trend: [{ period: "2022", compliance: 65 }, { period: "2023", compliance: 71 }, { period: "2024", compliance: 78 }],
    categories: [{ name: "Rights", value: 2 }, { name: "Vendor", value: 3 }, { name: "Consent", value: 1 }, { name: "Security", value: 1 }],
    severity: [{ name: "High", value: 5 }, { name: "Medium", value: 3 }, { name: "Low", value: 2 }],
    heatmap: [
      { area: "DSAR", impact: 3, likelihood: 3 },
      { area: "Vendors", impact: 3, likelihood: 3 },
      { area: "Consent", impact: 2, likelihood: 2 },
      { area: "Breach", impact: 3, likelihood: 1 },
    ],
  },
  {
    id: "rep-003",
    title: "SOC 2 Type II – Cloud Infrastructure",
    type: "IT Security",
    uploadedAt: "2024-05-28",
    fileSize: "5.7 MB",
    fileType: "PDF",
    compliance: 94,
    risk: "low",
    status: "Processed",
    summary: "SOC 2 Type II audit covering security, availability, and confidentiality returned a **clean opinion** with only minor observations. MFA coverage at 99.2%, vulnerability remediation SLAs consistently met.",
    findings: [
      { id: "f1", title: "3 service accounts without MFA", severity: "low", category: "Access", description: "Legacy automation accounts lack MFA.", recommendation: "Migrate to workload identity federation." },
    ],
    recommendations: [
      { id: "r1", title: "Workload identity migration", priority: "P3", description: "Replace static credentials with OIDC.", owner: "Platform", due: "2024-12-01" },
    ],
    trend: baseTrend,
    categories: [{ name: "Access", value: 1 }, { name: "Encryption", value: 0 }, { name: "Logging", value: 0 }, { name: "Network", value: 0 }],
    severity: [{ name: "High", value: 0 }, { name: "Medium", value: 0 }, { name: "Low", value: 1 }],
    heatmap: [
      { area: "IAM", impact: 1, likelihood: 1 },
      { area: "Network", impact: 1, likelihood: 1 },
      { area: "Data", impact: 2, likelihood: 1 },
      { area: "Apps", impact: 1, likelihood: 1 },
    ],
  },
  {
    id: "rep-004",
    title: "Operational Efficiency Review – West Plant",
    type: "Operational",
    uploadedAt: "2024-05-19",
    fileSize: "1.8 MB",
    fileType: "DOCX",
    compliance: 84,
    risk: "medium",
    status: "Processed",
    summary: "Operational audit of the West Plant identified opportunities to reduce changeover time by an estimated **22%** and improve OEE from 71% to a target of 82%. Maintenance backlog is the primary risk.",
    findings: [
      { id: "f1", title: "Maintenance backlog growing", severity: "high", category: "Maintenance", description: "PM completion at 68% vs target 95%.", recommendation: "Add 2 maintenance technicians and prioritize critical assets." },
      { id: "f2", title: "Changeover SOPs outdated", severity: "medium", category: "Process", description: "SOPs last revised 2019.", recommendation: "Update SOPs and run SMED workshops." },
    ],
    recommendations: [
      { id: "r1", title: "PM staffing increase", priority: "P1", description: "Approve hiring 2 FTEs.", owner: "Plant Mgr", due: "2024-09-01" },
    ],
    trend: baseTrend,
    categories: [{ name: "Maintenance", value: 1 }, { name: "Process", value: 1 }, { name: "Safety", value: 0 }, { name: "Quality", value: 1 }],
    severity: [{ name: "High", value: 1 }, { name: "Medium", value: 2 }, { name: "Low", value: 1 }],
    heatmap: [
      { area: "Maintenance", impact: 3, likelihood: 3 },
      { area: "Process", impact: 2, likelihood: 2 },
      { area: "Safety", impact: 3, likelihood: 1 },
      { area: "Quality", impact: 2, likelihood: 2 },
    ],
  },
  {
    id: "rep-005",
    title: "ESG Disclosure Audit FY24",
    type: "ESG",
    uploadedAt: "2024-05-10",
    fileSize: "4.2 MB",
    fileType: "PDF",
    compliance: 88,
    risk: "medium",
    status: "Processed",
    summary: "ESG disclosure audit aligned with GRI and CSRD standards. Carbon emissions data is robust; **Scope 3 categories 11 & 15 require improved data quality**. Diversity metrics on track.",
    findings: [
      { id: "f1", title: "Scope 3 data gaps", severity: "medium", category: "Climate", description: "Categories 11 and 15 use spend-based estimation only.", recommendation: "Engage suppliers for activity-based data." },
    ],
    recommendations: [
      { id: "r1", title: "Supplier engagement program", priority: "P2", description: "Top 50 suppliers questionnaire.", owner: "Sustainability", due: "2024-Q4" },
    ],
    trend: baseTrend,
    categories: [{ name: "Climate", value: 2 }, { name: "Social", value: 1 }, { name: "Governance", value: 0 }, { name: "Reporting", value: 1 }],
    severity: [{ name: "High", value: 0 }, { name: "Medium", value: 3 }, { name: "Low", value: 1 }],
    heatmap: [
      { area: "Scope 1", impact: 2, likelihood: 1 },
      { area: "Scope 2", impact: 2, likelihood: 1 },
      { area: "Scope 3", impact: 3, likelihood: 3 },
      { area: "Social", impact: 2, likelihood: 1 },
    ],
  },
  {
    id: "rep-006",
    title: "Internal Audit – Procurement Cycle",
    type: "Internal Audit",
    uploadedAt: "2024-04-29",
    fileSize: "2.1 MB",
    fileType: "PDF",
    compliance: 81,
    risk: "medium",
    status: "Processed",
    summary: "Procurement cycle audit found that **18% of POs were issued after invoice receipt** ('after-the-fact' POs). Vendor master cleanup recommended.",
    findings: [
      { id: "f1", title: "After-the-fact POs", severity: "medium", category: "Process", description: "18% of POs created post-invoice.", recommendation: "Enforce no-PO-no-pay policy." },
      { id: "f2", title: "Duplicate vendors", severity: "low", category: "Master Data", description: "127 likely duplicate vendor records identified.", recommendation: "Vendor master cleansing project." },
    ],
    recommendations: [
      { id: "r1", title: "No-PO-no-pay enforcement", priority: "P1", description: "Configure ERP block.", owner: "Procurement", due: "2024-09-30" },
    ],
    trend: baseTrend,
    categories: [{ name: "Process", value: 2 }, { name: "Master Data", value: 1 }, { name: "Controls", value: 1 }, { name: "Spend", value: 0 }],
    severity: [{ name: "High", value: 0 }, { name: "Medium", value: 3 }, { name: "Low", value: 2 }],
    heatmap: [
      { area: "PO Cycle", impact: 2, likelihood: 3 },
      { area: "Vendor MDM", impact: 1, likelihood: 3 },
      { area: "3-way Match", impact: 2, likelihood: 2 },
      { area: "Approvals", impact: 2, likelihood: 1 },
    ],
  },
  {
    id: "rep-007",
    title: "Vendor Risk Assessment – Top 25 Suppliers",
    type: "Vendor",
    uploadedAt: "2024-04-15",
    fileSize: "1.5 MB",
    fileType: "XLSX",
    compliance: 73,
    risk: "high",
    status: "Processed",
    summary: "Top 25 vendor risk assessment identified **4 critical concentration risks** and 6 vendors with elevated cyber risk scores. Diversification of cloud providers recommended.",
    findings: [
      { id: "f1", title: "Single-source critical SaaS", severity: "high", category: "Concentration", description: "4 mission-critical SaaS apps from single vendors with no exit plan.", recommendation: "Develop exit playbooks and identify alternates." },
      { id: "f2", title: "Cyber risk score elevated", severity: "high", category: "Cyber", description: "6 vendors scored <C on BitSight.", recommendation: "Issue improvement plans with 90-day deadlines." },
    ],
    recommendations: [
      { id: "r1", title: "Vendor exit playbooks", priority: "P1", description: "Document migration paths for top 4.", owner: "TPRM", due: "2024-10-01" },
    ],
    trend: baseTrend,
    categories: [{ name: "Concentration", value: 2 }, { name: "Cyber", value: 3 }, { name: "Financial", value: 1 }, { name: "Compliance", value: 1 }],
    severity: [{ name: "High", value: 4 }, { name: "Medium", value: 5 }, { name: "Low", value: 3 }],
    heatmap: [
      { area: "Concentration", impact: 3, likelihood: 3 },
      { area: "Cyber", impact: 3, likelihood: 2 },
      { area: "Financial", impact: 2, likelihood: 1 },
      { area: "Compliance", impact: 2, likelihood: 2 },
    ],
  },
  {
    id: "rep-008",
    title: "ISO 9001 Quality Management System Audit",
    type: "Quality",
    uploadedAt: "2024-03-30",
    fileSize: "2.9 MB",
    fileType: "PDF",
    compliance: 90,
    risk: "low",
    status: "Processed",
    summary: "ISO 9001:2015 surveillance audit returned **zero major nonconformities**. Three minor observations primarily around document control versioning.",
    findings: [
      { id: "f1", title: "Document version control", severity: "low", category: "Documentation", description: "12 controlled documents past review date.", recommendation: "Trigger automated review reminders." },
    ],
    recommendations: [
      { id: "r1", title: "Automate doc review", priority: "P3", description: "QMS workflow update.", owner: "QA Mgr", due: "2024-11-30" },
    ],
    trend: baseTrend,
    categories: [{ name: "Documentation", value: 1 }, { name: "Process", value: 0 }, { name: "Training", value: 1 }, { name: "Audit", value: 1 }],
    severity: [{ name: "High", value: 0 }, { name: "Medium", value: 1 }, { name: "Low", value: 3 }],
    heatmap: [
      { area: "Docs", impact: 1, likelihood: 2 },
      { area: "Process", impact: 1, likelihood: 1 },
      { area: "Training", impact: 1, likelihood: 1 },
      { area: "Audit", impact: 1, likelihood: 1 },
    ],
  },
];

export const mockChatStarters = [
  "Summarize the top 3 risks",
  "What's the compliance trend?",
  "Generate executive summary",
  "Compare to last quarter",
];

export const mockNotifications = [
  { id: "n1", title: "GDPR audit complete", time: "2m ago", unread: true },
  { id: "n2", title: "New high-risk finding flagged", time: "1h ago", unread: true },
  { id: "n3", title: "Weekly compliance report ready", time: "3h ago", unread: false },
];
