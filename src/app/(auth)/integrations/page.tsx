import { IntegrationsList } from "@/components/integrations/IntegrationsList";
import { validateSession } from "auth";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
  const session = await validateSession();
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <IntegrationsList />
    </div>
  );
}
