import { AgentsList } from "@/components/agents/AgentsList";
import { validateSession } from "auth";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const session = await validateSession();
  if (!session?.user?.onboard) {
    redirect('/webhooks');
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <AgentsList />
    </div>
  );
}