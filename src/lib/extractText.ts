import mammoth from "mammoth";
import path from "path";

// Polyfill for DOMMatrix in Node/Next.js environments where it is missing
if (typeof globalThis !== "undefined" && typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

import { PDFParse } from "pdf-parse";

// Set worker path to the absolute path in node_modules to avoid bundler loading issues in SSR/Next.js
const workerPath = path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
PDFParse.setWorker(workerPath);


export async function extractTextFromFile(buffer: Buffer, fileType: string): Promise<string> {
  if (fileType === "application/pdf") {
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    } catch (error: any) {
      console.error("PDF Parse Internal Error:", error);
      throw new Error("Failed to parse PDF file content");
    }
  } 
  
  if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type for extraction");
}
