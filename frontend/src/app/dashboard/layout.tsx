import { ReactNode } from "react";
import { requiredAdminUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requiredAdminUser();

  return <>{children}</>;
}
