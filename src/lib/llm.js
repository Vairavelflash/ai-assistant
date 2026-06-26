import { ChatMistralAI } from "@langchain/mistralai";



export const llm = new ChatMistralAI({
    apiKey: process.env.MISTRAL_API_KEY,
    model:"mistral-small-latest",
    temperature: 0.7
})