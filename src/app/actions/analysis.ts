"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAnalysis(analysisId: string, rewrittenResume: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.analysis.update({
    where: { 
      id: analysisId,
      userId: user.id 
    },
    data: {
      rewrittenResume,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/results");
}

export async function deleteAnalysis(analysisId: string) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.analysis.delete({
    where: { 
      id: analysisId,
      userId: user.id 
    },
  });

  revalidatePath("/dashboard");
}
