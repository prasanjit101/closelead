import { AgentsList } from "@/components/agents/AgentsList";

export default async function AgentsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <AgentsList />
    </div>
  );
}
