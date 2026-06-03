/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger JSON payload limits for base64 file uploads
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not defined.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: safe JSON response parsing
function parseGenerativeJSON(text: string | undefined): any {
  if (!text) return null;
  // Strip potential markdown wrappers like ```json ... ```
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

// 1. Mobile phone login mock (for compliance with custom credential workflows)
app.post("/api/login", (req, res) => {
  const { phone, code } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "手机号不能为空" });
  }
  if (!code) {
    return res.status(400).json({ error: "验证码不能为空" });
  }
  // Standard simple phone code validation
  if (code !== "123456" && code !== "888888" && code.length !== 6) {
    return res.status(400).json({ error: "验证码错误，测试请输入 123456 或任意 6 位数字" });
  }

  // Create mock user
  return res.json({
    user: {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      phone: phone,
      createdAt: new Date().toISOString(),
    },
    token: "jwt_token_mock_" + Math.random().toString(36).substr(2, 15),
  });
});

// 2. JD Parse API (Job Description Parsing)
const jdSchema = {
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

app.post("/api/job-description/parse", async (req, res) => {
  const { rawContent } = req.body;
  if (!rawContent || rawContent.trim() === "") {
    return res.status(400).json({ error: "JD 原文内容不能为空" });
  }

  try {
    const prompt = `请深度解析以下招聘岗位JD，提取结构化的招聘信息，翻译并适配。JD原文如下：\n\n${rawContent}`;
    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是一个资深的猎头和招聘专家，对各类中文和英文技术、产品岗位职位描述有着超凡的感悟、提取与映射能力。请把内容提取为中文。",
        responseMimeType: "application/json",
        responseSchema: jdSchema,
      }
    });

    const parsed = parseGenerativeJSON(result.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("GD Parse error:", error);
    return res.status(500).json({ error: error?.message || "JD解析失败" });
  }
});

// 3. Resume Parse API (Uploader or Raw Paste)
const resumeSchema = {
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

app.post("/api/resume/parse", async (req, res) => {
  const { resumeText, fileBase64, mimeType } = req.body;

  try {
    let response;
    if (fileBase64) {
      // Direct PDF parsing natively with inlineData!
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
      // Plain text parsing
      if (!resumeText || resumeText.trim() === "") {
        return res.status(400).json({ error: "未检测到简历文本内容或文件" });
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
    return res.json(parsedContent);
  } catch (error: any) {
    console.error("Resume Parse error:", error);
    return res.status(500).json({ error: error?.message || "简历解析失败" });
  }
});

// 4. Resume Evaluation API
const evaluationSchema = {
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

app.post("/api/resume/evaluate", async (req, res) => {
  const { resumeContent, jdContent } = req.body;
  if (!resumeContent) {
    return res.status(400).json({ error: "简历内容缺失" });
  }
  if (!jdContent) {
    return res.status(400).json({ error: "岗位JD内容缺失" });
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
    return res.json(parsed);
  } catch (error: any) {
    console.error("Evaluation error:", error);
    return res.status(500).json({ error: error?.message || "匹配评估生成失败，请稍后重试" });
  }
});

// 5. Resume Optimize API (One-click tailor description matching the JD)
const optimizeSchema = {
  type: Type.OBJECT,
  properties: {
    content: resumeSchema, // Yields optimized structural content
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

app.post("/api/resume/optimize", async (req, res) => {
  const { resumeContent, jdContent, evaluationResult } = req.body;
  if (!resumeContent) {
    return res.status(400).json({ error: "简历数据缺失" });
  }
  if (!jdContent) {
    return res.status(400).json({ error: "目标JD数据缺失" });
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
    return res.json(parsed);
  } catch (error: any) {
    console.error("Optimization error:", error);
    return res.status(500).json({ error: error?.message || "简历一键多适配改写失败，请稍后刷新重试" });
  }
});

// Configure Vite or Static Serve in CWD
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode configuration with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware to serve static index.html and front-end scripts
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware in development mode.");
  } else {
    // Production Mode configuration
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Terra Resume Server successfully listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
