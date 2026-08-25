import { RegisterForm } from "@/components/forms/register-form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <RegisterForm />
    </div>
  );
}
