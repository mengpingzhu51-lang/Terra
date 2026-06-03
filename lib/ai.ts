import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

export const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export function parseGenerativeJSON(text: string | undefined): any {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(cleaned.indexOf("\n") + 1);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.lastIndexOf("```"));
  }
  cleaned = cleaned.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse Gemini json output. Raw output was:", text);
    throw new Error("模型返回的JSON格式有误，请重试。");
  }
}

export const jdSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "岗位名称" },
    company: { type: Type.STRING, description: "公司名称，如果无法提取，则为空" },
    responsibilities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "该职位的核心岗位职责（分条目列出，去掉多余的前缀和空格）"
    },
    requirements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "核心任职要求（包括工作背景、专业资质等，分条目列出）"
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "提取JD中含有的硬技能（如 React、Docker、Figma等）、软技能（协作、敏捷）、常用工具和相关业务名词"
    },
    experienceRequirement: { type: Type.STRING, description: "工作年限要求，比如：3-5年、5年以上或不限" },
    educationRequirement: { type: Type.STRING, description: "学历资格门槛，比如：大专、本科以上、硕士等或不限" }
  },
  required: ["title", "responsibilities", "requirements", "keywords"]
};

export const resumeSchema = {
  type: Type.OBJECT,
  properties: {
    basicInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "候选人姓名" },
        phone: { type: Type.STRING, description: "手机号，若缺失可给空字符串" },
        email: { type: Type.STRING, description: "电子邮箱，若缺失可给空字符串" },
        city: { type: Type.STRING, description: "所在城市/工作常驻城市，若缺失可以给出空字符串" },
        intention: { type: Type.STRING, description: "求职意向/目标职位，若缺失请根据工作经验进行合理推测并提炼出来占位" },
        links: { type: Type.STRING, description: "个人主页、博客、GitHub 链接、Dribbble 链接等" }
      },
      required: ["name", "phone", "email", "city", "intention"]
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          school: { type: Type.STRING, description: "大学/高职等学校名称" },
          degree: { type: Type.STRING, description: "学历如：本科、硕士、大专等" },
          major: { type: Type.STRING, description: "专业名称" },
          startDate: { type: Type.STRING, description: "开始时间，格式：如 2016.09 或 2016-09" },
          endDate: { type: Type.STRING, description: "毕业时间，格式：如 2020.06 或 至今" },
          description: { type: Type.STRING, description: "在校主修、GPA、所获荣誉、社团职责等" }
        },
        required: ["school", "degree", "major", "startDate", "endDate"]
      }
    },
    workExperience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING, description: "公司名称" },
          position: { type: Type.STRING, description: "担任职级/岗位名称" },
          startDate: { type: Type.STRING, description: "入职时间，格式：如 2020.07" },
          endDate: { type: Type.STRING, description: "离职时间或至今，格式：如 2023.10 或 至今" },
          content: { type: Type.STRING, description: "工作职责、日常负责模块、核心业绩成果、STAR条目（换行排版）" }
        },
        required: ["company", "position", "startDate", "endDate", "content"]
      }
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "项目名称" },
          role: { type: Type.STRING, description: "你在项目中承担的角色，如果无写则填主要研发或产品经理等" },
          startDate: { type: Type.STRING, description: "项目开始时间" },
          endDate: { type: Type.STRING, description: "项目结束时间" },
          background: { type: Type.STRING, description: "立项初衷、所要解决的痛点及背景，一两句话简述" },
          responsibilities: { type: Type.STRING, description: "个人具体的研发或核心工作，写清楚涉及到的技能和架构" },
          results: { type: Type.STRING, description: "项目所成：如QPS提升、加载提速、带来多少用户等，尽可能包含数据量化指标" }
        },
        required: ["name", "role", "startDate", "endDate"]
      }
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "提取提取并归纳候选人掌握的所有核心技术栈、工具链、硬技能以及通用证书"
    },
    summary: { type: Type.STRING, description: "自我提炼，候选人个人特点与竞争力和综合亮点提炼" }
  },
  required: ["basicInfo", "education", "workExperience", "projects", "skills"]
};

export const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.INTEGER, description: "综合匹配质量得分（0-100之间），对应总体匹配度" },
    dimensionScores: {
      type: Type.OBJECT,
      properties: {
        skills: { type: Type.INTEGER, description: "技能契合度得分（0-100）" },
        experience: { type: Type.INTEGER, description: "工作或项目经验相关度得分（0-100）" },
        responsibility: { type: Type.INTEGER, description: "职责经历相称度得分（0-100）" },
        industry: { type: Type.INTEGER, description: "行业、业务背景熟悉度得分（0-100）" },
        achievement: { type: Type.INTEGER, description: "成果与量化数据表达得分（0-100）" }
      },
      required: ["skills", "experience", "responsibility", "industry", "achievement"]
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "三大核心优势要点（应基于简历中真实突出的实绩或极为吻合的技术背景逐一论据）"
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "三大主要劣势或契合不佳的地方（应点出：缺少某工具栈、缺少某大型平台经验、经历抽象、缺少量化数据支撑等）"
    },
    risks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "需要候选人特别防范的雷区/不匹配项（比如学历资格门槛、年限跨度、行业转变难度等，如果确实没有极大硬伤，可放1-2条软性提示）"
    },
    keywordMatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING, description: "提取的JD代表性关键词" },
          required: { type: Type.BOOLEAN, description: "是否是该岗位JD强硬要求的核心（比如React对前端必选，敏捷习惯只是可加分项）" },
          match: { type: Type.BOOLEAN, description: "简历中是否有此关键词（若有极类似提及可视为是）" },
          suggestion: { type: Type.STRING, description: "给出具体改进或保留并结合岗位叙述的建议" }
        },
        required: ["keyword", "required", "match", "suggestion"]
      }
    },
    missingKeywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "简历里完全缺失的、岗位却在JD中多次提及的高频硬技能或职责重点词汇列表"
    },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING, description: "改写建议对应的目标板块，例如：工作经历 - 腾讯、项目经历 - xx电商平台、基本信息、技能证书等" },
          issue: { type: Type.STRING, description: "现有内容的主要不足或可提炼痛点" },
          suggestion: { type: Type.STRING, description: "应该如何运用STAR原则重构的修改方针、融合的具体关键词" },
          exampleRewrite: { type: Type.STRING, description: "最关键的改写后范本陈述，必须高度符合原工作描述细节并在其中强化该板块" }
        },
        required: ["section", "issue", "suggestion", "exampleRewrite"]
      }
    }
  },
  required: ["totalScore", "dimensionScores", "strengths", "weaknesses", "risks", "keywordMatches", "missingKeywords", "suggestions"]
};

export const optimizeSchema = {
  type: Type.OBJECT,
  properties: {
    content: resumeSchema,
    diffSummary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING, description: "发生变化的简历模块" },
          before: { type: Type.STRING, description: "修改前的原文字眼/整句" },
          after: { type: Type.STRING, description: "AI优化重写后的高含金量文字/整句" },
          reason: { type: Type.STRING, description: "优化原因，例如：对齐JD职责、补充Star业绩、织入缺失技能等" }
        },
        required: ["section", "before", "after", "reason"]
      }
    }
  },
  required: ["content", "diffSummary"]
};
