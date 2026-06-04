import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { checkAndResetUserLimit } from "@/lib/limits";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        matchScore: { type: SchemaType.INTEGER },
        missingSkills: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        },
        suggestions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        },
        rewrittenResume: { type: SchemaType.STRING }
      },
      required: ["matchScore", "missingSkills", "suggestions", "rewrittenResume"]
    }
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
    const limitCheck = await checkAndResetUserLimit(clerkId);
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
      creditsUsed: limitCheck?.aiUsageCount || 0,
      creditsLimit: 2,
      role: limitCheck?.role || "USER",
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
    // Check monthly usage limits first
    const limitCheck = await checkAndResetUserLimit(clerkId);
    if (limitCheck && limitCheck.isBlocked) {
      return NextResponse.json(
        { error: "Usage limit reached. You can only analyze and rewrite your resume 2 times per calendar month." },
        { status: 403 }
      );
    }

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

      Formatting Rules for rewrittenResume (MANDATORY):
      1. Structure the resume with clear sections: Name, Tagline/Role, Contact Info, Professional Summary, Work Experience, Projects, Technical Skills, and Education.
      2. The very first line MUST be the candidate's name.
      3. The second line MUST be the target role or professional tagline.
      4. The third line MUST be the contact details (Phone | Email | LinkedIn | Portfolio).
      5. Use '## ' headings in UPPERCASE for main section titles (e.g., ## PROFESSIONAL SUMMARY, ## EXPERIENCE, ## PROJECTS, ## TECHNICAL SKILLS, ## EDUCATION).
      6. Use '### ' headings for job titles/companies and project titles (e.g., ### UI/UX Designer & Frontend Engineer | ClockHash Technologies).
      7. Use clean, single bullet points starting with '- ' or '* ' for experience details. NEVER merge multiple bullet points or sentences into a single dense paragraph.
      8. Insert exactly one blank line (\n\n) between all sections, jobs, projects, and headings to maintain a clean, well-spaced document layout.

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
      console.warn("Standard JSON parse failed, trying to sanitize text...", parseError);
      try {
        // Try cleaning up common LLM JSON syntax mistakes:
        // 1. Triple-quotes or double-quotes at the end of a string block: e.g. """} -> "} or ""\} -> "}
        let sanitized = text.trim();
        if (sanitized.endsWith('"""}')) {
          sanitized = sanitized.slice(0, -4) + '"}';
        } else if (sanitized.endsWith('""}')) {
          sanitized = sanitized.slice(0, -3) + '"}';
        } else if (sanitized.endsWith('\\"""}')) {
          sanitized = sanitized.slice(0, -5) + '"}';
        } else if (sanitized.endsWith('\\""}')) {
          sanitized = sanitized.slice(0, -4) + '"}';
        }
        
        // 2. Trailing commas before closing brace/bracket
        sanitized = sanitized.replace(/,\s*([\]}])/g, '$1');
        
        data = JSON.parse(sanitized);
        console.log("Successfully parsed sanitized JSON!");
      } catch (secondError) {
        console.error("Failed to parse sanitized Gemini output:", text);
        throw new Error("AI returned malformed JSON");
      }
    }

    // 4. Save to Database and atomically increment usage count
    const [analysis] = await prisma.$transaction([
      prisma.analysis.create({
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
      }),
      ...(limitCheck && limitCheck.role !== "ADMIN"
        ? [
            prisma.user.update({
              where: { id: user.id },
              data: { aiUsageCount: { increment: 1 } },
            })
          ]
        : [])
    ]);

    const nextCreditsUsed = limitCheck?.role === "ADMIN" ? 0 : (limitCheck?.aiUsageCount || 0) + 1;

    return NextResponse.json({ 
      ...data, 
      id: analysis.id,
      creditsUsed: nextCreditsUsed,
      creditsLimit: 2,
      role: limitCheck?.role || "USER"
    });

  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze resume" }, { status: 500 });
  }
}
