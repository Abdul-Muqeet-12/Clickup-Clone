
import React from "react";
import DashboardSidebar from "@/components/dashboard-sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardSidebar>{children}</DashboardSidebar>;
};

export default Layout;
