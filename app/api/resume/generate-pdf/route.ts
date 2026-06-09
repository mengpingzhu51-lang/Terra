import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { resumeData, templateId = "simple" } = await req.json();

    if (!resumeData) {
      return NextResponse.json({ error: "missing resume data" }, { status: 400 });
    }

    const pdfBytes = await generatePdf(resumeData, templateId);

    const filename = (resumeData.basicInfo?.name || "resume").replace(/\s/g, "_");

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume_${filename}.pdf"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error?.message || "PDF generation failed" },
      { status: 500 }
    );
  }
}

// ── Pure Node.js PDF generation with pdfkit ────────────────────────────

function generatePdf(resume: any, templateId: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    const info = resume.basicInfo || {};
    const education = resume.education || [];
    const work = resume.workExperience || [];
    const projects = resume.projects || [];
    const skills = resume.skills || [];
    const summary = resume.summary || "";

    if (templateId === "technical") {
      generateTechnicalTemplate(doc, info, education, work, projects, skills, summary);
    } else if (templateId === "highlight") {
      generateHighlightTemplate(doc, info, education, work, projects, skills, summary);
    } else {
      generateSimpleTemplate(doc, info, education, work, projects, skills, summary);
    }

    doc.end();
  });
}

// ── Template: Simple ───────────────────────────────────────────────────────

