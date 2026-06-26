import connectDB from "@/lib/mongo";
import prisma from "@/lib/prisma";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Get the message from Conversation Id
// SQL
export async function GET(req, { params }) {
  const { id } = await params; // ← This is required

  if (!id) {
    return NextResponse.json(
      { error: "Conversation ID is required" },
      { status: 400 },
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json(messages);
}

// MONGODB
// export async function GET(req, { params }) {
//   const { id } = await params;

  
//   if (!id) {
//     return NextResponse.json(
//       { error: "Conversation ID is required" },
//       { status: 400 },
//     );
//   }

//   try {
//     await connectDB();

//         const Chat =
//           mongoose.models[id] ||
//           mongoose.model(id, chatSchema);

//          const messages = await Chat.find({})
//       .sort({ createdAt: 1 })

//       return NextResponse.json(messages)
//   } catch (error) {
//     console.log(error);
//    return NextResponse.json({ success: false, message: "error" });
//   }
// }

// Define Schema
const chatSchema = new mongoose.Schema({
  conversationId: { type: String, required: true },
  role: { type: String, required: true },
  content: { type: String },
  createdAt: { type: Date, default: Date.now },
});