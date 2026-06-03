import { ai, parseGenerativeJSON, resumeSchema } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { resumeText, fileBase64, mimeType } = await req.json();

  try {
    let response;
    if (fileBase64) {
      const pdfPart = {
        inlineData: {
          mimeType: mimeType || "application/pdf",
          data: fileBase64,
        },
      };
      const textPromptPart = {
        text: "请深度分析并析出上传简历文件中的全部相关信息。必须严格根据原意进行清洗提炼，归属到教育、工作、项目、以及基础信息等板块中。不要遗漏任何细节。"
      };

      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [pdfPart, textPromptPart] },
        config: {
          systemInstruction: "你是一个专业的简历内容结构化系统，能够对任何求职者上传的PDF或图片简历进行精准内容还原。输出必须是符合给定 JSON 格式要求的完整信息，禁止胡乱捏造缺失的信息，没有填写的字段可用空字符串填充。",
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
        }
      });
    } else {
      if (!resumeText || resumeText.trim() === "") {
        return Response.json({ error: "未检测到简历文本内容或文件" }, { status: 400 });
      }

      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `以下是求职者贴入的简历原始内容，请对其进行解析整理：\n\n${resumeText}`,
        config: {
          systemInstruction: "你是一个专业的简历结构化解析器。输入简历可能混乱或无排版，你要将其提炼、分类，并严格转换为合格的中文结构化格式返回。不得遗漏原文字眼中的教育起止时间、工作业绩数字等。",
          responseMimeType: "application/json",
          responseSchema: resumeSchema,
        }
      });
    }

    const parsedContent = parseGenerativeJSON(response.text);
    return Response.json(parsedContent);
  } catch (error: any) {
    console.error("Resume Parse error:", error);
    return Response.json({ error: error?.message || "简历解析失败" }, { status: 500 });
  }
}
