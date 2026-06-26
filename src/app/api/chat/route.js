import { llm } from "@/lib/llm";

import prisma from "@/lib/prisma";
import { AIMessage, HumanMessage } from "langchain";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { conversationId, message } = await req.json();

    await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: message,
      },
    });

    const previousMessages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // const mistralMessages = previousMessages.map((msg) => ({
    //   role: msg.role,
    //   content: msg.content,
    // }));

    const chatHistory = previousMessages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      }

      return new AIMessage(msg.content);
    });

    // let assistantMessage = "";

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // const response = await mistral.chat.stream({
          //   model: "mistral-small-latest",
          //   messages: mistralMessages,
          // });

          const response = await llm.stream(chatHistory);

          let assistantMessage = "";

          // for await (const chunk of response) {
          //   const token = chunk?.data?.choices?.[0]?.delta?.content;

          //   if (!token) continue;

          //   assistantMessage += token;

          //   controller.enqueue(encoder.encode(token));
          // }

          for await (const chunk of response) {
            const token = chunk.content || "";
            assistantMessage += token;

            controller.enqueue(encoder.encode(token));
          }

          await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: assistantMessage,
            },
          });

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    return new NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
