import { create } from "zustand";
import { persist } from "zustand/middleware";
import { reports as seedReports, Report } from "@/lib/mockData";

interface User {
  email: string;
  name: string;
  role: "Auditor" | "Manager" | "Admin" | "Viewer";
  avatar?: string;
}

interface AppState {
  user: User | null;
  reports: Report[];
  login: (user: User) => void;
  logout: () => void;
  addReport: (r: Report) => void;
  deleteReport: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      reports: seedReports,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      addReport: (r) => set((s) => ({ reports: [r, ...s.reports] })),
      deleteReport: (id) => set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
    }),
    { name: "auditsummar-store" }
  )
);
