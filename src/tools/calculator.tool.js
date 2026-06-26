import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorTool = tool(
  async ({ expression }) => {
    try {
      const result = Function(
        `return (${expression})`
      )();

      return String(result);
    } catch {
      return "Invalid expression";
    }
  },
  {
    name: "calculator",
    description:
      "Perform mathematical calculations",
    schema: z.object({
      expression: z.string(),
    }),
  }
);