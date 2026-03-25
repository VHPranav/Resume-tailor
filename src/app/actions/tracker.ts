"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getJobApplications() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    return [];
  }

  return await prisma.jobApplication.findMany({
    where: { userId: user.id },
    include: {
      resume: true,
      interviews: {
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createJobApplication(data: {
  title: string;
  company: string;
  url?: string;
  location?: string;
  salary?: string;
  status: string;
  appliedDate?: Date;
  resumeId?: string;
  matchScore?: number;
}) {
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

  const application = await prisma.jobApplication.create({
    data: {
      userId: user.id,
      title: data.title,
      company: data.company,
      url: data.url,
      location: data.location,
      salary: data.salary,
      status: data.status,
      appliedDate: data.appliedDate,
      resumeId: data.resumeId,
      matchScore: data.matchScore,
    },
  });

  revalidatePath("/jobs");
  return application;
}

export async function updateJobApplicationStatus(id: string, status: string) {
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

  await prisma.jobApplication.update({
    where: { 
      id,
      userId: user.id 
    },
    data: { status },
  });

  revalidatePath("/jobs");
}

export async function addInterview(jobApplicationId: string, data: {
  type: string;
  date: Date;
  interviewer?: string;
  notes?: string;
}) {
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

  // Verify ownership
  const application = await prisma.jobApplication.findUnique({
    where: { 
      id: jobApplicationId,
      userId: user.id
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  await prisma.interview.create({
    data: {
      jobApplicationId,
      type: data.type,
      date: data.date,
      interviewer: data.interviewer,
      notes: data.notes,
    },
  });

  revalidatePath(`/jobs/${jobApplicationId}`);
}

export async function updateJobNotes(id: string, notes: string) {
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

  await prisma.jobApplication.update({
    where: { 
      id,
      userId: user.id 
    },
    data: { notes },
  });

  revalidatePath(`/jobs/${id}`);
}
