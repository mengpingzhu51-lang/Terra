import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `你是 Terra 简历平台的 AI 助手。你擅长：
- 简历撰写与优化建议
- 职位分析与匹配评估
- 面试准备与职业规划
- 求职相关的各类问题

请用中文回答用户的问题，保持专业、友好、简洁。如果用户的问题与求职无关，你也可以一般性地回答，但应自然地引导回职业发展话题。`;

export async function POST(req: Request) {
  const body = await req.json();
  const { messages } = body as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!messages?.length) {
    return Response.json({ error: "消息不能为空" }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "服务端未配置 OPENROUTER_API_KEY" }, { status: 500 });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.LANGGRAPH_LLM_BASE_URL || "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.APP_URL || "https://terra-ashy.vercel.app",
      "X-Title": "Terra Resume Platform",
    },
  });

  const stream = await client.chat.completions.create({
    model: process.env.LANGGRAPH_LLM_MODEL || "moonshotai/kimi-k2",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
