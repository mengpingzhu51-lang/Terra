import { spawn } from "child_process";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { resumeData, templateId = "simple" } = await req.json();

    if (!resumeData) {
      return Response.json({ error: "missing resume data" }, { status: 400 });
    }

    const pdfBytes = await generatePdfWithPython(resumeData, templateId);

    const filename = (resumeData.basicInfo?.name || "download").replace(/\s/g, "_");

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume_${filename}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return Response.json(
      { error: error?.message || "PDF generation failed" },
      { status: 500 }
    );
  }
}

async function generatePdfWithPython(resumeData: any, templateId: string): Promise<Buffer> {
  const scriptPath = require("path").join(process.cwd(), "scripts", "generate_resume_pdf.py");

  return new Promise((resolve, reject) => {
    const proc = spawn("python3", [scriptPath, JSON.stringify(resumeData), templateId]);

    let stdout = Buffer.alloc(0);
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout = Buffer.concat([stdout, data]);
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code: number) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(stderr || `Python exited with code ${code}`));
      }
    });

    proc.on("error", (err: Error) => {
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
}
