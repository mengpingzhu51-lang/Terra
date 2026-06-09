import { resumeSchema } from "@/lib/ai";
import { generateStructuredObject } from "@/lib/agent/structured-agent";
import { spawn } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { resumeText, fileBase64, fileName } = await req.json();

  let extractedText = resumeText;

  // 如果上传了文件，先解析文件内容（使用 Python pypdf，比 pdf-parse 在 Next.js 下更稳定）
  if (fileBase64) {
    try {
      extractedText = await parsePdfWithPython(fileBase64);
    } catch (error: any) {
      console.error("PDF parsing error:", error?.message || error);
      return Response.json(
        { error: `PDF 文件解析失败: ${error?.message || "未知错误"}` },
        { status: 400 }
      );
    }
  }

  if (!extractedText || extractedText.trim() === "") {
    return Response.json({ error: "未检测到简历文本内容或文件" }, { status: 400 });
  }

  try {
    const parsedContent = await generateStructuredObject({
      systemPrompt:
        "你是一个专业的简历结构化解析器。输入简历可能混乱或无排版，你要将其提炼、分类，并严格转换为合格的中文结构化格式返回。不得遗漏原文字眼中的教育起止时间、工作业绩数字等。",
      userPrompt: `以下是求职者贴入的简历原始内容，请对其进行解析整理：\n\n${extractedText}`,
      schema: resumeSchema,
      threadId: `resume-parse-${Date.now()}`,
    });

    return Response.json(parsedContent);
  } catch (error: any) {
    console.error("Resume Parse error:", error);
    return Response.json({ error: error?.message || "简历解析失败" }, { status: 500 });
  }
}

// 使用 Python pypdf 解析 PDF，返回提取的文本内容
async function parsePdfWithPython(fileBase64: string): Promise<string> {
  // 将 base64 解码后写入临时文件
  const base64Data = fileBase64.replace(/^data:application\/pdf;base64,/, "");
  const pdfBuffer = Buffer.from(base64Data, "base64");
  const tempPath = join(tmpdir(), `resume-parse-${Date.now()}.pdf`);
  writeFileSync(tempPath, pdfBuffer);

  return new Promise((resolve, reject) => {
    // 调用 Python 脚本解析 PDF
    const scriptPath = join(process.cwd(), "scripts", "parse_pdf.py");
    const pythonProcess = spawn("python3", [scriptPath, tempPath]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code: number) => {
      // 清理临时文件
      try { unlinkSync(tempPath); } catch (e) { /* 忽略删除失败 */ }

      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result.error) {
            reject(new Error(result.error));
          } else {
            resolve(result.text || "");
          }
        } catch (e) {
          // 如果不是 JSON，直接返回原始输出
          resolve(stdout.trim());
        }
      } else {
        reject(new Error(stderr || `Python 进程退出码: ${code}`));
      }
    });

    pythonProcess.on("error", (err: Error) => {
      try { unlinkSync(tempPath); } catch (e) { /* 忽略删除失败 */ }
      reject(new Error(`启动 Python 进程失败: ${err.message}`));
    });
  });
}
