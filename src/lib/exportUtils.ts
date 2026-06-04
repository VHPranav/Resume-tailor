import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import jsPDF from "jspdf";

/**
 * Detects if a line is a section header in standard resume formats.
 */
function isSectionHeader(line: string): { isHeader: boolean; level: number; cleanText: string } {
  const trimmed = line.trim();
  if (trimmed.startsWith("# ")) {
    return { isHeader: true, level: 1, cleanText: trimmed.replace("# ", "") };
  }
  if (trimmed.startsWith("## ")) {
    return { isHeader: true, level: 2, cleanText: trimmed.replace("## ", "") };
  }
  if (trimmed.startsWith("### ")) {
    return { isHeader: true, level: 3, cleanText: trimmed.replace("### ", "") };
  }

  // Detect bold section headers like **EXPERIENCE** or **TECHNICAL SKILLS**
  const isBoldHeader = trimmed.startsWith("**") && trimmed.endsWith("**");
  const cleanText = isBoldHeader ? trimmed.slice(2, -2).trim() : trimmed;
  
  const sectionKeywords = [
    "EXPERIENCE", "SUMMARY", "PROJECTS", "EDUCATION", "SKILLS",
    "BUILDS", "CONTACT", "AWARDS", "STRENGTHS", "INTERESTS",
    "WORK", "EMPLOYMENT", "CERTIFICATIONS", "LANGUAGES", "ACHIEVEMENTS"
  ];
  
  const upperClean = cleanText.toUpperCase();
  const matchesKeyword = sectionKeywords.some(keyword => upperClean.includes(keyword));
  
  if (cleanText.length > 0 && cleanText.length < 35 && matchesKeyword) {
    return { isHeader: true, level: 2, cleanText };
  }

  return { isHeader: false, level: 0, cleanText: trimmed };
}

/**
 * Parses simple markdown and generates a DOCX Blob.
 * Handles headings, bold/italic text, and bullet points for a clean, premium, ATS-friendly format.
 */
export async function generateDocx(markdownText: string): Promise<Blob> {
  const lines = markdownText.split("\n");
  const paragraphs: Paragraph[] = [];

  let isFirstNonEmpty = true;
  let isSecondNonEmpty = false;
  let isThirdNonEmpty = false;

  function parseLineToTextRuns(text: string, font: string = "Calibri", size: number = 21): TextRun[] {
    const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g);
    return parts
      .filter(p => p.length > 0)
      .map(part => {
        let cleanText = part;
        let bold = false;
        let italics = false;
        if (part.startsWith("***") && part.endsWith("***")) {
          cleanText = part.slice(3, -3);
          bold = true;
          italics = true;
        } else if (part.startsWith("**") && part.endsWith("**")) {
          cleanText = part.slice(2, -2);
          bold = true;
        } else if (part.startsWith("*") && part.endsWith("*")) {
          cleanText = part.slice(1, -1);
          italics = true;
        }
        return new TextRun({
          text: cleanText,
          bold,
          italics,
          font,
          size,
        });
      });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    const headerInfo = isSectionHeader(line);

    // Cancel subtitle/contact flags if a section header is found
    if (headerInfo.isHeader) {
      isFirstNonEmpty = false;
      isSecondNonEmpty = false;
      isThirdNonEmpty = false;
    }

    if (isFirstNonEmpty) {
      isFirstNonEmpty = false;
      isSecondNonEmpty = true;
      const cleanName = line.replace(/^\*\*|\*\*$/g, "").trim();
      
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: cleanName,
            bold: true,
            font: "Calibri",
            size: 38, // 19pt
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 120 }
      }));
      continue;
    }

    if (isSecondNonEmpty) {
      isSecondNonEmpty = false;
      isThirdNonEmpty = true;
      const cleanSubtitle = line.replace(/^\*\*|\*\*$/g, "").trim();
      
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: cleanSubtitle,
            font: "Calibri",
            size: 19, // 9.5pt
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 }
      }));
      continue;
    }

    if (isThirdNonEmpty) {
      isThirdNonEmpty = false;
      const cleanContact = line.replace(/^\*\*|\*\*$/g, "").trim();
      
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: cleanContact,
            font: "Calibri",
            size: 18, // 9pt
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 } // Larger gap after header contact block
      }));
      continue;
    }

    if (headerInfo.isHeader) {
      if (headerInfo.level === 2) {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: headerInfo.cleanText.toUpperCase(),
              bold: true,
              font: "Calibri",
              size: 23, // 11.5pt
            })
          ],
          heading: HeadingLevel.HEADING_2,
          border: {
            bottom: {
              color: "CCCCCC",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6, // 1/8 pt
            }
          },
          spacing: { before: 240, after: 120 }
        }));
      } else if (headerInfo.level === 3) {
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({
              text: headerInfo.cleanText,
              bold: true,
              font: "Calibri",
              size: 20, // 10pt
            })
          ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 140, after: 80 }
        }));
      }
      continue;
    }

    // Normal paragraph or bullet point
    const isBullet = line.startsWith("- ") || line.startsWith("* ");
    const cleanLine = isBullet ? line.substring(2).trim() : line;
    const textRuns = parseLineToTextRuns(cleanLine, "Calibri", 21); // 10.5pt

    paragraphs.push(new Paragraph({
      children: textRuns,
      bullet: isBullet ? { level: 0 } : undefined,
      spacing: { after: 80 }
    }));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1080, // 0.75 in
            bottom: 1080,
            left: 1080,
            right: 1080,
          }
        }
      },
      children: paragraphs,
    }],
  });

  return await Packer.toBlob(doc);
}

