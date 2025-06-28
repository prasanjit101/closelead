'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OnboardingFormSchema, type OnboardingForm } from "@/types/onboarding.types";
import { trpc } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface OnboardingDialogProps {
  open: boolean;
}

export function OnboardingDialog({ open }: OnboardingDialogProps) {
  const { register, handleSubmit, formState: { errors }, control } = useForm<OnboardingForm>({
    resolver: zodResolver(OnboardingFormSchema),
  });

  const { mutate: updateUser } = trpc.user.updateUser.useMutation();

  const onSubmit = (data: OnboardingForm) => {
    updateUser({...data, onboard: false}, {
      onSuccess: () => {
        toast.success("Onboarding completed!");
        setTimeout(() => {
          window.location.reload();
        }
        , 1000);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save onboarding data");
        console.error(error);
      },
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[600px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="discovery_source">How did you hear about us?</Label>
            <Controller
              name="discovery_source"
              control={control}
              render={({ field }) => (
                <Select required onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {["google", "friend", "reddit", "youtube", "LinkedIn", "Twitter", "other"].map((source) => (
                      <SelectItem key={source} value={source}>
                        {source.charAt(0).toUpperCase() + source.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.discovery_source && (
              <p className="text-sm text-red-500">{errors.discovery_source.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              {...register("company_name")}
              placeholder="Acme Inc"
            />
            {errors.company_name && (
              <p className="text-sm text-red-500">{errors.company_name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="company_website">Company Website</Label>
            <Input
              id="company_website"
              {...register("company_website")}
              placeholder="https://example.com"
            />
            {errors.company_website && (
              <p className="text-sm text-red-500">{errors.company_website.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Complete Onboarding
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
