"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

const generalItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
];

const cardapioItems: NavItem[] = [
  { title: "Categorias", url: "/dashboard/categories", icon: Tags },
  { title: "Produtos", url: "/dashboard/products", icon: Package },
];

function isItemActive(pathname: string, url: string) {
  return url === "/dashboard" ? pathname === url : pathname.startsWith(url);
}

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton
              render={<Link href={item.url} />}
              isActive={isItemActive(pathname, item.url)}
              tooltip={item.title}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export function NavMain() {
  return (
    <>
      <NavGroup label="Geral" items={generalItems} />
      <NavGroup label="Cardápio" items={cardapioItems} />
    </>
  );
}
