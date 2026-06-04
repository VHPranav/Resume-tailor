"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { extractTextFromFile } from "@/lib/extractText";
import { checkAndResetUserLimit } from "@/lib/limits";

export async function uploadResume(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  // 1. Check if user is blocked by monthly AI tailoring limits
  const limitCheck = await checkAndResetUserLimit(userId);
  if (limitCheck && limitCheck.isBlocked) {
    throw new Error("Usage limit reached. You can only analyze and rewrite your resume 2 times per calendar month.");
  }

  const file = formData.get("resume") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a PDF or DOCX.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Extract raw text
  let content = "";
  try {
    content = await extractTextFromFile(buffer, file.type);
  } catch (err) {
    console.error("Extraction error:", err);
    throw new Error("Failed to parse and extract text from your resume file. Please ensure it is a valid PDF or DOCX.");
  }

  // Ensure user exists in database with synced role
  const adminEmail = process.env.ADMIN_EMAIL || "pranavvh778@gmail.com";
  const email = user.emailAddresses[0].emailAddress;
  const role = email.toLowerCase() === adminEmail.toLowerCase() ? "ADMIN" : "USER";

  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { 
      email,
      role,
    },
    create: {
      clerkId: userId,
      email,
      role,
    },
  });

  // Handle file saving (Local dev only, will skip in production/Vercel)
  let fileUrl = "";
  const uploadDir = join(process.cwd(), "public", "uploads");
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  try {
    // Attempt to save file (works locally, fails on Vercel)
    await mkdir(uploadDir, { recursive: true });
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    fileUrl = `/uploads/${fileName}`;
  } catch (err) {
    console.warn("Skipping local file save (Production/Vercel):", err);
    // Placeholder URL since physical file isn't needed for analysis
    fileUrl = `data:${file.type};base64,${buffer.toString("base64").substring(0, 100)}...`;
  }

  // Save to database
  await prisma.resume.create({
    data: {
      userId: dbUser.id,
      fileUrl,
      fileName: file.name,
      content,
    },
  });

  revalidatePath("/dashboard");
  redirect("/job");
}


