/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Resume, JobDescription, Evaluation, GenerationRecord } from './types';

export const INITIAL_RESUMES: Resume[] = [
  {
    id: "res_senior_ux",
    userId: "demo_user",
    title: "资深用户体验设计师 - 科技大厂",
    templateId: "simple",
    versionType: "original",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    content: {
      basicInfo: {
        name: "李明",
        phone: "138-0000-0000",
        email: "liming@example.com",
        city: "深圳市，南山区",
        intention: "资深用户体验设计师 (Senior UX Designer)"
      },
      education: [
        {
          id: "edu_1",
          school: "华南理工大学",
          degree: "本科",
          major: "计算机科学与技术",
          startDate: "2016-09",
          endDate: "2020-06",
          description: "专业排名前 10%，曾获两次校级一等奖学金，主修人机交互、UI/UX 设计、前端开发原理。"
        }
      ],
      workExperience: [
        {
          id: "work_1",
          company: "星海科技有限公司",
          position: "高级前端与 UX 设计师",
          startDate: "2020-07",
          endDate: "2023-10",
          content: "• 主导公司核心 SaaS 平台的前端架构设计与用户体验优化，采用 Vue3 + TypeScript 技术栈。\n• 优化首屏加载速度，通过混淆、打包体积优化与预加载，使页面加载性能提升 40%。\n• 带领 3 人交互小组，推行组件化设计规范体系（Design System），沉淀超过 40+ 业务组件，开发效率提速 25%。"
        }
      ],
      projects: [
        {
          id: "proj_1",
          name: "新一代智能协作看板系统",
          role: "交互与前端开发主导",
          startDate: "2021-03",
          endDate: "2022-05",
          background: "由于旧看板系统卡顿、操作复杂，难以支撑千人团队在复杂数据量下的协同，亟需重构体验。",
          responsibilities: "设计高灵敏度的拖拽交互与视图层动态计算模型，重塑看板数据看板操作流线；运用 Webpack 深入性能调优。",
          results: "交付后整体报错率降低了 15%，日常交互延时由原 320ms 下滑到 45ms 以内，被集团评为年度优秀体验项目。"
        }
      ],
      skills: ["Figma", "Sketch", "Framer", "Vue3", "TypeScript", "人机交互", "Webpack/Vite", "Design Systems"],
      summary: "四年多专注在 B 端 SaaS 领域的高级交互设计与前端工程，兼备完美的产品感、美学追求与代码落地能力。追求用极致的技术与柔情的设计真正解决用户痛点。"
    }
  },
  {
    id: "res_pm_optimized",
    userId: "demo_user",
    title: "产品经理 - 金融科技创业公司",
    templateId: "highlight",
    versionType: "jd_optimized",
    relatedJdId: "jd_pm_fintech",
    relatedEvaluationId: "eval_pm_optimized",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(), // 20 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    content: {
      basicInfo: {
        name: "张三",
        phone: "139-1111-2222",
        email: "zhangsan@example.com",
        city: "北京",
        intention: "高级产品经理 (SaaS)"
      },
      education: [
        {
          id: "edu_2",
          school: "北京大学",
          degree: "硕士",
          major: "工商管理",
          startDate: "2013-09",
          endDate: "2016-06",
          description: "专注商业分析与科技企业成长战略。"
        }
      ],
      workExperience: [
        {
          id: "work_2",
          company: "融通创新金融服务有限公司",
          position: "高级产品经理",
          startDate: "2018-03",
          endDate: "2024-02",
          content: "• 独立负责公司核心 B2B 金融清算 SaaS 仪表盘与决策分析系统重塑，DAU 突破 1000 万。\n• 引入数据驱动的产品规划流程：通过细分转化漏斗和全生命周期行为埋点，精准发现结账流失路径，使客单转化率上升 18%。\n• 采用 Agile 敏捷开发方式，跨团队同 30+ 研发与运营合力，将版本发布周期缩短 30% 并确保业务平隐升级。"
        }
      ],
      projects: [
        {
          id: "proj_2",
          name: "融通支付核心收银台优化版",
          role: "产品负责人",
          startDate: "2021-06",
          endDate: "2022-12",
          background: "原始收银台在峰值期间面临清算响应低、交互链路长问题，客户投诉频繁。",
          responsibilities: "运用 Axure、Visio 重新梳理三方通道交互，精减用户点击步骤至3次，新增敏捷异常补偿机制机制。",
          results: "产品重构后，结账异常中断率下降了 25%，年均挽回客单留存及清算处理资金数千万元。"
        }
      ],
      skills: ["Axure", "SQL", "Python数据分析", "B2B SaaS", "敏捷项目管理", "跨部门协作", "商业路径规划"],
      summary: "六年知名FinTech大厂高级产品管理及数据驱动决策履历。擅长在复杂多通道的清算业务中捕捉转化痛点，提炼业务规律，主导过两款注册、处理量千万级明星财务终端系统。"
    }
  },
  {
    id: "res_frontend_draft",
    userId: "demo_user",
    title: "前端开发工程师 (草稿第二版)",
    templateId: "technical",
    versionType: "manual_copy",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    content: {
      basicInfo: {
        name: "王五",
        phone: "155-2222-3333",
        email: "wangwu@example.com",
        city: "吉林",
        intention: "前端开发工程师"
      },
      education: [
        {
          id: "edu_3",
          school: "吉林大学",
          degree: "本科",
          major: "软件工程",
          startDate: "2017-09",
          endDate: "2021-06",
          description: "专业成绩优良，主修网络工程、数据结构、数据库开发。"
        }
      ],
      workExperience: [
        {
          id: "work_3",
          company: "长春某软件系统包工队",
          position: "前端班长",
          startDate: "2021-07",
          endDate: "2023-12",
          content: "• 负责编写各种政府官网与国企内网系统的静态 HTML 页面、管理表格的填写和接口联调工作。\n• 日常进行 Bug 修复、浏览器 IE 兼容度测试（主要是确保 IE11 正常打开），维护代码库的整洁。"
        }
      ],
      projects: [
        {
          id: "proj_3",
          name: "某区城管办公信息网",
          role: "前端代码仔",
          startDate: "2022-03",
          endDate: "2022-08",
          background: "老的后台系统操作界面陈旧不兼容新版手机浏览器。",
          responsibilities: "使用 jQuery 和 Bootstrap 重写了一套响应式模版，配好了接口传参。",
          results: "极大地便利了现场城管办公录入照片，缩短了案子积压，获得客户好评肯定。"
        }
      ],
      skills: ["HTML5", "CSS3", "JavaScript", "jQuery", "Bootstrap", "Vue2", "IE 兼容性优化"],
      summary: "诚实可靠，任劳任怨。工作细心负责，热衷了解 React、TypeScript 最新发展，自学能力强，希望能加入现代化研发团队以大增技术层次。"
    }
  }
];

