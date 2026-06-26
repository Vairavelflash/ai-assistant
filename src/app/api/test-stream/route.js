import { agent } from "@/lib/agents";
import { llm } from "@/lib/llm";
import connectDB from "@/lib/mongo";
import prisma from "@/lib/prisma";
import { AIMessage, HumanMessage } from "langchain";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// PSQL
export async function POST(req) {
  try {
    const { conversationId, message } = await req.json();

    // Add User content to DB
    await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: message,
      },
    });


    // Get Previous messages
    const previousMessages = await prisma.message.findMany({
      where: {
        conversationId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take:20
    });

    // Filter the Chat Message
    const chatHistory = previousMessages.map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      }

      return new AIMessage(msg.content);
    });

    // Streaming Starts
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const agentStream = await agent.stream(
            {
              messages: chatHistory
              ,
            },
            {
              streamMode: "updates",
            },
          );

          // variable to store stored message
          let assistantMessage = "";

          for await (const chunk of agentStream) {
            /*
             * TOOL EXECUTION
             */
            if (chunk.tools?.messages?.length) {
              const toolMessage = chunk.tools.messages[0];

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "tool_start",
                    tool: toolMessage.name,
                    result: toolMessage.content,
                  }) + "\n",
                ),
              );

              continue;
            }

            /*
             * MODEL RESPONSE
             */
            if (chunk.model_request?.messages?.length) {
              const message = chunk.model_request.messages[0];

              const content = message?.content || "";
            assistantMessage += content;

              if (content) {
                controller.enqueue(
                  encoder.encode(
                    JSON.stringify({
                      type: "text_end",
                      content,
                    }) + "\n",
                  ),
                );
              }
            }
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "done",
              }) + "\n",
            ),
          );

          await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: assistantMessage,
            },
          });

          controller.close();
        } catch (error) {
          console.error(error);

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                message: error.message,
              }) + "\n",
            ),
          );

          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

// Mongo DB for Chat
// export async function POST(req) {
//   try {
//     await connectDB();
//     const { conversationId, message } = await req.json();


//     const Chat =
//       mongoose.models[conversationId] ||
//       mongoose.model(conversationId, chatSchema);


//     // Add User content to DB
//     await Chat.create({
//       conversationId,
//       role: "user",
//       content: message,
//     });

//     // Get Previous messages
//     const previousMessages = await Chat.find({})
//       .sort({ createdAt: 1 })
//       // .limit(10);

//     // Filter the Chat Message
//     const chatHistory = previousMessages.map((msg) => {
//       if (msg.role === "user") {
//         return new HumanMessage(msg.content);
//       }

//       return new AIMessage(msg.content);
//     });

//     // Streaming Starts
//     const encoder = new TextEncoder();

//     const stream = new ReadableStream({
//       async start(controller) {
//         try {
//           const agentStream = await agent.stream(
//             {
//               messages: chatHistory,
//             },
//             {
//               streamMode: "updates",
//             },
//           );

//           // variable to store stored message
//           let assistantMessage = "";

//           for await (const chunk of agentStream) {
//             /*
//              * TOOL EXECUTION
//              */
//             if (chunk.tools?.messages?.length) {
//               const toolMessage = chunk.tools.messages[0];

//               controller.enqueue(
//                 encoder.encode(
//                   JSON.stringify({
//                     type: "tool_start",
//                     tool: toolMessage.name,
//                     result: toolMessage.content,
//                   }) + "\n",
//                 ),
//               );

//               continue;
//             }

//             /*
//              * MODEL RESPONSE
//              */
//             if (chunk.model_request?.messages?.length) {
//               const message = chunk.model_request.messages[0];

//               const content = message?.content || "";
//               assistantMessage += content;

//               if (content) {
//                 controller.enqueue(
//                   encoder.encode(
//                     JSON.stringify({
//                       type: "text_end",
//                       content,
//                     }) + "\n",
//                   ),
//                 );
//               }
//             }
//           }

//           controller.enqueue(
//             encoder.encode(
//               JSON.stringify({
//                 type: "done",
//               }) + "\n",
//             ),
//           );

//           // Add Assistant Message to DB
//           await Chat.create({
//             conversationId,
//             role: "assistant",
//             content: assistantMessage,
//           });

//           controller.close();
//         } catch (error) {
//           console.error(error);

//           controller.enqueue(
//             encoder.encode(
//               JSON.stringify({
//                 type: "error",
//                 message: error.message,
//               }) + "\n",
//             ),
//           );

//           controller.close();
//         }
//       },
//     });

//     return new NextResponse(stream, {
//       headers: {
//         "Content-Type": "text/plain",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//       },
//     });
//   } catch (error) {
//     return NextResponse.json(
//       {
//         success: false,
//         error: error.message,
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// Define Schema
const chatSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
});
