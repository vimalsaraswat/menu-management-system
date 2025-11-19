import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";
import { removeAuthCookie } from "~/server/actions/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await api.auth.getSession();

  if (!session?.data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-rose-600">
            MenuMaster
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.data.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await removeAuthCookie();
                redirect("/login");
              }}
            >
              <Button variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  );
}
