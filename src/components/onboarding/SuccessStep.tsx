"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export function SuccessStep() {
    const router = useRouter();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">You're All Set!</CardTitle>
                    <CardDescription>
                        Your webhook has been created successfully. You can now start receiving and managing leads.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-lg bg-green-50 p-4">
                            <h3 className="font-medium text-green-900">What's Next:</h3>
                            <ul className="mt-2 space-y-1 text-sm text-green-700">
                                <li>• View and manage your leads in the dashboard</li>
                                <li>• Set up automated follow-up sequences</li>
                                <li>• Configure lead scoring rules</li>
                                <li>• Schedule meetings with qualified leads</li>
                            </ul>
                        </div>
                        <Button onClick={() => router.push("/dashboard")} className="w-full">
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