function generateSimpleTemplate(
  doc: PDFKit.PDFDocument,
  info: any,
  education: any[],
  work: any[],
  projects: any[],
  skills: string[],
  summary: string
) {
  // Title / Name
  doc.fontSize(22).font("Helvetica-Bold").text(info.name || "", { align: "center" });
  doc.moveDown(0.2);

  // Contact line
  const contactParts = [info.phone, info.email, info.city].filter(Boolean);
  if (contactParts.length > 0) {
    doc.fontSize(10).font("Helvetica").text(contactParts.join("  |  "), { align: "center" });
    doc.moveDown(0.3);
  }
  if (info.links) {
    doc.fontSize(9).font("Helvetica").text(info.links, { align: "center" });
    doc.moveDown(0.3);
  }

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  // Intention
  if (info.intention) {
    sectionTitle(doc, "求职意向");
    doc.fontSize(11).font("Helvetica").text(info.intention);
    doc.moveDown(0.5);
  }

  // Education
  if (education.length > 0) {
    sectionTitle(doc, "教育经历");
    education.forEach((edu: any) => {
      doc.fontSize(11).font("Helvetica-Bold")
        .text(`${edu.school}  ·  ${edu.degree}  ·  ${edu.major}`);
      doc.fontSize(10).font("Helvetica")
        .text(`${edu.startDate || ""}  -  ${edu.endDate || ""}`);
      if (edu.description) {
        doc.fontSize(10).text(edu.description);
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Work Experience
  if (work.length > 0) {
    sectionTitle(doc, "工作经历");
    work.forEach((w: any) => {
      doc.fontSize(11).font("Helvetica-Bold")
        .text(`${w.company}  ·  ${w.position}`);
      doc.fontSize(10).font("Helvetica")
        .text(`${w.startDate || ""}  -  ${w.endDate || ""}`);
      if (w.content) {
        const lines = w.content.split("\n").filter((l: string) => l.trim());
        lines.forEach((line: string) => {
          doc.fontSize(10).font("Helvetica").text(`•  ${line.trim()}`);
        });
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Projects
  if (projects.length > 0) {
    sectionTitle(doc, "项目经历");
    projects.forEach((p: any) => {
      doc.fontSize(11).font("Helvetica-Bold")
        .text(`${p.name}  ·  ${p.role}`);
      doc.fontSize(10).font("Helvetica")
        .text(`${p.startDate || ""}  -  ${p.endDate || ""}`);
      if (p.background) {
        doc.fontSize(10).font("Helvetica-Bold").text("背景：" + p.background);
      }
      if (p.responsibilities) {
        doc.fontSize(10).font("Helvetica").text("职责：" + p.responsibilities);
      }
      if (p.results) {
        doc.fontSize(10).font("Helvetica").text("成果：" + p.results);
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Skills
  if (skills.length > 0) {
    sectionTitle(doc, "专业技能");
    doc.fontSize(10).font("Helvetica").text(skills.join("  |  "));
    doc.moveDown(0.5);
  }

  // Summary
  if (summary) {
    sectionTitle(doc, "自我评价");
    doc.fontSize(10).font("Helvetica").text(summary);
  }
}

// ── Template: Technical ───────────────────────────────────────────────────

function generateTechnicalTemplate(
  doc: PDFKit.PDFDocument,
  info: any,
  education: any[],
  work: any[],
  projects: any[],
  skills: string[],
  summary: string
) {
  // Header bar
  doc.rect(50, 40, 495, 60).fill("#1a1a2e");
  doc.fontSize(20).font("Helvetica-Bold").fillColor("#ffffff")
    .text(info.name || "", 50, 50, { align: "center", width: 495 });
  doc.fontSize(10).font("Helvetica").fillColor("#d0d0ff")
    .text([info.phone, info.email, info.city].filter(Boolean).join("  |  "), 50, 75, { align: "center", width: 495 });
  doc.fillColor("#000000");
  doc.y = 120;

  // Two-column layout
  const leftX = 50;
  const rightX = 300;
  const colWidth = 230;

  // Left column: Skills, Projects
  let leftY = doc.y;

  if (skills.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e")
      .text("专业技能", leftX, leftY);
    leftY = doc.y + 2;
    doc.moveTo(leftX, leftY).lineTo(leftX + colWidth, leftY).stroke();
    leftY += 5;
    doc.fontSize(9).font("Helvetica").fillColor("#000000");
    skills.forEach((s: string) => {
      doc.text(`•  ${s}`, leftX, leftY);
      leftY = doc.y + 2;
    });
    leftY += 10;
  }

  if (projects.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e")
      .text("项目经历", leftX, leftY);
    leftY = doc.y + 2;
    doc.moveTo(leftX, leftY).lineTo(leftX + colWidth, leftY).stroke();
    leftY += 5;
    projects.forEach((p: any) => {
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000")
        .text(`${p.name}  (${p.role})`, leftX, leftY);
      leftY = doc.y + 2;
      if (p.background) {
        doc.fontSize(9).font("Helvetica").text(p.background, leftX, leftY, { width: colWidth });
        leftY = doc.y + 2;
      }
      if (p.results) {
        doc.fontSize(9).font("Helvetica").text("成果：" + p.results, leftX, leftY, { width: colWidth });
        leftY = doc.y + 2;
      }
      leftY += 5;
    });
    leftY += 10;
  }

  // Right column: Work, Education
  let rightY = 120;

  if (work.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e")
      .text("工作经历", rightX, rightY);
    rightY = doc.y + 2;
    doc.moveTo(rightX, rightY).lineTo(rightX + colWidth, rightY).stroke();
    rightY += 5;
    work.forEach((w: any) => {
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000")
        .text(`${w.company}  -  ${w.position}`, rightX, rightY);
      rightY = doc.y + 2;
      doc.fontSize(9).font("Helvetica").text(`${w.startDate} - ${w.endDate}`, rightX, rightY);
      rightY = doc.y + 2;
      if (w.content) {
        const lines = w.content.split("\n").filter((l: string) => l.trim()).slice(0, 5);
        lines.forEach((line: string) => {
          doc.fontSize(8.5).font("Helvetica").text(line.trim(), rightX + 10, rightY, { width: colWidth - 10 });
          rightY = doc.y + 1;
        });
      }
      rightY += 5;
    });
    rightY += 10;
  }

  if (education.length > 0) {
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e")
      .text("教育经历", rightX, rightY);
    rightY = doc.y + 2;
    doc.moveTo(rightX, rightY).lineTo(rightX + colWidth, rightY).stroke();
    rightY += 5;
    education.forEach((edu: any) => {
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000")
        .text(`${edu.school}  ${edu.degree}`, rightX, rightY);
      rightY = doc.y + 2;
      doc.fontSize(9).font("Helvetica")
        .text(`${edu.startDate} - ${edu.endDate}  ${edu.major}`, rightX, rightY, { width: colWidth });
      rightY = doc.y + 5;
    });
  }

  // Summary at bottom
  if (summary) {
    const currentY = doc.y;
    const summaryY = Math.max(currentY, doc.y) + 20;
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a2e")
      .text("自我评价", 50, summaryY);
    doc.moveTo(50, doc.y + 2).lineTo(545, doc.y + 2).stroke();
    doc.fontSize(10).font("Helvetica").fillColor("#000000")
      .text(summary, 50, doc.y + 5, { width: 495 });
  }
}

// ── Template: Highlight ────────────────────────────────────────────────────

function generateHighlightTemplate(
  doc: PDFKit.PDFDocument,
  info: any,
  education: any[],
  work: any[],
  projects: any[],
  skills: string[],
  summary: string
) {
  // Top highlight bar
  doc.rect(50, 40, 495, 80).fill("#2563eb");
  doc.fontSize(24).font("Helvetica-Bold").fillColor("#ffffff")
    .text(info.name || "", 60, 50, { width: 475, align: "left" });
  let y = doc.y + 5;
  doc.fontSize(10).font("Helvetica").fillColor("#e0e7ff")
    .text([info.phone, info.email, info.city].filter(Boolean).join("  |  "), 60, y, { width: 475 });
  y = doc.y + 3;
  if (info.intention) {
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#bfdbfe")
      .text("意向：" + info.intention, 60, y, { width: 475 });
  }
  doc.fillColor("#000000");
  doc.y = 140;

  // Summary highlighted
  if (summary) {
    doc.rect(50, doc.y, 495, 50).fill("#eff6ff");
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e40af")
      .text("个人亮点", 60, doc.y + 5);
    doc.fontSize(9.5).font("Helvetica").fillColor("#1e3a8a")
      .text(summary, 60, doc.y + 2, { width: 475 });
    doc.fillColor("#000000");
    doc.y = doc.y + 10;
    doc.moveDown(0.5);
  }

  // Work Experience — highlighted
  if (work.length > 0) {
    sectionTitleHighlight(doc, "工作经历");
    work.forEach((w: any) => {
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e40af")
        .text(`${w.company}  ·  ${w.position}`, 60);
      doc.fontSize(10).font("Helvetica").fillColor("#4b5563")
        .text(`${w.startDate || ""}  -  ${w.endDate || ""}`);
      doc.fillColor("#000000");
      if (w.content) {
        const lines = w.content.split("\n").filter((l: string) => l.trim());
        lines.forEach((line: string) => {
          doc.fontSize(10).font("Helvetica").text(`▶  ${line.trim()}`);
        });
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Projects
  if (projects.length > 0) {
    sectionTitleHighlight(doc, "项目经历");
    projects.forEach((p: any) => {
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#1e40af")
        .text(`${p.name}  ·  ${p.role}`);
      doc.fillColor("#000000");
      if (p.background) {
        doc.fontSize(10).font("Helvetica").text("背景：" + p.background);
      }
      if (p.responsibilities) {
        doc.fontSize(10).font("Helvetica").text("职责：" + p.responsibilities);
      }
      if (p.results) {
        doc.fontSize(10).font("Helvetica-Bold").fillColor("#059669")
          .text("成果：" + p.results);
        doc.fillColor("#000000");
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(0.3);
  }

  // Skills
  if (skills.length > 0) {
    sectionTitleHighlight(doc, "专业技能");
    const skillsPerLine = 4;
    for (let i = 0; i < skills.length; i += skillsPerLine) {
      const line = skills.slice(i, i + skillsPerLine).join("    ");
      doc.fontSize(10).font("Helvetica").text(line);
    }
    doc.moveDown(0.5);
  }

  // Education
  if (education.length > 0) {
    sectionTitleHighlight(doc, "教育经历");
    education.forEach((edu: any) => {
      doc.fontSize(11).font("Helvetica-Bold")
        .text(`${edu.school}  ·  ${edu.degree}  ·  ${edu.major}`);
      doc.fontSize(10).font("Helvetica")
        .text(`${edu.startDate || ""}  -  ${edu.endDate || ""}`);
      if (edu.description) {
        doc.fontSize(10).text(edu.description);
      }
      doc.moveDown(0.3);
    });
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  doc.fontSize(13).font("Helvetica-Bold").text(title);
  const y = doc.y;
  doc.moveTo(50, y + 2).lineTo(545, y + 2).stroke();
  doc.moveDown(0.3);
}

function sectionTitleHighlight(doc: PDFKit.PDFDocument, title: string) {
  doc.rect(50, doc.y, 495, 20).fill("#2563eb");
  doc.fontSize(12).font("Helvetica-Bold").fillColor("#ffffff")
    .text(title, 60, doc.y + 5);
  doc.fillColor("#000000");
  doc.moveDown(0.5);
}
