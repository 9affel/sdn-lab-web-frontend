import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export function MainLayout() {

  return (
    <div className="min-h-screen bg-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="md:ml-60 flex flex-col min-h-screen">
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