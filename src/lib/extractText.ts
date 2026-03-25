import mammoth from "mammoth";

// Polyfill for DOMMatrix in Node/Next.js environments where it is missing
if (typeof globalThis !== "undefined" && typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

const pdf = require("pdf-parse");

export async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === "application/pdf") {
    const data = await pdf(buffer);
    return data.text;
  } 
  
  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type for extraction");
}