export const INITIAL_JDS: JobDescription[] = [
  {
    id: "jd_frontend_oasis",
    userId: "demo_user",
    title: "高级前端工程师",
    company: "科技绿洲 ( 北京 ) 有限公司",
    rawContent: "【职位：高级前端开发 30k-45k 14薪 北京-朝阳区】\n我们是一家致力于科技绿化和低碳协同的绿色生态科技企业。现招聘一位高级前端工程师来设计及重构核心 SaaS 协同工作平台的前端。\n\n一、岗位职责：\n1. 负责核心业务系统的前端架构设计与开发，确保高性能和高可用性，注重核心框架的选型。（解析：强调大型系统经验与架构能力）\n2. 主导前端工程化建设，提升团队开发效率与代码质量，建立良好的CI/CD工作流程。\n3. 关注前端前沿技术（如 React/Vue 生态），探索将落地新技术在业务场景中的应用。\n\n二、任职要求（硬性）：\n1. 本科及以上学历，计算机相关专业，且有5年以上前端开发经验，精通前端主流技术栈。\n2. 精通 HTML5/CSS3/JavaScript 并在深度上掌握 TypeScript 语法和高级特性。\n3. 深入理解 React 或 Vue 及其周围生态（如双向绑定、Fiber架构、Hooks 思想），熟练使用 Webpack/Vite 等构建工具体系。\n4. 有大型团队多人合作的组件（CSS / Logic）建设经验、优秀性能优化习惯者优先考虑。",
    responsibilities: [
      "负责核心业务系统的前端架构设计与开发，提高系统高可用性和组件级复用率",
      "主导前端工程化规范建设，搭建完善的脚手架、微前端及CI/CD体系",
      "探索复杂数据可视化及轻量高性能渲染引擎在低碳绿色场景中的应用落地"
    ],
    requirements: [
      "本科及以上学历，全日制计算机科学相关专业优先，且具有 5 年以上核心前端开发经验",
      "精通 HTML5/CSS3/ES6 规范，并在生产中深刻实践 TypeScript 的高级泛型设计",
      "熟练掌控 React 框架、Fiber 重构等原理，深度掌握 Vite/Webpack 构建和 HMR 定制"
    ],
    keywords: ["React", "TypeScript", "Fiber 架构", "工程化CI/CD", "微前端", "Vite", "性能调优"],
    experienceRequirement: "5-8年",
    educationRequirement: "本科以上",
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString()
  },
  {
    id: "jd_pm_fintech",
    userId: "demo_user",
    title: "高级产品经理 (SaaS)",
    company: "绿地创投网络",
    rawContent: "招聘资深产品经理，5年以上经验，B2B SaaS产品经验，熟悉财务清算或Fintech核心支付流。懂Axure与SQL，主张数据驱动决策优先。",
    responsibilities: [
      "负责核心企业端财务清算 SaaS 产品的功能全生命周期设计、路标规划与高价值交互细节",
      "分析商户充值以及代理结算漏洞流失，运用业务看板和埋点监控优化支付重构，提高客单注册转化率",
      "同产品、设计、风控等20+业务方充分对齐，使用敏捷模式(Agile/Scrum)推进研发交付"
    ],
    requirements: [
      "5年以上高成长B2B产品实操经验，有复杂金融、清算、SAAS或支付经验者优先考虑",
      "熟练使用Axure、Sketch高精度还原交互流线，在非技术产品经理中属于数据掌控力极好、通SQL及Python脚本者优先",
      "极为优秀的沟通气场，思维缜密且极强抗压精神"
    ],
    keywords: ["B2B SaaS", "数据分析", "Axure / SQL", "金融清算", "Agile / Scrum"],
    experienceRequirement: "5年以上",
    educationRequirement: "本科以上",
    createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 40).toISOString()
  }
];

