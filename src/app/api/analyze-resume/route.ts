import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export async function GET(request: Request) {
  const { userId: clerkId } = await auth();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Missing analysis ID" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const analysis = await prisma.analysis.findUnique({
      where: { 
        id,
        userId: user.id
      },
      include: {
        job: true,
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    // Parse suggestions to support both old structure (array) and new structure (object)
    const suggestionsData = analysis.suggestions ? JSON.parse(analysis.suggestions) : [];
    const suggestions = Array.isArray(suggestionsData) ? suggestionsData : (suggestionsData.suggestions || []);
    const missingSkills = Array.isArray(suggestionsData) ? [] : (suggestionsData.missingSkills || []);

    return NextResponse.json({
      id: analysis.id,
      matchScore: analysis.matchScore,
      rewrittenResume: analysis.rewrittenResume,
      suggestions,
      missingSkills,
      resumeId: analysis.resumeId,
      jobTitle: analysis.job.title,
      // If the job title was empty, we can guess it's from the first line of description usually, but we'll stick to model for now
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}

export async function POST() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Fetch latest data
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        resumes: { orderBy: { createdAt: "desc" }, take: 1 },
        jobs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!user || user.resumes.length === 0 || user.jobs.length === 0) {
      return NextResponse.json({ error: "Resume or Job description missing" }, { status: 400 });
    }

    const resume = user.resumes[0];
    const job = user.jobs[0];

    // 2. Prepare Prompt
    const prompt = `
      You are a professional resume writer.

      Compare the resume with the job description.

      Return JSON with:
      - matchScore (0-100)
      - missingSkills (array of strings)
      - suggestions (array of strings)
      - rewrittenResume (string, markdown format)

      Rules:
      - Optimize resume for ATS systems
      - Use strong action verbs
      - Highlight relevant experience
      - Keep bullet points concise

      Resume:
      ${resume.content}
      
      Job Description:
      ${job.description}

      Respond ONLY with the JSON object.
    `;

    // 3. Call Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Cleanup markdown code blocks if the AI injected them
    if (text.startsWith("```json")) {
       text = text.substring(7);
    } else if (text.startsWith("```")) {
       text = text.substring(3);
    }
    if (text.endsWith("```")) {
       text = text.substring(0, text.length - 3);
    }
    
    let data;
    try {
      data = JSON.parse(text.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", text);
      throw new Error("AI returned malformed JSON");
    }

    // 4. Save to Database
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        jobId: job.id,
        matchScore: parseInt(data.matchScore) || 50,
        rewrittenResume: data.rewrittenResume || "Content generation failed.",
        suggestions: JSON.stringify({
          suggestions: data.suggestions || [],
          missingSkills: data.missingSkills || []
        }),
      },
    });

    return NextResponse.json({ ...data, id: analysis.id });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}
