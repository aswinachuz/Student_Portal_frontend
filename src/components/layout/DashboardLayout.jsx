import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import KineticGrid from "../common/KineticGrid";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <KineticGrid />

      {/* Application Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Main Area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}