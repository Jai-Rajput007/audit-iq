import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { user } = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const apiKey = "sk_live_4f9c2a1e3b8d7e6f5a9c2b1d8e7f6a5b";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and workspace</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="rounded-xl bg-muted/50 p-1 h-auto flex-wrap justify-start">
          <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Security</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg">Team</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg">Templates</TabsTrigger>
          <TabsTrigger value="api" className="rounded-lg">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card title="Profile">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 ring-2 ring-accent/30">
                <AvatarFallback className="bg-accent/10 text-accent text-xl font-semibold">
                  {user?.name?.[0] ?? "A"}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" className="rounded-xl">Upload photo</Button>
            </div>
            <Field label="Full name" defaultValue={user?.name} />
            <Field label="Email" defaultValue={user?.email} />
            <Field label="Role" defaultValue={user?.role} disabled />
            <Button onClick={() => toast.success("Profile updated")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl">Save changes</Button>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card title="Security">
            <Field label="Current password" type="password" />
            <Field label="New password" type="password" />
            <Field label="Confirm password" type="password" />
            <div className="flex items-center justify-between py-3 border-t border-border mt-4">
              <div>
                <div className="font-medium">Two-factor authentication</div>
                <div className="text-sm text-muted-foreground">Add an extra layer of security</div>
              </div>
              <Switch />
            </div>
            <Button onClick={() => toast.success("Password updated")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl mt-4">Update password</Button>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card title="Team members">
            <div className="space-y-3">
              {[
                { name: "Alex Morgan", email: "alex@firm.com", role: "Admin" },
                { name: "Sara Patel", email: "sara@firm.com", role: "Auditor" },
                { name: "Jin Park", email: "jin@firm.com", role: "Viewer" },
              ].map((m) => (
                <div key={m.email} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-muted text-xs">{m.name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </div>
                  <Badge variant="outline" className="rounded-full">{m.role}</Badge>
                  <Button variant="ghost" size="icon" className="rounded-lg"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
            <Button className="mt-4 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => toast.success("Invitation sent")}>
              <Plus className="h-4 w-4 mr-1.5" /> Invite member
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card title="Notifications">
            {[
              "Email me when a new report finishes processing",
              "Email me weekly compliance digest",
              "Notify me when a high-risk finding is detected",
              "Notify me of team activity",
            ].map((label) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <span className="text-sm">{label}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card title="Custom summary template">
            <p className="text-sm text-muted-foreground mb-3">Customize how AI generates report summaries.</p>
            <Textarea
              defaultValue={`# {{title}}\n\n## Executive summary\n{{summary}}\n\n## Top risks\n{{risks}}\n\n## Recommendations\n{{recommendations}}`}
              className="rounded-xl font-mono text-sm min-h-[200px]"
            />
            <Button onClick={() => toast.success("Template saved")} className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl mt-4">Save template</Button>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6">
          <Card title="API key">
            <p className="text-sm text-muted-foreground mb-4">Use this key to integrate AuditSummar AI with your tools.</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input value={showKey ? apiKey : "•".repeat(40)} readOnly className="rounded-xl font-mono pr-10" />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button variant="outline" className="rounded-xl" onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("Copied"); }}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="rounded-xl mt-4" onClick={() => toast.success("New key generated")}>Regenerate key</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-6">
    <h2 className="font-semibold mb-4">{title}</h2>
    {children}
  </motion.div>
);

const Field = ({ label, ...props }: any) => (
  <div className="space-y-2 mb-4">
    <Label>{label}</Label>
    <Input className="rounded-xl" {...props} />
  </div>
);
