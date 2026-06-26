import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Get all conversation
export async function GET() {
  const conversations = await prisma.conversation.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(conversations);
}


// // Post Conversation
export async function POST() {
  const conversation =
    await prisma.conversation.create({
      data: {
        title: "New Chat",
      },
    });

  return NextResponse.json(conversation)
}