export const INITIAL_EVALUATIONS: Evaluation[] = [
  {
    id: "eval_pm_optimized",
    userId: "demo_user",
    resumeId: "res_pm_optimized",
    jdId: "jd_pm_fintech",
    totalScore: 78,
    dimensionScores: {
      skills: 85,
      experience: 70,
      responsibility: 60,
      industry: 60,
      achievement: 78
    },
    strengths: [
      "具备扎实的数据驱动产品增长经验，与 JD 要求的“精通用户增长策略”高度吻合。",
      "熟练掌握 SQL/Python，在非技术型产品经理中属于极佳的加分项。",
      "教育背景优秀，985/211高校计算机背景提供了良好的技术理解力底座。"
    ],
    weaknesses: [
      "JD 强烈要求“主导过 DAU 千万级产品”，而简历中缺乏量化的核心数据指标。",
      "缺少敏捷开发（Agile/Scrum）的项目管理经验描述，这在团队协作考核中略微被动。",
      "个人总结部分过于简短空泛，未能突出个人核心壁垒与过往大宗资产结算经验。"
    ],
    risks: [
      "经历转换跨度略大：候选人过往行业偏向单纯运营，直接转型到复杂千万账户清算可能有爬坡压力。"
    ],
    keywordMatches: [
      { keyword: "B2B SaaS", required: true, match: true, suggestion: "保留，并在腾讯履历中加强客户痛点解析" },
      { keyword: "数据分析", required: true, match: true, suggestion: "保留，体现以看板提升转化率的直接动作" },
      { keyword: "Agile/Scrum", required: true, match: false, suggestion: "如具备，建议在工作法总结中体现敏捷敏捷交付能力" }
    ],
    missingKeywords: ["Agile/Scrum", "DAU活跃度", "数据漏斗分析"],
    suggestions: [
      {
        section: "工作经历 - 融通创新金融服务有限公司",
        issue: "当前描述偏职责罗列，缺少与 JD 中“数据驱动决策”的直观结合与大宗数据表现。",
        suggestion: "运用 STAR 法则重构，强化如何通过全生命周期埋点发现结算中断，进而促升客单客单率。",
        exampleRewrite: "负责用户增长数据分析，搭建核心指标仪表盘，辅助业务团队定位结清流失，使整体结账转化提速至原 18%。"
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];

export const INITIAL_RECORDS: GenerationRecord[] = [
  {
    id: "rec_1",
    userId: "demo_user",
    type: "resume_generate",
    inputSummary: "创建了资深 UX 设计师原始简历（李明）",
    status: "success",
    resumeId: "res_senior_ux",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "rec_2",
    userId: "demo_user",
    type: "jd_resume_optimize",
    inputSummary: "根据高级产品经理 (SaaS) 职位一键优化「张三」的简历",
    status: "success",
    resumeId: "res_pm_optimized",
    jdId: "jd_pm_fintech",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  },
  {
    id: "rec_3",
    userId: "demo_user",
    type: "evaluation",
    inputSummary: "「张三的简历」 匹配 绿地创投网络「高级产品经理」JD 评估",
    status: "success",
    resumeId: "res_pm_optimized",
    jdId: "jd_pm_fintech",
    evaluationId: "eval_pm_optimized",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString()
  }
];
