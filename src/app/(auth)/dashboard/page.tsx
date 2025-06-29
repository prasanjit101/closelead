import { useState } from "react";
import { trpc } from "@/trpc/react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { Loader2 } from "lucide-react";
import { getSession } from "auth";

export default async function Dashboard() {
  const session = await getSession();

  if (session && !session.user.onboard) {
    return <OnboardingFlow />;
  }

  return (
    <div className="mx-auto min-h-screen w-10/12 space-y-10 py-20">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your lead management.
          </p>
        </div>

        {/* Dashboard content will go here */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Total Leads</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Active Webhooks</h3>
            <p className="text-2xl font-bold">1</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Qualified Leads</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">Meetings Scheduled</h3>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
