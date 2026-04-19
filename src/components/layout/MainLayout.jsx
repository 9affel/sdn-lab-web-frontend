import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useStatusPolling } from "../../hooks/useStatusPolling";

export function MainLayout() {
  const { status, attackCount } = useStatusPolling(5000);

  return (
    <div className="min-h-screen bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-60 flex flex-col min-h-screen">
        {/* TopBar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 bg-primary p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}