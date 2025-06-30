import { AgentsList } from "@/components/agents/AgentsList";
import { validateSession } from "auth";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const session = await validateSession();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <AgentsList />
    </div>
  );
}
