import { z } from "zod";

export const DiscoverySourceList = ["google", "friend", "reddit", "youtube", "LinkedIn", "Twitter", "other"] as const;

export const OnboardingFormSchema = z.object({
  discovery_source: z.enum(DiscoverySourceList, {
    errorMap: () => ({ message: "Please select a valid option" }),
  }),
  company_name: z.string().min(1, "Company name is required"),
  company_website: z.string().url("Invalid website URL"),
});

export type OnboardingForm = z.infer<typeof OnboardingFormSchema>;
