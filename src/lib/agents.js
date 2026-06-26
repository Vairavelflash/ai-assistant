import { createAgent, tool } from "langchain";
import { llm } from "./llm";
import { tools } from "@/tools";

export const agent = createAgent({
  model: llm,
  tools,
  systemPrompt: `
    Give answer not more than 20 words`,
});
