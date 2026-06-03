import { resumeSchema } from "@/lib/ai";
import { generateStructuredObject } from "@/lib/agent/structured-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { resumeText, fileBase64 } = await req.json();

  if (fileBase64) {
    return Response.json(
      { error: "当前 OpenRouter 默认模型暂不支持直接解析 PDF/图片文件，请先粘贴简历文本内容。" },
      { status: 400 }
    );
  }

  if (!resumeText || resumeText.trim() === "") {
    return Response.json({ error: "未检测到简历文本内容或文件" }, { status: 400 });
  }

  try {
    const parsedContent = await generateStructuredObject({
      systemPrompt: "你是一个专业的简历结构化解析器。输入简历可能混乱或无排版，你要将其提炼、分类，并严格转换为合格的中文结构化格式返回。不得遗漏原文字眼中的教育起止时间、工作业绩数字等。",
      userPrompt: `以下是求职者贴入的简历原始内容，请对其进行解析整理：\n\n${resumeText}`,
      schema: resumeSchema,
      threadId: `resume-parse-${Date.now()}`,
    });

    return Response.json(parsedContent);
  } catch (error: any) {
    console.error("Resume Parse error:", error);
    return Response.json({ error: error?.message || "简历解析失败" }, { status: 500 });
  }
}
