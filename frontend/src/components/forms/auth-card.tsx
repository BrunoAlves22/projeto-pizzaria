import Link from "next/link";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  description: string;
  footerText?: string;
  footerLinkHref?: string;
  footerLinkText?: string;
  children: React.ReactNode;
}

export function AuthCard({
  description,
  footerText,
  footerLinkHref,
  footerLinkText,
  children,
}: AuthCardProps) {
  const hasFooter = footerText && footerLinkHref && footerLinkText;

  return (
    <div className="w-full max-w-md">
      <Card className="border border-border bg-card shadow-lg shadow-amber-950/5">
        <CardHeader className="items-center gap-1.5 text-center">
          <CardTitle className="text-2xl sm:text-3xl text-foreground select-none">
            AS{" "}
            <span className="text-amber-600 dark:text-amber-400">Pizzaria</span>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent>{children}</CardContent>

        {hasFooter && (
          <CardFooter className="justify-center gap-1 bg-muted/40 text-sm text-muted-foreground">
            {footerText}
            <Link
              href={footerLinkHref}
              className="font-medium text-amber-600 hover:underline dark:text-amber-400"
            >
              {footerLinkText}
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