/**
 * Generates a clean, beautifully typeset, ATS-friendly PDF from markdown text.
 * Maintains full support for inline styling (bold, italic, and bold-italic).
 */
export function generatePdf(markdownText: string): Blob {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter"
  });

  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;
  
  let y = margin;
  const lines = markdownText.split("\n");
  
  let isFirstNonEmpty = true;
  let isSecondNonEmpty = false;
  let isThirdNonEmpty = false;

  function parseLineToTokens(text: string) {
    const parts = text.split(/(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*)/g);
    return parts
      .filter(p => p.length > 0)
      .map(part => {
        if (part.startsWith("***") && part.endsWith("***")) {
          return { text: part.slice(3, -3), bold: true, italic: true };
        } else if (part.startsWith("**") && part.endsWith("**")) {
          return { text: part.slice(2, -2), bold: true, italic: false };
        } else if (part.startsWith("*") && part.endsWith("*")) {
          return { text: part.slice(1, -1), bold: false, italic: true };
        }
        return { text: part, bold: false, italic: false };
      });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      continue;
    }

    const headerInfo = isSectionHeader(line);

    // Cancel subtitle/contact flags if a section header is found
    if (headerInfo.isHeader) {
      isFirstNonEmpty = false;
      isSecondNonEmpty = false;
      isThirdNonEmpty = false;
    }

    if (isFirstNonEmpty) {
      isFirstNonEmpty = false;
      isSecondNonEmpty = true;
      const cleanName = line.replace(/^\*\*|\*\*$/g, "").trim();
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      const textWidth = doc.getTextWidth(cleanName);
      doc.text(cleanName, (pageWidth - textWidth) / 2, y);
      y += 20;
      continue;
    }

    if (isSecondNonEmpty) {
      isSecondNonEmpty = false;
      isThirdNonEmpty = true;
      const cleanSubtitle = line.replace(/^\*\*|\*\*$/g, "").trim();
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      const textWidth = doc.getTextWidth(cleanSubtitle);
      doc.text(cleanSubtitle, (pageWidth - textWidth) / 2, y);
      y += 14;
      continue;
    }

    if (isThirdNonEmpty) {
      isThirdNonEmpty = false;
      const cleanContact = line.replace(/^\*\*|\*\*$/g, "").trim();
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const textWidth = doc.getTextWidth(cleanContact);
      doc.text(cleanContact, (pageWidth - textWidth) / 2, y);
      y += 24;
      continue;
    }

    if (headerInfo.isHeader) {
      if (y > pageHeight - margin - 60) {
        doc.addPage();
        y = margin;
      }

      if (headerInfo.level === 2) {
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        
        const sectionTitle = headerInfo.cleanText.toUpperCase();
        doc.text(sectionTitle, margin, y);
        
        y += 4;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 12;
      } else if (headerInfo.level === 3) {
        y += 6;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(headerInfo.cleanText, margin, y);
        y += 12;
      }
      continue;
    }

    // Bullet points
    const isBullet = line.startsWith("- ") || line.startsWith("* ");
    const cleanLine = isBullet ? line.substring(2).trim() : line;
    const startX = isBullet ? margin + 12 : margin;
    const bulletChar = "•";
    
    if (isBullet) {
      if (y > pageHeight - margin - 15) {
        doc.addPage();
        y = margin;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.text(bulletChar, margin + 2, y);
    }

    // Wrap inline styled chunks
    const tokens = parseLineToTokens(cleanLine);
    const words: { text: string; bold: boolean; italic: boolean; space: boolean }[] = [];
    
    for (const token of tokens) {
      const splitWords = token.text.split(" ");
      for (let k = 0; k < splitWords.length; k++) {
        words.push({
          text: splitWords[k],
          bold: token.bold,
          italic: token.italic,
          space: k < splitWords.length - 1 || token.text.endsWith(" ")
        });
      }
    }

    let currentX = startX;
    const rightBoundary = pageWidth - margin;
    const fontSize = 9.5;
    doc.setFontSize(fontSize);

    for (let j = 0; j < words.length; j++) {
      const word = words[j];
      let style = "normal";
      if (word.bold && word.italic) style = "bolditalic";
      else if (word.bold) style = "bold";
      else if (word.italic) style = "italic";

      doc.setFont("helvetica", style);

      const wordText = word.text + (word.space ? " " : "");
      const wordWidth = doc.getTextWidth(wordText);

      if (currentX + wordWidth > rightBoundary) {
        y += fontSize * 1.25;
        currentX = startX;

        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      }

      doc.text(wordText, currentX, y);
      currentX += wordWidth;
    }

    y += fontSize * 1.25 + 3; // Line height + paragraph spacing
  }

  return doc.output("blob");
}
