
import type { ReactNode } from "react";
import DashboardSidebarClient from "./dashboard-sidebar-client";

interface Props {
  children: ReactNode;
}

export default function DashboardSidebar({ children }: Props) {
  return <DashboardSidebarClient>{children}</DashboardSidebarClient>;
}
