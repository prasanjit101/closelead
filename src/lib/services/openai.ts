import { env } from "@/env";
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface LeadScoringResult {
  score: number; // 1-10
  breakdown: {
    factor: string;
    points: number;
    reasoning: string;
  }[];
  summary: string;
}

export async function scoreLeadWithAI(
  leadData: Record<string, any>,
  scoringPrompt: string,
): Promise<LeadScoringResult> {
  try {
    const systemPrompt = `You are a lead scoring AI assistant. Your job is to analyze lead data and provide a score from 1-10 based on the provided criteria.

IMPORTANT: You must respond with a valid JSON object in this exact format:
{
  "score": number (1-10),
  "breakdown": [
    {
      "factor": "string describing the factor",
      "points": number (positive or negative points for this factor),
      "reasoning": "string explaining why this factor contributed to the score"
    }
  ],
  "summary": "string summarizing the overall assessment"
}

Scoring Guidelines:
- 1-3: Poor quality lead (students, competitors, irrelevant inquiries)
- 4-6: Medium quality lead (some potential but missing key qualifiers)
- 7-8: Good quality lead (meets most criteria, likely to convert)
- 9-10: Excellent quality lead (perfect fit, high intent, decision maker)

Consider factors like:
- Company size and industry relevance
- Job title and decision-making authority
- Budget indicators
- Urgency and intent signals
- Contact information quality
- Specific needs mentioned
- Geographic location relevance`;

    const userPrompt = `Lead Data: ${JSON.stringify(leadData, null, 2)}

Scoring Criteria: ${scoringPrompt}

Please analyze this lead and provide a score with detailed breakdown.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const result = JSON.parse(response) as LeadScoringResult;

    // Validate the response structure
    if (
      typeof result.score !== "number" ||
      result.score < 1 ||
      result.score > 10
    ) {
      throw new Error("Invalid score in AI response");
    }

    if (!Array.isArray(result.breakdown)) {
      throw new Error("Invalid breakdown in AI response");
    }

    return result;
  } catch (error) {
    console.error("Error scoring lead with AI:", error);

    // Fallback scoring if AI fails
    return {
      score: 5,
      breakdown: [
        {
          factor: "AI Scoring Failed",
          points: 0,
          reasoning: "Unable to process lead with AI, assigned default score",
        },
      ],
      summary: "Lead scoring failed, manual review required",
    };
  }
}
