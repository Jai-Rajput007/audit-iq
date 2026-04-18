import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/useAppStore";
import { reports as seed } from "@/lib/mockData";
import { toast } from "sonner";
import { UploadCloud, FileText, FileSpreadsheet, FileType, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  "Parsing document structure...",
  "Extracting key entities & metrics...",
  "Identifying risks & findings...",
  "Generating recommendations...",
  "Finalizing executive summary...",
];

export default function Upload() {
  const navigate = useNavigate();
  const addReport = useAppStore((s) => s.addReport);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0]);
      runProcessing(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    disabled: !!file,
  });

  useEffect(() => {
    if (!dropRef.current || file) return;
    const tween = gsap.to(dropRef.current, {
      boxShadow: "0 0 0 4px hsl(var(--accent) / 0.15)",
      duration: 1.5,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
    return () => { tween.kill(); };
  }, [file]);

  const runProcessing = async (f: File) => {
    // upload progress
    for (let p = 0; p <= 100; p += 5) {
      setProgress(p);
      await new Promise((r) => setTimeout(r, 40));
    }
    // ai steps
    for (let i = 0; i < steps.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 700));
    }
    // create new mock report
    const base = seed[Math.floor(Math.random() * seed.length)];
    const newReport = {
      ...base,
      id: `rep-${Date.now()}`,
      title: f.name.replace(/\.[^.]+$/, ""),
      uploadedAt: new Date().toISOString().slice(0, 10),
      fileSize: `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      fileType: (f.name.split(".").pop()?.toUpperCase() ?? "PDF") as any,
    };
    addReport(newReport);
    setDone(true);
    toast.success("Report processed!");
    setTimeout(() => navigate(`/report/${newReport.id}`), 800);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Upload Report</h1>
        <p className="text-muted-foreground mt-1">Drop in any audit document — we'll do the rest.</p>
      </div>

      {!file ? (
        <div
          ref={dropRef}
          {...getRootProps()}
          className={cn(
            "relative rounded-3xl border-2 border-dashed border-border bg-card p-10 sm:p-16 text-center cursor-pointer transition-all",
            isDragActive && "border-accent bg-accent/5"
          )}
        >
          <input {...getInputProps()} />
          <div className="mx-auto h-20 w-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
            <UploadCloud className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {isDragActive ? "Drop it here" : "Drag & drop your report"}
          </h3>
          <p className="text-sm text-muted-foreground mb-6">or click to browse from your computer</p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <Badge icon={FileText} label="PDF" />
            <Badge icon={FileText} label="DOCX" />
            <Badge icon={FileSpreadsheet} label="XLSX" />
            <Badge icon={FileType} label="TXT" />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border border-border bg-card p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
            {done && <CheckCircle2 className="h-6 w-6 text-success" />}
          </div>

          {progress < 100 && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Uploading...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {progress >= 100 && (
            <div className="space-y-3">
              <div className="text-sm font-medium mb-3 flex items-center gap-2">
                <Loader2 className={cn("h-4 w-4", !done && "animate-spin")} />
                {done ? "Analysis complete" : "AI is analyzing..."}
              </div>
              <AnimatePresence>
                {steps.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    {i < step || done ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : i === step ? (
                      <Loader2 className="h-4 w-4 text-accent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-border flex-shrink-0" />
                    )}
                    <span className={cn(i <= step ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

const Badge = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1">
    <Icon className="h-3.5 w-3.5" />
    <span className="font-medium">{label}</span>
  </div>
);
