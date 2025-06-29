import { validateSession } from "auth";
import { Navbar } from "@/components/sections/navbar";

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
