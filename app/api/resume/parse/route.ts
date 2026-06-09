import { resumeSchema } from "@/lib/ai";
import { generateStructuredObject } from "@/lib/agent/structured-agent";

// pdf2json 没有 worker依赖，在 Next.js 下可正常运行
const PDFParser = require("pdf2json");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { resumeText, fileBase64 } = await req.json();

  let extractedText = resumeText;

  if (fileBase64) {
    try {
      extractedText = await parsePdfWithNode(fileBase64);
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

// 使用 Node.js pdf2json 解析 PDF，返回提取的纯文本
async function parsePdfWithNode(fileBase64: string): Promise<string> {
  // 去除 data URI 前缀，将 base64 解码为 Buffer
  const base64Data = fileBase64.replace(/^data:.*?;base64,/, "");
  const pdfBuffer = Buffer.from(base64Data, "base64");

  return new Promise((resolve, reject) => {
    const parser = new PDFParser();

    parser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError || "PDF 解析失败"));
    });

    parser.on("pdfParser_dataReady", (pdfData: any) => {
      // getRawTextContent() 返回纯文本
      const text = parser.getRawTextContent();
      resolve(text || "");
    });

    parser.parseBuffer(pdfBuffer);
  });
}
