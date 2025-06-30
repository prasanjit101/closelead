import Leads from "@/components/dashboard/leads";
import { validateSession } from "auth";
import { redirect } from "next/navigation";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function DashboardPage() {
  const session = await validateSession();
  if (!session?.user?.onboard) {
    redirect("/webhooks");
  }
  return (
    <NuqsAdapter>
      <Leads />
    </NuqsAdapter>
  );
}
