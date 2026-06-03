/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Resume, JobDescription, Evaluation } from '../types';
import { 
  Briefcase, 
  Plus, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Loader2, 
  Trash2, 
  AlertCircle 
} from 'lucide-react';

interface JobAnalysisProps {
  jds: JobDescription[];
  resumes: Resume[];
  onAddJd: (jd: JobDescription) => void;
  onDeleteJd: (id: string) => void;
  onEvaluate: (resumeId: string, jdId: string) => Promise<void>;
  onNavigate: (view: 'dashboard' | 'resumes' | 'jds' | 'history') => void;
}

export default function JobAnalysis({
  jds,
  resumes,
  onAddJd,
  onDeleteJd,
  onEvaluate,
  onNavigate,
}: JobAnalysisProps) {
  // Parsing states
  const [showAddForm, setShowAddForm] = useState(false);
  const [rawJdText, setRawJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Selected JD for analysis view
  const [selectedJdId, setSelectedJdId] = useState<string | null>(jds[0]?.id || null);

  // Selected Resume & JD for evaluation launcher
  const [evaluationResumeId, setEvaluationResumeId] = useState<string>(resumes[0]?.id || '');
  const [evaluationJdId, setEvaluationJdId] = useState<string>(jds[0]?.id || '');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const selectedJd = jds.find(j => j.id === selectedJdId);

  // 1. Submit text to backend /api/job-description/parse
  const handleParseJd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawJdText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/job-description/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rawContent: rawJdText }),
      });

      const parsedJd = await response.json();
      if (!response.ok) {
        throw new Error(parsedJd.error || '解析 JD 发生异常');
      }

      const newJd: JobDescription = {
        id: "jd_" + Math.random().toString(36).substr(2, 9),
        userId: "demo_user",
        title: parsedJd.title || "未知岗位",
        company: parsedJd.company || "",
        rawContent: rawJdText,
        responsibilities: parsedJd.responsibilities || [],
        requirements: parsedJd.requirements || [],
        keywords: parsedJd.keywords || [],
        experienceRequirement: parsedJd.experienceRequirement || "不限",
        educationRequirement: parsedJd.educationRequirement || "不限",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onAddJd(newJd);
      setSelectedJdId(newJd.id);
      setEvaluationJdId(newJd.id);
      setRawJdText('');
      setShowAddForm(false);
    } catch (err: any) {
      setError(err?.message || '解析职位信息失败，请更换内容贴入重试！');
    } finally {
      setLoading(false);
    }
  };

  // 2. Trigger cross evaluation
  const handleLaunchEvaluation = async () => {
    if (!evaluationResumeId || !evaluationJdId) {
      setError('您需要同时选择一份简历和一个招聘职位进行评估');
      return;
    }

    setIsEvaluating(true);
    setError('');

    try {
      await onEvaluate(evaluationResumeId, evaluationJdId);
    } catch (err: any) {
      setError(err?.message || '评估匹配失败，请检查网络后再试！');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Title */}
      <div className="flex justify-between items-center border-b border-neutral-200/60 pb-5">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-800 tracking-tight">
            招聘岗位 JD 分析
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            智能解析岗位核心门槛（职责、技术关键词）并一键启动交叉契合度评估。
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? '取消新增' : '新增目标职位'}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Slide-out or Dropdown JD insertion Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4 animate-scale-up">
          <div className="flex items-center gap-2 text-primary font-serif font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            支持输入或贴入任意大厂、中小企业的中英文招聘 JD 原始内容
          </div>
          <form onSubmit={handleParseJd} className="space-y-4">
            <textarea
              value={rawJdText}
              onChange={(e) => setRawJdText(e.target.value)}
              rows={6}
              placeholder="请复制招聘软件（如 BOSS直聘、猎聘等）上的职位详情，直接粘贴到此处..."
              className="w-full text-xs p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono leading-relaxed"
              required
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 rounded-xl"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {loading ? '正在采用 Gemini 深度结构化解析...' : '智能解析 JD 关键特征'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: JDs on Left (4 cols), Detailed Info and Evaluation Panel on Right (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:h-[82vh]">
        
        {/* Left Side: JD List */}
        <div className="lg:col-span-4 space-y-4 bg-white/40 p-5 rounded-3xl border border-neutral-100/60 flex flex-col h-full shadow-sm overflow-hidden">
          <h3 className="font-serif font-bold text-neutral-800 text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-neutral-500" />
            目标职位候选
          </h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {jds.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-neutral-100 text-neutral-400 text-xs">
                暂无目标职位，请点击右上角新增。
              </div>
            ) : (
              jds.map((jd) => (
                <div
                  key={jd.id}
                  onClick={() => { setSelectedJdId(jd.id); setEvaluationJdId(jd.id); }}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                    selectedJdId === jd.id 
                    ? 'bg-[#FAF6F0] border-primary/30 shadow-md' 
                    : 'bg-white border-neutral-100 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded font-mono font-bold">
                      {jd.experienceRequirement} · {jd.educationRequirement}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteJd(jd.id); }}
                      type="button"
                      className="text-neutral-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-neutral-800 text-base mt-2 group-hover:text-primary transition-colors">
                    {jd.title}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    {jd.company || '未知企业'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-neutral-100/60 flex flex-wrap gap-1.5">
                    {jd.keywords?.slice(0, 3).map((kw, i) => (
                      <span key={i} className="bg-white/80 border text-neutral-600 text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {kw}
                      </span>
                    ))}
                  </div>

                  {selectedJdId === jd.id && (
                    <span className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-full flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-4 h-4 translate-x-1 -translate-y-1" />
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Detailed analysis with Evaluation engine launcher */}
        <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
          {selectedJd ? (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* Evaluator launcher widget */}
              <div className="bg-[#FAF6F0] border-2 border-primary/20 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-serif font-bold text-[#705c30] text-base">一键发起智能契合度交叉核对评估</h3>
                </div>
                <p className="text-xs text-neutral-500">
                  选择您目前已有的一份中文简历，AI 将全面对照「{selectedJd.title}」的各项职责与任职门槛，自动打分并生成星级匹配改写范本。
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-neutral-500 mb-1">目标招聘职位 (JD)</label>
                    <div className="p-3 bg-white border border-neutral-200 rounded-xl text-xs font-bold text-neutral-800 flex items-center justify-between">
                      <span>{selectedJd.title} ({selectedJd.company || '通用企业'})</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">匹配评估使用的简历</label>
                    <select
                      value={evaluationResumeId}
                      onChange={(e) => setEvaluationResumeId(e.target.value)}
                      className="w-full text-xs p-3 bg-white border border-neutral-300 rounded-xl font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">-- 请选择一份您的简历 --</option>
                      {resumes.map(r => (
                        <option key={r.id} value={r.id}>{r.title} ({r.content.basicInfo.name})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleLaunchEvaluation}
                    disabled={isEvaluating || !evaluationResumeId}
                    className="w-full py-3 text-xs font-bold bg-primary text-white rounded-xl hover:bg-primary-hover active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        正在使用大厂面试官模型，逐句校核契合度 (可能需要 10-15s)...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        即刻导出 360° AI 评估并一键精优多适配改写
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* JD Attributes display card */}
              <div className="bg-white p-8 rounded-3xl shadow-warm border border-neutral-100 space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-extrabold text-neutral-800">
                    {selectedJd.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">{selectedJd.company || '未知企业'} • 期待工作年限：<span className="font-mono">{selectedJd.experienceRequirement}</span> • 学历门槛：{selectedJd.educationRequirement}</p>
                </div>

                {/* Key components */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-primary tracking-widest uppercase font-mono border-b pb-1">
                      // 抽丝要项 - 岗位核心职责群
                    </h4>
                    <ul className="space-y-2 text-xs text-neutral-600 pl-3 list-decimal leading-relaxed">
                      {selectedJd.responsibilities?.map((item, idx) => (
                        <li key={idx} className="marker:text-primary font-serif">{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#705c30] tracking-widest uppercase font-mono border-b pb-1">
                      // 关键要件 - 硬性匹配门槛
                    </h4>
                    <ul className="space-y-2 text-xs text-neutral-600 pl-3 list-disc leading-relaxed">
                      {selectedJd.requirements?.map((item, idx) => (
                        <li key={idx} className="marker:text-[#705c30] font-sans">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Keyword profiling */}
                {selectedJd.keywords && selectedJd.keywords.length > 0 && (
                  <div className="space-y-2.5 pt-2">
                    <h4 className="text-xs font-bold text-neutral-700 tracking-wider font-mono">
                      技术关键词雷达谱堆叠：
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJd.keywords.map((kw, i) => (
                        <span key={i} className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-1 rounded-full font-mono font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw content disclosure card */}
                <div className="border-t pt-5 space-y-2">
                  <h4 className="text-xs font-bold text-neutral-400 font-mono">招聘 JD 的原始描述文本：</h4>
                  <pre className="text-[10px] text-neutral-500 font-mono overflow-auto max-h-[140px] leading-relaxed bg-neutral-50 p-3 rounded-lg border">
                    {selectedJd.rawContent}
                  </pre>
                </div>

              </div>

            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-neutral-100 flex flex-col items-center justify-center p-6 h-full shadow-sm">
              <Plus className="w-12 h-12 text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500 font-bold">请新增或选择一个目标职位以查看详备信息。</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
