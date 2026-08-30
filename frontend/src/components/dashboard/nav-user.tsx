import { LogOut } from "lucide-react";
import { logoutUser } from "@/actions/auth";
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/types";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function NavUser({ user }: { user: User }) {
  return (
    <SidebarFooter>
      <SidebarSeparator className="mb-1" />

      <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-white dark:bg-amber-600">
          {getInitials(user.name)}
        </span>
        <div className="flex min-w-0 flex-1 flex-col group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-medium text-sidebar-foreground">
            {user.name}
          </span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            {user.email}
          </span>
        </div>
      </div>

      <SidebarMenu>
        <SidebarMenuItem>
          <form action={logoutUser} className="contents">
            <SidebarMenuButton
              type="submit"
              tooltip="Sair"
              className="text-destructive cursor-pointer hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </form>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}
