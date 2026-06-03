import { ai, evaluationSchema, parseGenerativeJSON } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { resumeContent, jdContent } = await req.json();

  if (!resumeContent) {
    return Response.json({ error: "简历内容缺失" }, { status: 400 });
  }
  if (!jdContent) {
    return Response.json({ error: "岗位JD内容缺失" }, { status: 400 });
  }

  try {
    const prompt = `请协助对该求职者的简历与目标岗位的JD要求进行360度专业的交叉评估、技能覆盖情况、岗位痛点契合度审阅。
    【候选人简历数据】如下：
    ${JSON.stringify(resumeContent, null, 2)}
    
    【岗位招聘需求JD数】如下：
    ${JSON.stringify(jdContent, null, 2)}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是一个最顶级的HRD与大厂面试官，拥有审视候选人经历契合度的犀利眼光。请从客观事实出发，找出亮点与雷区，并依据STAR原则（背景、任务、动作、成果）给出精准的、令人信服的、切中JD要求的各项匹配评分与针对性改写指南。注意：分条清晰、内容饱满，且结果必须完全符合JSON结构定义。",
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
      }
    });

    const parsed = parseGenerativeJSON(result.text);
    return Response.json(parsed);
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return Response.json({ error: error?.message || "匹配评估生成失败，请稍后重试" }, { status: 500 });
  }
}
