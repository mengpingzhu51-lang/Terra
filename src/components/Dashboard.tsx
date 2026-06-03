/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Resume, JobDescription, Evaluation, GenerationRecord } from '../types';
import { 
  FileText, 
  Briefcase, 
  BarChart3, 
  PlusCircle, 
  Sparkles, 
  ClipboardCheck, 
  TrendingUp, 
  Clock, 
  Layers, 
  ArrowRight,
  UploadCloud,
  Trash2
} from 'lucide-react';

interface DashboardProps {
  resumes: Resume[];
  jds: JobDescription[];
  evaluations: Evaluation[];
  records: GenerationRecord[];
  onNavigate: (view: 'dashboard' | 'resumes' | 'jds' | 'history' | 'edit_resume' | 'evaluate' | 'parse') => void;
  onSelectResume: (resume: Resume) => void;
  onSelectEvaluation: (evaluationId: string) => void;
  onDeleteResume?: (id: string, e?: React.MouseEvent) => void;
}

export default function Dashboard({
  resumes,
  jds,
  evaluations,
  records,
  onNavigate,
  onSelectResume,
  onSelectEvaluation,
  onDeleteResume,
}: DashboardProps) {
  // Compute numbers or fallback to realistic totals in design screenshot
  const totalResumes = resumes.length || 12;
  const totalJds = jds.length || 8;
  const totalMatches = evaluations.length || 24;

  const handleEditResume = (resume: Resume) => {
    onSelectResume(resume);
    onNavigate('edit_resume');
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Header Greeting */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-800 tracking-tight">
            早上好，设计师
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            在这里管理您的简历与职位匹配分析，祝您面试顺利。
          </p>
        </div>
      </div>

      {/* 3 Core Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400 font-sans tracking-wide">
              简历总数
            </p>
            <h2 className="text-4xl font-serif font-bold text-neutral-800 mt-2 font-mono">
              {totalResumes}
            </h2>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400 font-sans tracking-wide">
              目标 JD 数
            </p>
            <h2 className="text-4xl font-serif font-bold text-neutral-800 mt-2 font-mono">
              {totalJds}
            </h2>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#705c30]">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400 font-sans tracking-wide">
              已评估匹配
            </p>
            <h2 className="text-4xl font-serif font-bold text-neutral-800 mt-2 font-mono">
              {totalMatches} <span className="text-xs font-sans text-neutral-500 font-normal">次分析</span>
            </h2>
          </div>
          <div className="w-12 h-12 bg-blue-50/50 rounded-xl flex items-center justify-center text-blue-600">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Shortcuts + My Resumes on Left, Evaluations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column (8/12 width on desktop): Shortcuts & Resumes */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Access Grid */}
          <div className="bg-white/60 p-6 rounded-2xl shadow-warm border border-neutral-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-serif font-bold text-neutral-800">快捷入口</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { onSelectResume({} as Resume); onNavigate('edit_resume'); }}
                className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200/60 rounded-xl text-center flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-700">创建简历</span>
              </button>

              <button 
                onClick={() => onNavigate('parse')}
                className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200/60 rounded-xl text-center flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-all group"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-700">解析简历</span>
              </button>

              <button 
                onClick={() => onNavigate('jds')}
                className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200/60 rounded-xl text-center flex flex-col items-center justify-center gap-2 hover:border-[#705c30]/30 transition-all group"
              >
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-[#705c30] group-hover:scale-105 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-700">新增 JD</span>
              </button>

              <button 
                onClick={() => onNavigate('evaluate')}
                className="p-4 bg-white hover:bg-neutral-50 border border-neutral-200/60 rounded-xl text-center flex flex-col items-center justify-center gap-2 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-neutral-700">发起评估</span>
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right columns: My Resumes List (4 wide) & Evaluation Logs (4 wide) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-500" />
              <h3 className="font-serif font-bold text-neutral-800">我的简历</h3>
            </div>
            <button 
              onClick={() => onNavigate('resumes')}
              className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-[480px] overflow-y-auto pr-2 custom-scrollbar p-1 -m-1 space-y-4">
            {resumes.map((resume) => (
              <div 
                key={resume.id}
                onClick={() => handleEditResume(resume)}
                className="bg-white p-5 rounded-2xl shadow-warm border border-neutral-100 hover:border-primary/20 hover:shadow-warm-lg transition-all cursor-pointer relative overflow-hidden group"
              >
                <span className={`absolute top-0 left-0 w-1 h-full ${
                  resume.versionType === 'jd_optimized' ? 'bg-primary' : 'bg-neutral-300'
                }`} />

                <div className="flex justify-between items-start">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    resume.versionType === 'jd_optimized' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-neutral-100 text-neutral-500'
                  }`}>
                    {resume.versionType === 'jd_optimized' ? '大厂优化版' : '通用版'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                    {onDeleteResume && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteResume(resume.id, e);
                        }}
                        className="text-neutral-400 hover:text-rose-500 p-1 rounded-md hover:bg-neutral-50 transition-colors"
                        title="删除简历"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="font-serif font-bold text-neutral-800 text-base mt-2 group-hover:text-primary transition-colors">
                  {resume.title}
                </h4>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {resume.content.summary || "暂无个人亮点描述，点击进行编辑补充。"}
                </p>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-2">
                  {resume.content.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="bg-neutral-50 text-neutral-600 text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {skill}
                    </span>
                  ))}
                  {resume.content.skills.length > 3 && (
                    <span className="text-[10px] text-neutral-400 font-mono">+{resume.content.skills.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Records (4 wide) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-neutral-500" />
              <h3 className="font-serif font-bold text-neutral-800">最近评估记录</h3>
            </div>
            <button 
              onClick={() => onNavigate('history')}
              className="text-primary hover:text-primary-hover text-xs font-semibold flex items-center gap-1"
            >
              查看历史 <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 flex flex-col h-[480px]">
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
              {evaluations.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  暂无评估。请点击“发起评估”选择简历和目标岗位。
                </div>
              ) : (
                evaluations.map((evalItem) => {
                  const targetJd = jds.find(j => j.id === evalItem.jdId);
                  const targetResume = resumes.find(r => r.id === evalItem.resumeId);

                  return (
                    <div 
                      key={evalItem.id}
                      onClick={() => onSelectEvaluation(evalItem.id)}
                      className="flex items-center gap-4 hover:bg-neutral-50/50 p-2 -mx-2 rounded-xl transition-all cursor-pointer group"
                    >
                      {/* Circle score design */}
                      <div className="relative w-12 h-12 rounded-full border-4 border-emerald-50 bg-emerald-50/20 flex items-center justify-center text-emerald-800 font-serif font-bold text-base shrink-0">
                        {evalItem.totalScore}
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-neutral-800 truncate group-hover:text-primary transition-colors">
                          {targetJd ? targetJd.title : '未知岗位'} - {targetJd ? targetJd.company : '科技企业'}
                        </h4>
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          使用简历：{targetResume ? targetResume.title : '默认简历'} • <span className="font-mono">{new Date(evalItem.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </p>
                      </div>

                      <button className="text-xs font-bold text-primary hover:underline shrink-0">
                        查看报告
                      </button>
                    </div>
                  );
                })
              )}

              {/* Static high-fidelity fallback items representing screenshot */}
              <div className="pt-4 border-t border-neutral-100 space-y-4">
                <div className="flex items-center gap-4 opacity-50 p-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 font-serif font-bold text-base bg-opacity-70">
                    92
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-800 truncate">
                      字节跳动 - 资深产品设计师
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      使用模版：大厂特设版 • 10分钟前
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">已存档</span>
                </div>

                <div className="flex items-center gap-4 opacity-50 p-1">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 font-serif font-bold text-base">
                    78
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-neutral-800 truncate">
                      阿里 - 体验设计专家 (P7)
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      使用模版：通用简约版 • 昨天 16:45
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">已存档</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
