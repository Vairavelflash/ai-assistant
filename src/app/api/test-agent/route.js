import { agent } from "@/lib/agents";
import { HumanMessage } from "langchain";

import { NextResponse } from "next/server";

export async function GET() {
  // const response = await agent.invoke({
  //   messages:[
  //     {
  //       role:"user",
  //       content:"What is 245*56"
  //     }
  //   ]
  // });

  const stream = await agent.invoke({
    messages: [new HumanMessage("what is 2 multiplied by 4")],
  });

  const lastMessage = stream.messages[stream.messages.length - 1];

  return NextResponse.json({ success: true, response: lastMessage.content });
}

export async function POST(req) {
  const { message } = await req.json();

  // const stream = new ReadableStream({
  //   async start(controller) {
  //     const encoder = new TextEncoder();

  //     try {
  //       const result = await agent.invoke({
  //         messages: [new HumanMessage(message)],
  //       });

  //       for await (const chunk of result) {
  //         // Handle different chunk types
  //         if (chunk.messages?.length > 0) {
  //           const content = chunk.messages[chunk.messages.length - 1].content;
  //           if (content) {
  //             controller.enqueue(encoder.encode(content));
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       // controller.error(error);
  //     } finally {
  //       // controller.close();
  //     }
  //   },
  // });

  const stream = await agent.invoke({
    messages: [new HumanMessage(message)],
  });
  const lastMessage = stream.messages[stream.messages.length - 1];

  return new NextResponse(lastMessage.content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
