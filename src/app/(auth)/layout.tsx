import { validateSession } from "auth";
import { Navbar } from "@/components/sections/navbar";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateSession();

  return (
    <main>
      <Navbar session={session} />
      {children}
    </main>
  );
}
