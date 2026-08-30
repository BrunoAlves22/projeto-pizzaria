import Link from "next/link";
import { Pizza } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import type { User } from "@/lib/types";

export function AppSidebar({ user }: { user: User }) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              tooltip="AS Pizzaria"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Pizza className="size-4" />
              </span>
              <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-semibold">
                  AS Pizzaria
                </span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  Painel administrativo
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <NavUser user={user} />
    </Sidebar>
  );
}
