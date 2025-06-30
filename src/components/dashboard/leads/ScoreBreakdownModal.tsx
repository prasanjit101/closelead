"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreBreakdown {
  score: number;
  breakdown: {
    factor: string;
    points: number;
    reasoning: string;
  }[];
  summary: string;
}

interface ScoreBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  scoreBreakdown: ScoreBreakdown | null;
}

export function ScoreBreakdownModal({
  isOpen,
  onClose,
  leadName,
  scoreBreakdown,
}: ScoreBreakdownModalProps) {
  if (!scoreBreakdown) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 4) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPointsIcon = (points: number) => {
    if (points > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (points < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getPointsColor = (points: number) => {
    if (points > 0) return "text-green-600 dark:text-green-400";
    if (points < 0) return "text-red-600 dark:text-red-400";
    return "text-gray-600 dark:text-gray-400";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Lead Score Breakdown
            <Badge
              className={`${getScoreColor(scoreBreakdown.score)} bg-opacity-10`}
            >
              {scoreBreakdown.score}/10
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed scoring analysis for {leadName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium">Final Score</span>
                <span
                  className={`text-2xl font-bold ${getScoreColor(scoreBreakdown.score)}`}
                >
                  {scoreBreakdown.score}/10
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    scoreBreakdown.score >= 8
                      ? "bg-green-600"
                      : scoreBreakdown.score >= 6
                        ? "bg-yellow-600"
                        : scoreBreakdown.score >= 4
                          ? "bg-orange-600"
                          : "bg-red-600"
                  }`}
                  style={{ width: `${(scoreBreakdown.score / 10) * 100}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {scoreBreakdown.summary}
              </p>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Scoring Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scoreBreakdown.breakdown.map((factor, index) => (
                  <div key={index}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {getPointsIcon(factor.points)}
                          <span className="text-sm font-medium">
                            {factor.factor}
                          </span>
                          <span
                            className={`text-sm font-medium ${getPointsColor(factor.points)}`}
                          >
                            {factor.points > 0 ? "+" : ""}
                            {factor.points} pts
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {factor.reasoning}
                        </p>
                      </div>
                    </div>
                    {index < scoreBreakdown.breakdown.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Score Interpretation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Score Interpretation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-600" />
                    <span className="font-medium">9-10: Excellent Lead</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="font-medium">7-8: Good Lead</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-600" />
                    <span className="font-medium">4-6: Medium Lead</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-600" />
                    <span className="font-medium">1-3: Poor Lead</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
