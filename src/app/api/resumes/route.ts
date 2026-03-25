import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        resumes: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            fileName: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json([]);
    }

    return NextResponse.json(user.resumes);
  } catch (error) {
    console.error("Failed to fetch resumes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
