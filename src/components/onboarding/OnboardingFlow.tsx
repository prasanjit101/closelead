"use client";

import { useState } from "react";
import { WelcomeStep } from "./WelcomeStep";
import { WebhookStep } from "./WebhookStep";
import { SuccessStep } from "./SuccessStep";

export function OnboardingFlow() {
  const [step, setStep] = useState<"welcome" | "webhook" | "success">(
    "welcome",
  );

  if (step === "welcome") {
    return <WelcomeStep onNext={() => setStep("webhook")} />;
  }

  if (step === "webhook") {
    return (
      <WebhookStep
        onBack={() => setStep("welcome")}
        onSuccess={() => setStep("success")}
      />
    );
  }

  if (step === "success") {
    return <SuccessStep />;
  }

  return null;
}
