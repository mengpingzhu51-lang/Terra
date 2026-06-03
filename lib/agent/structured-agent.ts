import { END, START, StateGraph, MemorySaver, MessagesAnnotation } from "@langchain/langgraph";
import { createOpenRouterModel } from "./openrouter";
import { parseGenerativeJSON } from "@/lib/ai";

const model = createOpenRouterModel();

async function callModel(state: typeof MessagesAnnotation.State) {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("generate", callModel)
  .addEdge(START, "generate")
  .addEdge("generate", END);

const memory = new MemorySaver();
const structuredAgent = workflow.compile({ checkpointer: memory });

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text: unknown }).text);
        }
        return "";
      })
      .join("\n");
  }
  return String(content ?? "");
}

export async function generateStructuredObject<T>({
  systemPrompt,
  userPrompt,
  schema,
  threadId,
}: {
  systemPrompt: string;
  userPrompt: string;
  schema: unknown;
  threadId: string;
}): Promise<T> {
  const schemaText = JSON.stringify(schema, null, 2);
  const result = await structuredAgent.invoke(
    {
      messages: [
        {
          role: "system",
          content: `${systemPrompt}\n\n你必须只输出一个可被 JSON.parse 解析的 JSON 对象。不要输出 Markdown、解释、前后缀或代码块。JSON 必须满足以下 schema：\n${schemaText}`,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    },
    {
      configurable: {
        thread_id: threadId,
      },
    }
  );

  const lastMessage = result.messages[result.messages.length - 1];
  return parseGenerativeJSON(contentToText(lastMessage.content)) as T;
}
