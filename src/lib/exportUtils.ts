import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import jsPDF from "jspdf";

/**
 * Parses simple markdown and generates a DOCX Blob.
 * Handles headings, bold text, and bullet points for a clean, ATS-friendly format.
 */
export async function generateDocx(markdownText: string): Promise<Blob> {
  const lines = markdownText.split("\n");
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      paragraphs.push(new Paragraph({ text: "" })); // Empty line for spacing
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      paragraphs.push(new Paragraph({
        text: line.replace("# ", ""),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }));
    } else if (line.startsWith("## ")) {
      paragraphs.push(new Paragraph({
        text: line.replace("## ", ""),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200 },
      }));
    } else if (line.startsWith("### ")) {
      paragraphs.push(new Paragraph({
        text: line.replace("### ", ""),
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100 },
      }));
    } else {
      // Bullet points
      const isBullet = line.startsWith("- ") || line.startsWith("* ");
      const cleanLine = isBullet ? line.substring(2) : line;

      // Bold parsing: splits "**text**" into segments
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const textRuns = parts.filter(p => p).map(part => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return new TextRun({
            text: part.replace(/\*\*/g, ""),
            bold: true,
            font: "Arial",
            size: 22, // 11pt
          });
        }
        return new TextRun({
          text: part,
          font: "Arial",
          size: 22,
        });
      });

      paragraphs.push(new Paragraph({
        children: textRuns,
        bullet: isBullet ? { level: 0 } : undefined,
        spacing: { after: 120 },
      }));
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates a clean, ATS-friendly PDF from markdown text.
 * Uses a simple text layout to ensure readability by parsers.
 */
export function generatePdf(markdownText: string): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter"
  });

  doc.setFont("helvetica");
  
  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  
  let y = margin;
  const lines = markdownText.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Page break logic
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    if (!line) {
      y += 12; // Small gap for empty lines
      continue;
    }

    // Basic Markdown handling for PDF
    let textToPrint = line;
    let fontSize = 11;
    let isBold = false;
    let xOffset = margin;

    if (line.startsWith("# ")) {
      textToPrint = line.replace("# ", "");
      fontSize = 20;
      isBold = true;
      // Center H1
      const textWidth = doc.getTextWidth(textToPrint);
      xOffset = (pageWidth - textWidth) / 2;
      y += 10;
    } else if (line.startsWith("## ")) {
      textToPrint = line.replace("## ", "");
      fontSize = 16;
      isBold = true;
      y += 10;
    } else if (line.startsWith("### ")) {
      textToPrint = line.replace("### ", "");
      fontSize = 14;
      isBold = true;
      y += 5;
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      textToPrint = "• " + line.substring(2);
      xOffset = margin + 10; // Indent bullets
    }

    // Crude bold removal for standard lines
    if (textToPrint.includes("**")) {
      textToPrint = textToPrint.replace(/\*\*/g, ""); // Remove bold markers for simple PDF
    }

    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(fontSize);

    // Split text if it exceeds page width
    const splitText = doc.splitTextToSize(textToPrint, maxLineWidth - (xOffset - margin));
    
    for (let j = 0; j < splitText.length; j++) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitText[j], xOffset, y);
      y += fontSize * 1.2;
    }
    
    y += 5; // Paragraph spacing
  }

  return doc.output("blob");
}
