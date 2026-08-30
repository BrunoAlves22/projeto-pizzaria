import { ReactNode } from "react";
import { requiredAdminUser } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requiredAdminUser();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center p-2">
          <SidebarTrigger />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
