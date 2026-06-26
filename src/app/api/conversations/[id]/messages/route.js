import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = await params;

  const messages = await prisma.message.findMany({
    where: {
      conversationId: id,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return NextResponse.json({
    success: true,
    messages,
  });
}

