import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const weatherTool = tool(
  async ({ city }) => {
    return `The weather in ${city} is 32°C and sunny`;
  },
  {
    name: "weather",
    description:
      "Get weather information for a city",
    schema: z.object({
      city: z.string(),
    }),
  }
);