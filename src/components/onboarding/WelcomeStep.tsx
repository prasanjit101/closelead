"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Webhook } from "lucide-react";

interface WelcomeStepProps {
    onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Webhook className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to Closelead!</CardTitle>
                    <CardDescription>
                        Let's get you set up with your first webhook to start capturing leads.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <h3 className="font-medium text-blue-900">What you'll do:</h3>
                            <ul className="mt-2 space-y-1 text-sm text-blue-700">
                                <li>• Create your first webhook</li>
                                <li>• Connect your lead capture forms</li>
                                <li>• Start automating your lead management</li>
                            </ul>
                        </div>
                        <Button onClick={onNext} className="w-full">
                            Get Started
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
