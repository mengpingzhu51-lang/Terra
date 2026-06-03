import { jdSchema } from "@/lib/ai";
import { generateStructuredObject } from "@/lib/agent/structured-agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { rawContent } = await req.json();

  if (!rawContent || rawContent.trim() === "") {
    return Response.json({ error: "JD 原文内容不能为空" }, { status: 400 });
  }

  try {
    const prompt = `请深度解析以下招聘岗位JD，提取结构化的招聘信息，翻译并适配。JD原文如下：\n\n${rawContent}`;
    const parsed = await generateStructuredObject({
      systemPrompt: "你是一个资深的猎头和招聘专家，对各类中文和英文技术、产品岗位职位描述有着超凡的感悟、提取与映射能力。请把内容提取为中文。",
      userPrompt: prompt,
      schema: jdSchema,
      threadId: `jd-parse-${Date.now()}`,
    });

    return Response.json(parsed);
  } catch (error: any) {
    console.error("JD Parse error:", error);
    return Response.json({ error: error?.message || "JD解析失败" }, { status: 500 });
  }
}
