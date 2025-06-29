import { IntegrationsList } from "@/components/integrations/IntegrationsList";
import { validateSession } from "auth";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const session = await validateSession();
  if (!session?.user?.onboard) {
    redirect('/webhooks');
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <IntegrationsList />
    </div>
  );
}