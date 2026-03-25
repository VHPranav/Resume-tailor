"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { extractTextFromFile } from "@/lib/extractText";

export async function uploadResume(formData: FormData) {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
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
    // Continue even if extraction fails, but log it
  }

  // Ensure user exists in database
  const dbUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email: user.emailAddresses[0].emailAddress },
    create: {
      clerkId: userId,
      email: user.emailAddresses[0].emailAddress,
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


