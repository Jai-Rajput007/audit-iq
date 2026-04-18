import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

export const AppLayout = () => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
};
