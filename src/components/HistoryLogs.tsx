/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GenerationRecord, Resume, JobDescription } from '../types';
import { 
  FileText, 
  Briefcase, 
  BarChart3, 
  Sparkles, 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight,
  AlertTriangle,
  Search,
  X,
  Filter,
  Calendar
} from 'lucide-react';

interface HistoryLogsProps {
  records: GenerationRecord[];
  resumes: Resume[];
  jds: JobDescription[];
  onNavigate: (view: 'dashboard' | 'resumes' | 'jds' | 'history' | 'edit_resume' | 'evaluate' | 'parse') => void;
  onSelectResume: (resume: Resume) => void;
  onSelectEvaluation: (id: string) => void;
}

const typeLabels: { [key: string]: string } = {
  'resume_parse': '原始简历结构化解析',
  'resume_generate': '中文简历新篇生成',
  'jd_parse': '目标岗位 JD 结构化解析',
  'evaluation': '岗位契合度交叉诊断评估',
  'optimization_suggestion': '智能改写和优化要项提取',
  'jd_resume_optimize': '高契合大厂简历一键重新生成'
};

export default function HistoryLogs({
  records,
  resumes,
  jds,
  onNavigate,
  onSelectResume,
  onSelectEvaluation,
}: HistoryLogsProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activityType, setActivityType] = useState<string>('all');
  const [timePreset, setTimePreset] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5); // Customizable page size

  // Format dates beautifully
  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Determine which dynamic items match the filters
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // 1. Activity Type Filter
      if (activityType !== 'all' && rec.type !== activityType) {
        return false;
      }

      // 2. Search Query Filter (Resume Title/Name, JD Title/Company, inputSummary, or Message)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        let queryMatched = false;

        if (rec.inputSummary && rec.inputSummary.toLowerCase().includes(q)) queryMatched = true;
        if (rec.errorMessage && rec.errorMessage.toLowerCase().includes(q)) queryMatched = true;
        
        const typeLabel = typeLabels[rec.type] || rec.type || '';
        if (typeLabel.toLowerCase().includes(q)) queryMatched = true;

        if (rec.resumeId) {
          const resume = resumes.find(r => r.id === rec.resumeId);
          if (resume) {
            if (resume.title && resume.title.toLowerCase().includes(q)) queryMatched = true;
            if (resume.content?.basicInfo?.name && resume.content.basicInfo.name.toLowerCase().includes(q)) queryMatched = true;
          }
        }

        if (rec.jdId) {
          const jd = jds.find(j => j.id === rec.jdId);
          if (jd) {
            if (jd.title && jd.title.toLowerCase().includes(q)) queryMatched = true;
            if (jd.company && jd.company.toLowerCase().includes(q)) queryMatched = true;
          }
        }

        if (!queryMatched) return false;
      }

      // 3. Time Filter
      const recDate = new Date(rec.createdAt);
      const now = new Date();

      if (timePreset === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (recDate < startOfToday) return false;
      } else if (timePreset === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (recDate < sevenDaysAgo) return false;
      } else if (timePreset === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (recDate < thirtyDaysAgo) return false;
      } else if (timePreset === 'custom') {
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (recDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (recDate > end) return false;
        }
      }

      return true;
    });
  }, [records, searchQuery, activityType, timePreset, startDate, endDate, resumes, jds]);

  // Determine if the fallback/mock record matches the filters
  const mockRecordMatches = useMemo(() => {
    // 1. Activity Type Filter (mock one is "evaluation")
    if (activityType !== 'all' && activityType !== 'evaluation') {
      return false;
    }

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const contentString = (
        "目标职位契合度智能交叉评估 " +
        "使用简历: 前端开发工程师 (草稿第二版) 对标 百度 - 主任前端工程 " +
        "Evaluation aborted. Uploaded PDF format was corrupted or unreadable."
      ).toLowerCase();
      
      if (!contentString.includes(q)) {
        return false;
      }
    }

    // 3. Time Filter (mock record date is Oct 24, 2025)
    const recDate = new Date("2025-10-24T09:15:00.000Z");
    const now = new Date();

    if (timePreset === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (recDate < startOfToday) return false;
    } else if (timePreset === 'week') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (recDate < sevenDaysAgo) return false;
    } else if (timePreset === 'month') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      if (recDate < thirtyDaysAgo) return false;
    } else if (timePreset === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (recDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (recDate > end) return false;
      }
    }

    return true;
  }, [activityType, searchQuery, timePreset, startDate, endDate]);

  // Unified combined record list of dynamic & fallback items
  const combinedRecords = useMemo(() => {
    const list = [...filteredRecords];
    if (mockRecordMatches) {
      list.push({
        id: 'mock_record_aborted',
        userId: 'demo_user',
        type: 'evaluation',
        status: 'aborted', // Special aborted status for mock record
        inputSummary: '使用简历: 前端开发工程师 (草稿第二版) 对标 百度 - 主任前端工程',
        errorMessage: 'Evaluation aborted. Uploaded PDF format was corrupted or unreadable.',
        createdAt: '2025-10-24T09:15:00.000Z'
      } as any);
    }
    return list;
  }, [filteredRecords, mockRecordMatches]);

  // Total paginated calculations
  const totalItems = combinedRecords.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);

  // Paginated elements subset
  const paginatedRecords = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return combinedRecords.slice(startIndex, startIndex + pageSize);
  }, [combinedRecords, safeCurrentPage, pageSize]);

  // Reset page to 1 when any filter adjustments are made
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activityType, timePreset, startDate, endDate]);

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-5xl mx-auto pb-12">
      
      {/* Title */}
      <div className="border-b border-neutral-200/60 pb-5">
        <h1 className="text-3xl font-serif font-bold text-neutral-800 tracking-tight flex items-center gap-2">
          <History className="w-8 h-8 text-neutral-500" />
          智能审计历史明细
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          完整追踪您每一次简历解析、JD 特征析出、交叉评估以及一键对齐改写的 AI 执行流水。
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200/60 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* 1. Search Bar */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-neutral-400" />
              搜索范围 (简历名称 / JD 岗位 / 关键字)
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="输入简历名称、JD 或关键字..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-sm bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all text-neutral-800 placeholder-neutral-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* 2. Activity Type Selection */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              活动类型
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all text-neutral-800 cursor-pointer"
            >
              <option value="all">全部活动类型</option>
              {Object.entries(typeLabels).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>

          {/* 3. Time Preset & Custom Date Range */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-neutral-500 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              时间筛选
            </label>
            <div className="flex gap-2">
              <select
                value={timePreset}
                onChange={(e) => {
                  setTimePreset(e.target.value);
                  if (e.target.value !== 'custom') {
                    setStartDate('');
                    setEndDate('');
                  }
                }}
                className={`text-sm px-3.5 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-neutral-400 rounded-xl focus:ring-1 focus:ring-neutral-400 focus:outline-none transition-all text-neutral-800 cursor-pointer ${
                  timePreset === 'custom' ? 'w-1/3' : 'w-full'
                }`}
              >
                <option value="all">全部时间</option>
                <option value="today">今天</option>
                <option value="week">最近 7 天</option>
                <option value="month">最近 30 天</option>
                <option value="custom">自定义区间</option>
              </select>

              {timePreset === 'custom' && (
                <div className="w-2/3 flex items-center gap-1 animate-fade-in">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[45%] px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white text-neutral-700"
                  />
                  <span className="text-neutral-400 text-xs shrink-0">至</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[45%] px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white text-neutral-700"
                  />
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Clear Filters Indicator */}
        {(searchQuery || activityType !== 'all' || timePreset !== 'all' || startDate || endDate) && (
          <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-xs">
            <span className="text-neutral-500">
              已筛选出 <span className="font-bold text-neutral-800 font-mono">{(filteredRecords.length + (mockRecordMatches ? 1 : 0))}</span> 条审计明细
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setActivityType('all');
                setTimePreset('all');
                setStartDate('');
                setEndDate('');
              }}
              className="text-neutral-500 hover:text-neutral-800 font-bold flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              清除全部筛选项
            </button>
          </div>
        )}
      </div>

      {/* Record list container */}
      <div className="bg-white rounded-3xl shadow-warm border border-neutral-100 overflow-hidden divide-y divide-neutral-100">
        
        {/* Core database timeline items & Fallback historic records */}
        {paginatedRecords.map((rec) => {
          if (rec.id === 'mock_record_aborted') {
            return (
              <div 
                key="mock_record_aborted" 
                className="p-6 opacity-60 bg-[#FAF6F0]/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-extrabold text-neutral-800 text-base">
                        目标职位契合度智能交叉评估
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold font-mono bg-rose-100 text-rose-700">
                        ABORTED
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      使用简历: 前端开发工程师 (草稿第二版) 对标 百度 - 主任前端工程
                    </p>
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[11px] p-2 rounded-lg mt-2 flex items-center gap-1.5 leading-relaxed max-w-2xl font-mono bg-opacity-70">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Evaluation aborted. Uploaded PDF format was corrupted or unreadable.
                    </div>
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-mono font-medium flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  2025/10/24 09:15 AM
                </span>
              </div>
            );
          }

          return (
            <div 
              key={rec.id}
              className="p-6 hover:bg-neutral-50/50 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group animate-fade-in"
            >
              <div className="flex items-start gap-4">
                {/* Event Status indicator */}
                {rec.status === 'success' ? (
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-extrabold text-neutral-800 text-base">
                      {typeLabels[rec.type] || rec.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold font-mono ${
                      rec.status === 'success' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-600'
                    }`}>
                      {rec.status === 'success' ? 'SUCCESS' : 'FAILED'}
                    </span>
                  </div>
                  
                  <p className="text-xs text-neutral-500">
                    {rec.inputSummary || 'AI 辅助后台任务流水进程'}
                  </p>

                  {/* Failed details if any */}
                  {rec.status !== 'success' && rec.errorMessage && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-700 text-[11px] p-2 rounded-lg mt-2 flex items-center gap-1.5 leading-relaxed max-w-2xl font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      {rec.errorMessage}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-end justify-center text-right shrink-0">
                <span className="text-xs text-neutral-400 font-mono font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTime(rec.createdAt)}
                </span>
              </div>
            </div>
          );
        })}

        {/* Empty state when everything is filtered out */}
        {totalItems === 0 && (
          <div className="p-12 text-center text-neutral-400 space-y-3 animate-fade-in animate-duration-300">
            <History className="w-10 h-10 mx-auto text-neutral-300" />
            <div>
              <p className="text-sm font-semibold text-neutral-600">未找到匹配的审计历史明细</p>
              <p className="text-xs text-neutral-400 mt-1">请尝试修改您的检索关键字、活动类型或时间跨度</p>
            </div>
          </div>
        )}

      </div>

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-neutral-100/85 rounded-3xl p-4 px-6 shadow-warm gap-4 animate-fade-in">
          <div className="text-xs text-neutral-500 font-sans flex items-center gap-1">
            显示从第 <span className="font-bold text-[#2e3230] font-mono">{((safeCurrentPage - 1) * pageSize) + 1}</span> 至{" "}
            <span className="font-bold text-[#2e3230] font-mono">
              {Math.min(safeCurrentPage * pageSize, totalItems)}
            </span>{" "}
            条，共 <span className="font-bold text-[#2e3230] font-mono">{totalItems}</span> 条审计记录
          </div>
          
          {/* Custom Select Per Page Limit */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-sans">
            <span className="text-neutral-400">每页显示</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Go back to start page to prevent indexing overflows
              }}
              className="bg-neutral-50 border border-neutral-200/70 text-neutral-800 text-xs rounded-xl py-1 px-3 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary font-mono font-bold hover:border-neutral-300 transition-all cursor-pointer shadow-inner min-w-[70px]"
            >
              <option value={5}>5 条</option>
              <option value={10}>10 条</option>
              <option value={20}>20 条</option>
              <option value={50}>50 条</option>
            </select>
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={safeCurrentPage === 1}
              className="px-3 py-1.5 rounded-xl text-neutral-600 hover:text-neutral-800 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-neutral-50 disabled:hover:text-neutral-600 disabled:cursor-not-allowed transition-all text-xs font-bold"
            >
              上一页
            </button>
            
            {/* Page buttons */}
            <div className="flex items-center gap-1">
              {(() => {
                // Support compact ellipsis pagination if we ever have massive pages,
                // but since list is typically under 5-10 pages, standard range works wonderfully
                return Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center border ${
                      safeCurrentPage === p
                        ? "bg-primary text-white border-primary shadow-sm shadow-primary/10"
                        : "bg-white border-neutral-200/50 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    {p}
                  </button>
                ));
              })()}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={safeCurrentPage === totalPages}
              className="px-3 py-1.5 rounded-xl text-neutral-600 hover:text-neutral-800 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-neutral-50 disabled:hover:text-neutral-600 disabled:cursor-not-allowed transition-all text-xs font-bold"
            >
              下一页
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
