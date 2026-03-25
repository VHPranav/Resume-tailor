"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function saveJob(formData: FormData) {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const url = formData.get("url") as string;
  const description = formData.get("description") as string;

  if (!description) {
    throw new Error("Job description is required");
  }

  // Find the database user
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  // Create the job
  await prisma.job.create({
    data: {
      userId: user.id,
      title: title || "Untitled Role",
      url: url || null,
      description,
    },
  });

  redirect("/results");
}
