import { GeneratedTask, TaskPriority } from "../db/schema";
import { cerebrasLLM } from "@/lib/llm";
import { JsonOutputParser, StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

/**
 * Generates a title for a task using AI
 * @param details Task details to generate title from
 */
export async function generateTitle(details: string): Promise<string> {
    const prompt = ChatPromptTemplate.fromMessages([
        {
            role: 'system',
            content: `Create a concise, action-oriented small title for a task based on its details. Focus on the main action required. Only output the title, no other text.`,
        },
        {
            role: 'user',
            content: `Create a title for the task: \n<task_detail>\n{details}\n</task_detail>`,
        }
    ]);

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(cerebrasLLM).pipe(outputParser);

    try {
        const response = await chain.invoke({
            details,
        });
        return response.trim();
    } catch (error) {
        console.error('Failed to generate title:', error);
        return "Untitled Task"; // Fallback
    }
}

/**
 * Determines priority for a task when set to 'Auto'
 * @param details Task details to determine priority from
 */
export async function decidePriority(details: string) {
    const prompt = ChatPromptTemplate.fromMessages([
        {
            role: 'system',
            content: `Analyze the task details and determine its priority level. 
      Criteria:
      - Critical: Immediate action required, time-sensitive, blocking progress
      - High: Important with clear deadlines, impacts multiple areas
      - Medium: Important but not urgent, can be scheduled
      - Low: Minor improvements, optional enhancements

      Respond ONLY with one of: low, medium, high, critical.`,
        },
        {
            role: 'user',
            content: `Determine priority for this task: \n<task_detail>\n{details}\n</task_detail>`,
        }
    ]);

    const outputParser = new StringOutputParser();
    const chain = prompt.pipe(cerebrasLLM).pipe(outputParser);

    try {
        const response = await chain.invoke({
            details
        });
        return response as TaskPriority;
    } catch (error) {
        console.error('Failed to determine priority:', error);
        return "medium"; // Default fallback
    }
}

/**
 * Generates multiple tasks from a single task description
 * @param details Task details to break down
 * @param count Number of subtasks to generate (default: 3-5)
 */
export async function generateTasks(
    details: string,
): Promise<Omit<GeneratedTask, 'id' | 'createdAt'>[]> {
    const prompt = ChatPromptTemplate.fromMessages([
        {
            role: 'system',
            content: `You are a task decomposition expert. Break down complex tasks into actionable tasks. 
      Requirements:
      - Try to create minimum number of tasks, only as much as needed or a breakdown  of just what is defined in the task detail provided.
      - Each task should be specific, actionable
      - Use varied action verbs
      - Include both implementation and validation steps
      - Return in JSON array format where each element has the following fields:
        1. title - what the task is about
        2. details - details on how the task should be implemented, with any additional contexts required in markdown format.
        3. priority - must be one of "low" | "medium" | "high" | "critical" based on the task's urgency and importance

        - Example: [{{ "title": "Implement login feature", "details": "# Login page\nCreate a login page with validation", "priority": "high" }}]
    `,
        },
        {
            role: 'user',
            content: `Break down this task: \n<task_detail>\n{details}\n</task_detail>`,
        }
    ]);


    const outputParser = new JsonOutputParser<GeneratedTask[]>();

    const chain = prompt.pipe(cerebrasLLM).pipe(outputParser);

    try {
        const response = await chain.invoke({
            details
        });
        return response.map(task => ({
            title: task.title,
            details: task.details,
            priority: task.priority,
        }));
    } catch (error) {
        console.error('Failed to generate tasks:', error);
        // Return fallback task
        return [{
            title: "Untitled Task",
            details,
            priority: "medium",
        }];
    }
}
