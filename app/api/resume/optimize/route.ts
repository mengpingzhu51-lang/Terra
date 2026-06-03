import { ai, optimizeSchema, parseGenerativeJSON } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { resumeContent, jdContent, evaluationResult } = await req.json();

  if (!resumeContent) {
    return Response.json({ error: "简历数据缺失" }, { status: 400 });
  }
  if (!jdContent) {
    return Response.json({ error: "目标JD数据缺失" }, { status: 400 });
  }

  try {
    const prompt = `请执行简历的智能高适配一键优化改写。
    任务目标：
    在确保内容完全尊重候选人过往历史履历真实性（切不可虚增、捏造未曾服务过的公司名、未获得的学历学位，也绝不无中生有编造全新工作起止日期等）的前提下，基于你对该职位【岗位JD要求】的掌握，以及该份【智能匹配评估报告】的建议，大幅度提高简历的业务匹配度和语言表达专业度。
    把原工作职责改为结果导向、包含STAR原则的精美言辞。融合【缺失的关键词】，确保技术栈在工作或项目描述中得到合理强调。
    
    【原简历结构化数据】：
    ${JSON.stringify(resumeContent, null, 2)}
    
    【岗位JD要求】：
    ${JSON.stringify(jdContent, null, 2)}
    
    【评估漏洞分析】：
    ${JSON.stringify(evaluationResult, null, 2)}`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是一个世界知名科技大厂前资深招聘专家，也是一名极致的简历金牌修改师。你十分懂得在维持真实底线的基础上，优化表述格式。让工作产出饱含架构技术硬核与极佳的量化数字、对齐各种热点敏捷或现代最佳工具生态。请改写候选人简历中过于冗长琐碎或枯燥、缺少数字的工作经历与项目职责，并输出前后的diff对比以便用户查看。结果必须完全满足JSON schema定义，中文回答。",
        responseMimeType: "application/json",
        responseSchema: optimizeSchema,
      }
    });

    const parsed = parseGenerativeJSON(result.text);
    return Response.json(parsed);
  } catch (error: any) {
    console.error("Optimization error:", error);
    return Response.json({ error: error?.message || "简历一键多适配改写失败，请稍后刷新重试" }, { status: 500 });
  }
}
