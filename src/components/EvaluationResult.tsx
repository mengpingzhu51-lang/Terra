/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Resume, JobDescription, Evaluation, OptimizationSuggestion } from '../types';
import { 
  Sparkles, 
  Award, 
  MinusCircle, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ChevronRight, 
  RefreshCw, 
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Sliders,
  Check,
  Loader2
} from 'lucide-react';

interface EvaluationResultProps {
  evaluation: Evaluation;
  resume: Resume;
  jd: JobDescription;
  onNavigate: (view: 'dashboard' | 'resumes' | 'jds' | 'history' | 'edit_resume') => void;
  onOptimize: (evaluationId: string) => Promise<{ content: any, diffSummary: any[] }>;
  onSaveOptimizedResume: (originalResume: Resume, optimizedContent: any, relatedJdId: string, relatedEvaluationId: string) => void;
}

export default function EvaluationResult({
  evaluation,
  resume,
  jd,
  onNavigate,
  onOptimize,
  onSaveOptimizedResume,
}: EvaluationResultProps) {
  // Diff generation view states
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizeStep, setOptimizeStep] = useState(0);
  const [optimizedResult, setOptimizedResult] = useState<any | null>(null);
  const [diffSummary, setDiffSummary] = useState<any[]>([]);
  const [error, setError] = useState('');

  const dimensionLabels: { [key: string]: string } = {
    skills: "技能栈强力契合",
    experience: "工作年限/经验吻合",
    responsibility: "岗位职责对齐",
    industry: "行业及业务背景熟悉",
    achievement: "量化指标/产出表达"
  };

  // Run the optimization calling backend /api/resume/optimize
  const handleLaunchOptimize = async () => {
    setIsOptimizing(true);
    setError('');
    
    // Simulate steps for ultra high fidelity visualization
    const stepsTimer = setInterval(() => {
      setOptimizeStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 3200);

    try {
      const result = await onOptimize(evaluation.id);
      clearInterval(stepsTimer);
      setOptimizeStep(4);
      setOptimizedResult(result.content);
      setDiffSummary(result.diffSummary);
    } catch (err: any) {
      clearInterval(stepsTimer);
      setError(err?.message || '一键智能改写失败，请稍后重试');
      setIsOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (!optimizedResult) return;
    onSaveOptimizedResume(resume, optimizedResult, jd.id, evaluation.id);
    onNavigate('resumes');
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-16">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200/60 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('jds')}
            className="p-2 border border-neutral-200/60 hover:bg-white rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-neutral-800">
              智能匹配诊断分析
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              简历：<span className="font-semibold text-neutral-700">{resume.title}</span> 
              &nbsp;→ 对标&nbsp;
              职位：<span className="font-semibold text-neutral-700">{jd.title} ({jd.company || '未知公司'})</span>
            </p>
          </div>
        </div>

        {!isOptimizing && !optimizedResult && (
          <button
            onClick={handleLaunchOptimize}
            className="px-5 py-2.5 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            一建智能套用：纠偏并生成高适配副本
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* STEP 1: ANIMATING GENERATOR milestones */}
      {isOptimizing && optimizeStep < 4 && (
        <div className="bg-white p-8 rounded-3xl shadow-warm border border-neutral-100 flex flex-col items-center py-16 space-y-6 max-w-xl mx-auto">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          
          <div className="text-center space-y-2">
            <h3 className="font-serif font-bold text-neutral-800 text-lg">正在帮您重构适配的高适配简历...</h3>
            <p className="text-xs text-neutral-400">我们将保持您的生平、任职院校与经历绝对真实，仅润色文字。</p>
          </div>

          <div className="w-full space-y-3 pt-4">
            <div className="flex items-center gap-3 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                optimizeStep >= 0 ? 'bg-primary text-white' : 'bg-neutral-150 text-neutral-400'
              }`}>
                {optimizeStep > 0 ? <Check className="w-3 h-3" /> : '1'}
              </div>
              <span className={optimizeStep >= 0 ? 'font-bold text-neutral-800' : 'text-neutral-400'}>
                对归属各公司条目的【量化指标】实施 STAR 模型填充
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                optimizeStep >= 1 ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
              }`}>
                {optimizeStep > 1 ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <span className={optimizeStep >= 1 ? 'font-bold text-neutral-800' : 'text-neutral-400'}>
                织入缺失的硬核关键词 (如 Vue/React 等) 确保首筛通过率
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                optimizeStep >= 2 ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
              }`}>
                {optimizeStep > 2 ? <Check className="w-3 h-3" /> : '3'}
              </div>
              <span className={optimizeStep >= 2 ? 'font-bold text-neutral-800' : 'text-neutral-400'}>
                优化自我亮点与项目总结阐述，对齐 JD 痛点
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                optimizeStep >= 3 ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-400'
              }`}>
                {optimizeStep > 3 ? <Check className="w-3 h-3" /> : '4'}
              </div>
              <span className={optimizeStep >= 3 ? 'font-bold text-neutral-800' : 'text-neutral-400'}>
                多层降噪、微缩排版、对齐 A4 高端印刷规格
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: FINISHED OPTIMIZER -> BEFORE-AFTER DIFF VIEW */}
      {optimizeStep === 4 && optimizedResult && (
        <div className="bg-white p-8 rounded-3xl shadow-warm border border-neutral-100 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary-hover font-serif rounded-full text-xs font-bold">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                简历一键精优多适配改写成功！
              </div>
              <h3 className="font-serif font-extrabold text-neutral-850 text-xl mt-2">
                修改内容对比 Diff 条目 (AI 智能降噪并强调高含金量经历)
              </h3>
            </div>

            <button
              onClick={handleApplyOptimization}
              className="px-6 py-3 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              应用修改并保进简历库
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Diff list renderer */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-3 scrollbar-thin">
            {diffSummary.map((diff, index) => (
              <div key={index} className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200/50 flex flex-col md:flex-row gap-4">
                <div className="md:w-1/4">
                  <span className="text-[10px] font-mono font-bold bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded uppercase tracking-wide">
                    {diff.section}
                  </span>
                  <p className="text-[11px] text-[#705c30] font-sans font-semibold mt-2 leading-relaxed">
                    🌟 改写原因：{diff.reason}
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  {/* Before in red background */}
                  <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl leading-relaxed">
                    <div className="text-[10px] font-bold text-rose-500 mb-1 flex items-center gap-1 font-sans">
                      <XCircle className="w-3.5 h-3.5" /> 优化前原文片段：
                    </div>
                    <pre className="text-[11px] font-sans text-neutral-600 whitespace-pre-wrap">{diff.before}</pre>
                  </div>

                  {/* After in green background */}
                  <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl leading-relaxed">
                    <div className="text-[10px] font-bold text-emerald-700 mb-1 flex items-center gap-1 font-sans">
                      <CheckCircle className="w-3.5 h-3.5" /> 智能 STAR 改写片段：
                    </div>
                    <pre className="text-[11px] font-sans text-emerald-950 font-semibold whitespace-pre-wrap">{diff.after}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTERACTIVE GENERAL MATCHING REPORT SCREEN */}
      {(!isOptimizing && !optimizedResult) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main left chart/score panel (5 width) */}
          <div className="lg:col-span-5 bg-white p-8 rounded-3xl shadow-warm border border-neutral-100 space-y-6 flex flex-col items-center">
            
            <h3 className="font-serif font-extrabold text-neutral-800 text-lg self-start">契合度交叉诊断汇总</h3>
            
            {/* Visual radial gauge */}
            <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-8 border-emerald-50 bg-emerald-50/10 mt-2">
              <div className="text-center">
                <span className="text-5xl font-serif font-extrabold text-emerald-800">{evaluation.totalScore}</span>
                <span className="text-xs font-sans text-emerald-600 font-bold block mt-1">% 匹配率</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
            </div>

            {/* Score rating summary */}
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-neutral-800">
                {evaluation.totalScore >= 85 ? '极高契合度建议推荐' : evaluation.totalScore >= 70 ? '基本吻合，尚有优化余地' : '契合较低，请一键优化套用'}
              </p>
              <p className="text-xs text-neutral-400">大厂招聘规范智能首筛通过概率分析结果</p>
            </div>

            {/* Dimension sliders matching */}
            <div className="w-full space-y-3.5 pt-4 border-t">
              <h4 className="text-xs font-bold text-neutral-500 font-mono tracking-wider">匹配诊断五大维度分解：</h4>
              
              {Object.keys(evaluation.dimensionScores).map((key) => {
                const score = (evaluation.dimensionScores as any)[key];
                const label = dimensionLabels[key] || key;

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-neutral-600 flex items-center gap-1.5 font-sans">
                        <Sliders className="w-3.5 h-3.5 text-primary" />
                        {label}
                      </span>
                      <span className="font-mono text-neutral-800 font-bold">{score} / 100</span>
                    </div>
                    {/* Visual Progress bar with earth tone primary color */}
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Detailed highlights/Suggestions Panel (7 width) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Bento highlights layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* strengths */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-warm space-y-3">
                <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  // 核心优势、契合原因
                </h4>
                <ul className="space-y-2 text-xs text-neutral-600 pl-4 list-decimal leading-relaxed">
                  {evaluation.strengths.map((item, i) => (
                    <li key={i} className="marker:text-emerald-700 font-serif">{item}</li>
                  ))}
                </ul>
              </div>

              {/* weaknesses */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-warm space-y-3">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  // 匹配短板、缺失细节
                </h4>
                <ul className="space-y-2 text-xs text-neutral-600 pl-4 list-decimal leading-relaxed">
                  {evaluation.weaknesses.map((item, i) => (
                    <li key={i} className="marker:text-amber-700 font-serif">{item}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* risks alerts indicator if any */}
            {evaluation.risks && evaluation.risks.length > 0 && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-800">潜在雷区资格门槛与硬伤警示：</h4>
                  <ul className="list-disc pl-4 text-xs text-rose-700/80 leading-relaxed mt-1.5">
                    {evaluation.risks.map((risk, index) => (
                      <li key={index} className="marker:text-rose-400">{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Technical keywords match tracking checkboxes */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-warm space-y-3">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide font-mono border-b pb-2 flex items-center justify-between">
                <span>岗位核心关键词覆盖校核雷达</span>
                <span className="text-[10px] text-neutral-400 lowercase font-normal">* 基于大厂 JD 要素库提取</span>
              </h4>

              <div className="space-y-3 pt-1.5">
                {evaluation.keywordMatches.map((item, i) => (
                  <div key={i} className="flex gap-3 text-xs leading-relaxed">
                    {item.match ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-800 font-mono text-[13px]">{item.keyword}</span>
                        {item.required && (
                          <span className="text-[9px] font-mono px-1.5 bg-rose-50 border border-rose-200 text-rose-600 rounded">P0 强硬要求</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-[11px] mt-0.5">{item.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions table */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-warm space-y-4">
              <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wide font-mono border-b pb-2">
                智能拆机改写落地指南 (STAR)
              </h4>

              <div className="space-y-4">
                {evaluation.suggestions.map((item, idx) => (
                  <div key={idx} className="p-4 bg-neutral-50 border border-neutral-100 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-bold text-primary">
                      <span>板块：{item.section}</span>
                    </div>
                    <p className="text-xs text-neutral-500 font-sans">
                      <strong className="text-neutral-600">问题痛点:</strong> {item.issue}
                    </p>
                    <p className="text-xs text-neutral-600">
                      <strong className="text-primary">改写动作:</strong> {item.suggestion}
                    </p>
                    {/* Beautiful rewrite box */}
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-900 font-mono text-xs p-3 rounded-lg relative overflow-hidden leading-relaxed">
                      <span className="absolute top-0 right-0 bg-emerald-200 text-emerald-800 text-[8px] font-bold px-1.5 uppercase">
                        一键套用智能结果
                      </span>
                      <pre className="text-[11px] font-sans font-bold select-all">{item.exampleRewrite}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
