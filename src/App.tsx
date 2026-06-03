/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Resume, 
  JobDescription, 
  Evaluation, 
  GenerationRecord 
} from './types';
import { 
  INITIAL_RESUMES, 
  INITIAL_JDS, 
  INITIAL_EVALUATIONS, 
  INITIAL_RECORDS 
} from './data';

// Component imports
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import ResumeEditor from './components/ResumeEditor';
import JobAnalysis from './components/JobAnalysis';
import EvaluationResult from './components/EvaluationResult';
import HistoryLogs from './components/HistoryLogs';

// Icon imports
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  History, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  Sparkles,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';

export default function App() {
  // 1. Session control state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 2. Navigation State
  const [currentView, setCurrentView] = useState<'dashboard' | 'resumes' | 'jds' | 'history' | 'edit_resume' | 'evaluate' | 'parse'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 3. Database State loaded from localStorage or initialized with defaults
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JobDescription[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  // 4. Temporary selection states
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [activeEvaluationId, setActiveEvaluationId] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  // Loaded at startup
  useEffect(() => {
    // Session restore
    const savedUser = localStorage.getItem('terra_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Session restore error", e);
      }
    }

    // Load data or hydrate mock database defaults
    const keyPrefix = "terra_db_";
    const lsResumes = localStorage.getItem(keyPrefix + "resumes");
    const lsJds = localStorage.getItem(keyPrefix + "jds");
    const lsEvaluations = localStorage.getItem(keyPrefix + "evaluations");
    const lsRecords = localStorage.getItem(keyPrefix + "records");

    if (lsResumes) {
      try {
        let parsed = JSON.parse(lsResumes);
        let migrated = false;
        parsed = parsed.map((r: any) => {
          if (r.title === "Senior UX Designer - Tech Corp") {
            r.title = "资深用户体验设计师 - 科技大厂";
            migrated = true;
          }
          if (r.title === "Product Manager - FinTech Startup") {
            r.title = "产品经理 - 金融科技创业公司";
            migrated = true;
          }
          if (r.title === "Frontend Eng (Draft v2)") {
            r.title = "前端开发工程师 (草稿第二版)";
            migrated = true;
          }
          return r;
        });
        setResumes(parsed);
        if (migrated) {
          localStorage.setItem(keyPrefix + "resumes", JSON.stringify(parsed));
        }
      } catch (err) {
        setResumes(INITIAL_RESUMES);
        localStorage.setItem(keyPrefix + "resumes", JSON.stringify(INITIAL_RESUMES));
      }
    } else {
      setResumes(INITIAL_RESUMES);
      localStorage.setItem(keyPrefix + "resumes", JSON.stringify(INITIAL_RESUMES));
    }

    if (lsJds) {
      setJds(JSON.parse(lsJds));
    } else {
      setJds(INITIAL_JDS);
      localStorage.setItem(keyPrefix + "jds", JSON.stringify(INITIAL_JDS));
    }

    if (lsEvaluations) {
      setEvaluations(JSON.parse(lsEvaluations));
    } else {
      setEvaluations(INITIAL_EVALUATIONS);
      localStorage.setItem(keyPrefix + "evaluations", JSON.stringify(INITIAL_EVALUATIONS));
    }

    if (lsRecords) {
      setRecords(JSON.parse(lsRecords));
    } else {
      setRecords(INITIAL_RECORDS);
      localStorage.setItem(keyPrefix + "records", JSON.stringify(INITIAL_RECORDS));
    }
  }, []);

  // Sync state modifications helper
  const syncStorage = (key: string, data: any) => {
    localStorage.setItem("terra_db_" + key, JSON.stringify(data));
  };

  const syncAllStorage = (state: {
    resumes: Resume[];
    jds: JobDescription[];
    evaluations: Evaluation[];
    records: GenerationRecord[];
  }) => {
    syncStorage("resumes", state.resumes);
    syncStorage("jds", state.jds);
    syncStorage("evaluations", state.evaluations);
    syncStorage("records", state.records);
  };

  const hasRemoteData = (state: {
    resumes: Resume[];
    jds: JobDescription[];
    evaluations: Evaluation[];
    records: GenerationRecord[];
  }) => state.resumes.length > 0 || state.jds.length > 0 || state.evaluations.length > 0 || state.records.length > 0;

  useEffect(() => {
    if (!currentUser) {
      setRemoteLoaded(false);
      return;
    }

    let cancelled = false;
    const loadRemoteState = async () => {
      try {
        const response = await fetch(`/api/data/state?userId=${encodeURIComponent(currentUser.id)}`);
        const data = await response.json();
        if (!response.ok || !data.configured) return;

        const remoteState = {
          resumes: data.resumes ?? [],
          jds: data.jds ?? [],
          evaluations: data.evaluations ?? [],
          records: data.records ?? [],
        };

        if (!cancelled && hasRemoteData(remoteState)) {
          setResumes(remoteState.resumes);
          setJds(remoteState.jds);
          setEvaluations(remoteState.evaluations);
          setRecords(remoteState.records);
          syncAllStorage(remoteState);
        }
      } catch (error) {
        console.warn("Supabase state load skipped:", error);
      } finally {
        if (!cancelled) setRemoteLoaded(true);
      }
    };

    setRemoteLoaded(false);
    loadRemoteState();

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser || !remoteLoaded) return;

    const timer = window.setTimeout(async () => {
      try {
        await fetch('/api/data/state', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            resumes,
            jds,
            evaluations,
            records,
          }),
        });
      } catch (error) {
        console.warn("Supabase state sync skipped:", error);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [currentUser?.id, remoteLoaded, resumes, jds, evaluations, records]);

  // Auth logins
  const handleLoginSuccess = (user: User) => {
    setRemoteLoaded(false);
    setCurrentUser(user);
    localStorage.setItem('terra_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setRemoteLoaded(false);
    setCurrentUser(null);
    localStorage.removeItem('terra_user');
  };

  // State actions
  const handleSaveResume = (savedResume: Resume) => {
    const updated = resumes.some(r => r.id === savedResume.id)
      ? resumes.map(r => r.id === savedResume.id ? savedResume : r)
      : [savedResume, ...resumes];
    
    setResumes(updated);
    syncStorage("resumes", updated);

    // Add logging
    const newRecord: GenerationRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      type: "resume_generate",
      inputSummary: `修改/保存了中文简历「${savedResume.title}」`,
      status: "success",
      resumeId: savedResume.id,
      createdAt: new Date().toISOString()
    };
    const updatedRecs = [newRecord, ...records];
    setRecords(updatedRecs);
    syncStorage("records", updatedRecs);
  };

  const handleDeleteResume = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const target = resumes.find(r => r.id === id);
    if (target) {
      setResumeToDelete(target);
    }
  };

  const executeDeleteResume = () => {
    if (!resumeToDelete) return;
    const id = resumeToDelete.id;
    const target = resumes.find(r => r.id === id);
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    syncStorage("resumes", updated);

    if (selectedResume?.id === id) {
      setSelectedResume(updated[0] || null);
    }

    // Add logging
    const newRecord: GenerationRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      type: "resume_generate",
      inputSummary: `删除了简历「${target?.title || "未知简历"}」`,
      status: "success",
      createdAt: new Date().toISOString()
    };
    const updatedRecs = [newRecord, ...records];
    setRecords(updatedRecs);
    syncStorage("records", updatedRecs);

    setResumeToDelete(null);
  };

  const handleAddJd = (newJd: JobDescription) => {
    const updated = [newJd, ...jds];
    setJds(updated);
    syncStorage("jds", updated);

    // Logging
    const newRecord: GenerationRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      type: "jd_parse",
      inputSummary: `智能解析了招聘 JD「${newJd.title}」`,
      status: "success",
      jdId: newJd.id,
      createdAt: new Date().toISOString()
    };
    const updatedRecs = [newRecord, ...records];
    setRecords(updatedRecs);
    syncStorage("records", updatedRecs);
  };

  const handleDeleteJd = (id: string) => {
    const updated = jds.filter(j => j.id !== id);
    setJds(updated);
    syncStorage("jds", updated);
  };

  // Launch cross core matching evaluate calling server API
  const handleEvaluate = async (resumeId: string, jdId: string): Promise<void> => {
    const targetResume = resumes.find(r => r.id === resumeId);
    const targetJd = jds.find(j => j.id === jdId);

    if (!targetResume || !targetJd) {
      throw new Error("找不到对应的简历或目标岗位数据");
    }

    const response = await fetch('/api/resume/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeContent: targetResume.content,
        jdContent: targetJd
      })
    });

    const evalData = await response.json();
    if (!response.ok) {
      // Log failure in record
      const failRecord: GenerationRecord = {
        id: "rec_" + Math.random().toString(36).substr(2, 9),
        userId: currentUser?.id || "demo_user",
        type: "evaluation",
        inputSummary: `「${targetResume.title}」对标「${targetJd.title}」匹配核对中止`,
        status: "failed",
        resumeId: resumeId,
        jdId: jdId,
        errorMessage: evalData.error || '交叉匹配解析引擎失败',
        createdAt: new Date().toISOString()
      };
      const updatedRecs = [failRecord, ...records];
      setRecords(updatedRecs);
      syncStorage("records", updatedRecs);
      
      throw new Error(evalData.error || '诊断服务请求超时');
    }

    // Insertion payload
    const newEval: Evaluation = {
      ...evalData,
      id: "eval_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      resumeId,
      jdId,
      createdAt: new Date().toISOString()
    };

    const updatedEvals = [newEval, ...evaluations];
    setEvaluations(updatedEvals);
    syncStorage("evaluations", updatedEvals);

    // Log success
    const successRecord: GenerationRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      type: "evaluation",
      inputSummary: `诊断「${targetResume.title}」对标「${targetJd.title}」, 综合评分 ${newEval.totalScore}%`,
      status: "success",
      resumeId,
      jdId,
      evaluationId: newEval.id,
      createdAt: new Date().toISOString()
    };
    const updatedRecs = [successRecord, ...records];
    setRecords(updatedRecs);
    syncStorage("records", updatedRecs);

    // Transition view
    setActiveEvaluationId(newEval.id);
    setSelectedResume(targetResume);
    setCurrentView('evaluate');
  };

  // Optimize handler (API proxy called under Evaluation panel)
  const handleOptimize = async (evaluationId: string): Promise<{ content: any, diffSummary: any[] }> => {
    const targetEval = evaluations.find(e => e.id === evaluationId);
    if (!targetEval) throw new Error("诊断报告不存在");

    const targetResume = resumes.find(r => r.id === targetEval.resumeId);
    const targetJd = jds.find(j => j.id === targetEval.jdId);

    if (!targetResume || !targetJd) throw new Error("对应简历或JD数据已丢失");

    const response = await fetch('/api/resume/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeContent: targetResume.content,
        jdContent: targetJd,
        evaluationResult: targetEval
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "大厂优化副本生成失败");
    }

    return {
      content: data.content,
      diffSummary: data.diffSummary
    };
  };

  // Convert optimizer structure back into a persistent resume record copies
  const handleSaveOptimizedResume = (
    originalResume: Resume,
    optimizedContent: any,
    relatedJdId: string,
    relatedEvaluationId: string
  ) => {
    const parentJd = jds.find(j => j.id === relatedJdId);
    const jdTitle = parentJd ? parentJd.title : "适配岗位";

    const optResume: Resume = {
      id: "res_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      title: `${originalResume.title} (JD 优化适配版)`,
      templateId: originalResume.templateId || "simple",
      versionType: "jd_optimized",
      relatedJdId,
      relatedEvaluationId,
      content: optimizedContent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedResumes = [optResume, ...resumes];
    setResumes(updatedResumes);
    syncStorage("resumes", updatedResumes);

    // Log success in logs
    const newRecord: GenerationRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || "demo_user",
      type: "jd_resume_optimize",
      inputSummary: `一键套修「${originalResume.title}」以高度对标「${jdTitle}」A4副本`,
      status: "success",
      resumeId: optResume.id,
      jdId: relatedJdId,
      createdAt: new Date().toISOString()
    };
    const updatedRecs = [newRecord, ...records];
    setRecords(updatedRecs);
    syncStorage("records", updatedRecs);
  };

  // Navigation callbacks
  const handleSelectResume = (resume: Resume) => {
    setSelectedResume(resume);
  };

  const handleSelectEvaluation = (id: string) => {
    const evalObj = evaluations.find(e => e.id === id);
    if (!evalObj) return;

    const resObj = resumes.find(r => r.id === evalObj.resumeId);
    if (resObj) {
      setSelectedResume(resObj);
    }
    setActiveEvaluationId(id);
    setCurrentView('evaluate');
  };

  // If there's no active user session, direct load Login Screener
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Active evaluation resolver helpers
  const activeEval = evaluations.find(e => e.id === activeEvaluationId);
  const activeJd = jds.find(j => j.id === activeEval?.jdId);

  return (
    <div className="min-h-screen bg-warm-bg flex flex-col md:flex-row text-neutral-800">
      
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className={`bg-white border-r border-[#ece3d3]/80 w-full md:w-64 flex flex-col justify-between shrink-0 transition-transform z-20 ${
        sidebarOpen ? 'block' : 'hidden md:flex'
      } no-print`}>
        <div className="flex flex-col">
          {/* Logo brand area */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center font-serif text-lg font-extrabold shadow-sm">
                T
              </div>
              <div>
                <h2 className="font-serif font-extrabold text-[#2e3230] text-base leading-tight">Terra 简历</h2>
                <span className="text-[10px] text-[#705c30] bg-[#f7f3eb] px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block">专业简历优化专家</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation menus */}
          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => { setCurrentView('dashboard'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentView === 'dashboard'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              工作台
            </button>

            <button
              onClick={() => { setSelectedResume(resumes[0] || null); setCurrentView('edit_resume'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentView === 'edit_resume'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              简历管理 & 编辑
            </button>

            <button
              onClick={() => { setCurrentView('jds'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentView === 'jds'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              职位分析 & 交叉比对
            </button>

            <button
              onClick={() => { setCurrentView('history'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                currentView === 'history'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              <History className="w-4 h-4" />
              历史审计明细
            </button>
          </nav>
        </div>

        {/* User logout section */}
        <div className="p-4 border-t border-neutral-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-neutral-800 truncate font-mono">{currentUser.phone}</p>
              <span className="text-[9px] text-neutral-400">DEMO ROLE — USER</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-4 h-4" />
            安全退出系统
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden bg-white border-b border-neutral-200/60 p-4 sticky top-0 flex items-center justify-between z-30 no-print">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-neutral-500 hover:text-neutral-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif font-extrabold text-neutral-800 text-sm">Terra 简历</span>
        </div>
        
        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
          专业简历优化专家
        </span>
      </header>

      {/* 2. Main content router stage */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto min-h-screen">
        
        {currentView === 'dashboard' && (
          <Dashboard
            resumes={resumes}
            jds={jds}
            evaluations={evaluations}
            records={records}
            onSelectResume={handleSelectResume}
            onSelectEvaluation={handleSelectEvaluation}
            onNavigate={setCurrentView}
            onDeleteResume={handleDeleteResume}
          />
        )}

        {currentView === 'edit_resume' && (
          <ResumeEditor
            initialResume={selectedResume}
            onSave={handleSaveResume}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'jds' && (
          <JobAnalysis
            jds={jds}
            resumes={resumes}
            onAddJd={handleAddJd}
            onDeleteJd={handleDeleteJd}
            onEvaluate={handleEvaluate}
            onNavigate={setCurrentView}
          />
        )}

        {currentView === 'evaluate' && activeEval && selectedResume && activeJd && (
          <EvaluationResult
            evaluation={activeEval}
            resume={selectedResume}
            jd={activeJd}
            onNavigate={setCurrentView}
            onOptimize={handleOptimize}
            onSaveOptimizedResume={handleSaveOptimizedResume}
          />
        )}

        {currentView === 'history' && (
          <HistoryLogs
            records={records}
            resumes={resumes}
            jds={jds}
            onNavigate={setCurrentView}
            onSelectResume={handleSelectResume}
            onSelectEvaluation={handleSelectEvaluation}
          />
        )}

        {currentView === 'resumes' && (
          <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex justify-between items-center border-b pb-5">
              <div>
                <h1 className="text-3xl font-serif font-bold text-neutral-800 tracking-tight">我的简历专区</h1>
                <p className="text-xs text-neutral-500 mt-1">管理并精校您的通用简约、技术特化或者一键大厂对标改写的简历。</p>
              </div>
              <button
                onClick={() => { setSelectedResume(null); setCurrentView('edit_resume'); }}
                className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl flex items-center gap-1.5 transition-all"
              >
                新建空白简历 <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div 
                  key={resume.id}
                  onClick={() => { setSelectedResume(resume); setCurrentView('edit_resume'); }}
                  className="bg-white p-6 rounded-3xl border border-neutral-100 hover:border-primary/20 hover:shadow-warm-lg cursor-pointer transition-all relative overflow-hidden group space-y-4"
                >
                  <span className={`absolute top-0 left-0 w-1.5 h-full ${
                    resume.versionType === 'jd_optimized' ? 'bg-primary' : 'bg-neutral-300'
                  }`} />

                  <div className="flex justify-between items-center text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      resume.versionType === 'jd_optimized' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      {resume.versionType === 'jd_optimized' ? '大厂适配副本' : '原始版本'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-400 font-mono font-bold">
                        {new Date(resume.updatedAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => handleDeleteResume(resume.id, e)}
                        className="text-neutral-400 hover:text-rose-500 p-1 rounded hover:bg-neutral-100 transition-colors z-10"
                        title="删除简历"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-neutral-800 text-lg group-hover:text-primary transition-colors">
                      {resume.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      姓名：{resume.content.basicInfo.name || '未填写'} • 意向岗位：{resume.content.basicInfo.intention || '未分配'}
                    </p>
                  </div>

                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {resume.content.summary || "点击补充个人总结，优化改写后将替换在此处展示。"}
                  </p>

                  <div className="pt-3 border-t flex flex-wrap gap-1.5">
                    {resume.content.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className="bg-neutral-50 text-neutral-700 text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {skill}
                      </span>
                    ))}
                    {resume.content.skills.length > 4 && (
                      <span className="text-[10px] text-neutral-400">+{resume.content.skills.length - 4}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 确认删除对话框 Modal */}
      {resumeToDelete && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-neutral-100 overflow-hidden transform scale-100 transition-all p-6 space-y-5">
            <div className="flex items-center gap-3.5 text-rose-600">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-[#2e3230] text-lg">确认要删除此简历吗？</h3>
                <p className="text-stone-500 text-xs mt-0.5">该操作执行后将无法复原。</p>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100/60 font-serif font-bold text-[#2e3230] text-sm overflow-hidden text-ellipsis whitespace-nowrap">
              {resumeToDelete.title}
            </div>

            <p className="text-stone-500 text-xs leading-relaxed">
              确定要彻底删除该简历及相关历史版本副本吗？系统将从您的持久本地缓存中清除所有相关数据。
            </p>

            <div className="grid grid-cols-2 gap-3.5 pt-1">
              <button
                type="button"
                onClick={() => setResumeToDelete(null)}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition-all text-center"
              >
                取消
              </button>
              <button
                type="button"
                onClick={executeDeleteResume}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all text-center shadow-lg shadow-rose-600/10"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
