import { IntegrationsList } from "@/components/integrations/IntegrationsList";

export default async function IntegrationsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <IntegrationsList />
    </div>
  );
}
