
import type { ReactNode } from "react";
import { ListPageHeader } from "@/features/lists/components/list-page-header";

interface ListLayoutProps {
  children: ReactNode;
  params: Promise<{ listId: string }>;
}

export default async function ListLayout({
  children,
}: ListLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <ListPageHeader />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
