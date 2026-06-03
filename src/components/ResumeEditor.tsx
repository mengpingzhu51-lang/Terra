/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Resume, ResumeContent, Education, WorkExperience, ProjectExperience } from '../types';
import { 
  Save, 
  Download, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft, 
  User, 
  GraduationCap, 
  Briefcase, 
  Cpu, 
  FileCheck, 
  UploadCloud, 
  ChevronRight, 
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface ResumeEditorProps {
  initialResume: Resume | null;
  onSave: (resume: Resume) => void;
  onNavigate: (view: 'dashboard' | 'resumes' | 'jds' | 'history' | 'edit_resume') => void;
}

const TEMPLATES = [
  { id: 'simple', name: '极简流线型 (简洁专业)' },
  { id: 'technical', name: '技术极客版 (突出工程栈)' },
  { id: 'highlight', name: '成果聚焦型 (突显高指标)' }
];

export default function ResumeEditor({ initialResume, onSave, onNavigate }: ResumeEditorProps) {
  // Setup editor state
  const [title, setTitle] = useState(initialResume ? initialResume.title : "新建中文简历");
  const [templateId, setTemplateId] = useState(initialResume ? initialResume.templateId : "simple");
  const [content, setContent] = useState<ResumeContent>(
    initialResume?.content || {
      basicInfo: { name: '', phone: '', email: '', city: '', intention: '', links: '' },
      education: [],
      workExperience: [],
      projects: [],
      skills: [],
      summary: ''
    }
  );

  // States for uploading attachments
  const [isParsing, setIsParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // 1. Basic Info change handler
  const handleBasicInfoChange = (field: keyof typeof content.basicInfo, value: string) => {
    setContent(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        [field]: value
      }
    }));
  };

  // 2. Education Handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: "edu_" + Math.random().toString(36).substr(2, 9),
      school: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setContent(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const removeEducation = (id: string) => {
    setContent(prev => ({ ...prev, education: prev.education.filter(e => e.id !== id) }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setContent(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  // 3. Work Experience Handlers
  const addWork = () => {
    const newWork: WorkExperience = {
      id: "work_" + Math.random().toString(36).substr(2, 9),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      content: ''
    };
    setContent(prev => ({ ...prev, workExperience: [...prev.workExperience, newWork] }));
  };

  const removeWork = (id: string) => {
    setContent(prev => ({ ...prev, workExperience: prev.workExperience.filter(w => w.id !== id) }));
  };

  const handleWorkChange = (id: string, field: keyof WorkExperience, value: string) => {
    setContent(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(work => work.id === id ? { ...work, [field]: value } : work)
    }));
  };

  // 4. Project Handlers
  const addProject = () => {
    const newProj: ProjectExperience = {
      id: "proj_" + Math.random().toString(36).substr(2, 9),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      background: '',
      responsibilities: '',
      results: ''
    };
    setContent(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const removeProject = (id: string) => {
    setContent(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const handleProjectChange = (id: string, field: keyof ProjectExperience, value: string) => {
    setContent(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    }));
  };

  // 5. PDF Upload and Gemini Parse Action
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('文件超限！上传文件大小不能超过10MB');
      return;
    }

    setIsParsing(true);
    setError('');
    setParseMessage('正在通过智能安全层读取简历数据...');

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const raw = reader.result as string;
          resolve(raw.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      setParseMessage('正在解析中文语法并调用 Gemini 推送多源结构化转换 (平均需要 5-8s)...');

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64Data,
          mimeType: file.type
        })
      });

      const parsedData = await response.json();
      if (!response.ok) {
        throw new Error(parsedData.error || '解析服务发生异常，可尝试直接贴入或者重试。');
      }

      // Merge results
      setContent(parsedData);
      setTitle(`${parsedData.basicInfo.name || '自动解析'}_中文微调简历`);
      setParseMessage('解析转换成功！内容已为您录入，请核实细节！');
      setTimeout(() => setParseMessage(''), 3000);
    } catch (err: any) {
      setError(err?.message || '简历解析解析失败，您可以在左侧手动快速填写！');
    } finally {
      setIsParsing(false);
    }
  };

  // 6. Direct Paste Option
  const [pasteText, setPasteText] = useState('');
  const [showPasteArea, setShowPasteArea] = useState(false);
  const handlePasteParse = async () => {
    if (!pasteText.trim()) return;

    setIsParsing(true);
    setError('');
    setParseMessage('正在分析粘贴的原始文本并提取语义要素...');

    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: pasteText
        })
      });

      const parsedData = await response.json();
      if (!response.ok) {
        throw new Error(parsedData.error || '提取失败，可尝试手动排版。');
      }

      setContent(parsedData);
      setTitle(`${parsedData.basicInfo.name || '粘贴导入'}_新世代简历`);
      setShowPasteArea(false);
      setPasteText('');
      setParseMessage('文本导入还原结构化成功！');
      setTimeout(() => setParseMessage(''), 3000);
    } catch (err: any) {
      setError(err?.message || '文本提取异常，请修改格式再试。');
    } finally {
      setIsParsing(false);
    }
  };

  // 7. Save handler
  const handleSave = () => {
    setIsSaving(true);
    const savedResume: Resume = {
      id: initialResume?.id || "res_" + Math.random().toString(36).substr(2, 9),
      userId: initialResume?.userId || "demo_user",
      title: title || "无标题中文简历",
      templateId,
      versionType: initialResume?.versionType || "original",
      relatedJdId: initialResume?.relatedJdId,
      relatedEvaluationId: initialResume?.relatedEvaluationId,
      content,
      createdAt: initialResume?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTimeout(() => {
      onSave(savedResume);
      setIsSaving(false);
      onNavigate('resumes');
    }, 800);
  };

  // 8. Print PDF handler
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans animate-fade-in no-print pb-12">
      
      {/* Top action row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-200/60 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('resumes')}
            className="p-2 border border-neutral-200/60 hover:bg-white rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-serif font-bold text-neutral-800 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-primary focus:outline-none transition-all py-0.5"
              />
              <span className="text-xs font-semibold px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full shrink-0">
                {initialResume?.versionType === 'jd_optimized' ? 'JD优化副本' : '原始版本'}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">编辑您的个人教育、实操履历，右侧实时更新渲染 A4</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-semibold bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 text-neutral-700 transition-all flex items-center justify-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? '正在保存...' : '暂存草稿'}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            导出 PDF (A4纸张)
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-700 flex gap-2">
          <span>{error}</span>
        </div>
      )}

      {parseMessage && (
        <div className="bg-primary-light border border-primary/20 p-3 rounded-xl text-xs text-primary flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0 text-primary" />
          <span>{parseMessage}</span>
        </div>
      )}

      {/* Main Grid: Inputs on Left, Visual Preview simulator on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch lg:h-[82vh]">
        
        {/* Left Hand: INPUT EDITOR FORM CARD WRAPPER */}
        <div className="lg:col-span-5 bg-white/45 p-6 rounded-3xl border border-neutral-100/60 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Quick Import Card */}
          <div className="bg-[#FAF6F0] border-2 border-dashed border-primary/20 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-800">上传附件智能解析填充</h4>
              <p className="text-xs text-neutral-500 mt-1">支持 PDF 格式，AI 解析后可再编辑修改并导出</p>
            </div>
            
            <div className="flex gap-2 justify-center">
              <label className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-hover rounded-lg cursor-pointer transition-all">
                立即上传
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowPasteArea(!showPasteArea)}
                type="button"
                className="px-4 py-2 text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 rounded-lg transition-all"
              >
                直接贴文本
              </button>
            </div>

            {showPasteArea && (
              <div className="mt-4 text-left border-t border-neutral-200 pt-4 space-y-2">
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={4}
                  placeholder="在此贴入原始乱序简历文本..."
                  className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <button
                  type="button"
                  onClick={handlePasteParse}
                  className="px-3 py-1.5 text-[11px] font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors"
                >
                  确认导入文本
                </button>
              </div>
            )}
          </div>

          {/* Module: Template & style select */}
          <div className="bg-white p-5 rounded-2xl shadow-warm border border-neutral-100 space-y-3">
            <h3 className="font-serif font-bold text-neutral-800 text-sm">选择渲染模板风格</h3>
            <div className="grid grid-cols-1 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setTemplateId(tpl.id)}
                  type="button"
                  className={`px-4 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                    templateId === tpl.id 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Module: Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <User className="w-4 h-4 text-primary" />
              <h3 className="font-serif font-bold text-neutral-800 text-sm">基本个人信息</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">姓名</label>
                <input
                  type="text"
                  value={content.basicInfo.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  placeholder="如：李明"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">求职意向/目标</label>
                <input
                  type="text"
                  value={content.basicInfo.intention}
                  onChange={(e) => handleBasicInfoChange('intention', e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  placeholder="资深用户体验设计师"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">手机电话</label>
                <input
                  type="text"
                  value={content.basicInfo.phone}
                  onChange={(e) => handleBasicInfoChange('phone', e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  placeholder="138-0000-0000"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">电子邮箱</label>
                <input
                  type="text"
                  value={content.basicInfo.email}
                  onChange={(e) => handleBasicInfoChange('email', e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  placeholder="liming@example.com"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">常驻/意向城市</label>
                <input
                  type="text"
                  value={content.basicInfo.city}
                  onChange={(e) => handleBasicInfoChange('city', e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  placeholder="深圳市，南山区"
                />
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">在线作品集/个人链接 (可选)</label>
                <input
                  type="text"
                  value={content.basicInfo.links || ''}
                  onChange={(e) => handleBasicInfoChange('links', e.target.value)}
                  className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl"
                  placeholder="GitHub / Dribbble 地址"
                />
              </div>
            </div>
          </div>

          {/* Module: Education */}
          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-neutral-800 text-sm">教育学习背景</h3>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 添加经历
              </button>
            </div>

            <div className="space-y-4">
              {content.education.map((edu, index) => (
                <div key={edu.id} className="p-4 bg-neutral-50 rounded-xl space-y-3 relative">
                  <button
                    onClick={() => removeEducation(edu.id)}
                    type="button"
                    className="absolute top-4 right-4 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h4 className="text-xs font-bold text-neutral-400 font-sans"># 教育 #{index + 1}</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">学校</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                        placeholder="华南理工大学"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">专业</label>
                      <input
                        type="text"
                        value={edu.major}
                        onChange={(e) => handleEducationChange(edu.id, 'major', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                        placeholder="软件工程"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">学历</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                        placeholder="本科/硕士"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1">入学时间</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-mono"
                          placeholder="2016-09"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1"> graduation </label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-mono"
                          placeholder="2020-06"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">课程表现/荣誉陈述</label>
                    <textarea
                      value={edu.description || ''}
                      onChange={(e) => handleEducationChange(edu.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                      placeholder="核心主修绩点名列前茅、主修人机交互设计规范。"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module: Work Experience */}
          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-neutral-800 text-sm">工作经历纪事</h3>
              </div>
              <button
                type="button"
                onClick={addWork}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 添加工作
              </button>
            </div>

            <div className="space-y-4">
              {content.workExperience.map((work, index) => (
                <div key={work.id} className="p-4 bg-neutral-50 rounded-xl space-y-3 relative">
                  <button
                    onClick={() => removeWork(work.id)}
                    type="button"
                    className="absolute top-4 right-4 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h4 className="text-xs font-bold text-neutral-400 font-sans"># 工作 #{index + 1}</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">企业/公司名称</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => handleWorkChange(work.id, 'company', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg text-sm font-bold"
                        placeholder="星海科技有限公司"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">所任职务/职级</label>
                      <input
                        type="text"
                        value={work.position}
                        onChange={(e) => handleWorkChange(work.id, 'position', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                        placeholder="高级 UX / 前端开发设计师"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">入职日期（开始）</label>
                      <input
                        type="text"
                        value={work.startDate}
                        onChange={(e) => handleWorkChange(work.id, 'startDate', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-mono"
                        placeholder="2020.07"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">离职日期（或填 至今）</label>
                      <input
                        type="text"
                        value={work.endDate}
                        onChange={(e) => handleWorkChange(work.id, 'endDate', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-mono"
                        placeholder="2023.10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">核心职责与成果业绩 (多行/换行列表)</label>
                    <textarea
                      value={work.content}
                      onChange={(e) => handleWorkChange(work.id, 'content', e.target.value)}
                      rows={5}
                      className="w-full text-xs p-2.5 bg-white border border-neutral-200 rounded-lg font-sans"
                      placeholder="• 采用 Vue3 + TypeScript 进行底层研发。\n• 组织微前端重构，加快界面流畅度达 40%。"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module: Projects */}
          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-neutral-800 text-sm">重大项目实践</h3>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> 添加项目
              </button>
            </div>

            <div className="space-y-4">
              {content.projects.map((proj, index) => (
                <div key={proj.id} className="p-4 bg-neutral-50 rounded-xl space-y-3 relative">
                  <button
                    onClick={() => removeProject(proj.id)}
                    type="button"
                    className="absolute top-4 right-4 text-neutral-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <h4 className="text-xs font-bold text-neutral-400 font-sans"># 项目 #{index + 1}</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] text-neutral-500 mb-1">项目名称</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleProjectChange(proj.id, 'name', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-bold"
                        placeholder="智能协作网络看板看板端核心功能研发"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 mb-1">项目职责角色</label>
                      <input
                        type="text"
                        value={proj.role}
                        onChange={(e) => handleProjectChange(proj.id, 'role', e.target.value)}
                        className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg"
                        placeholder="第一研发/总架构"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1">开始时间</label>
                        <input
                          type="text"
                          value={proj.startDate}
                          onChange={(e) => handleProjectChange(proj.id, 'startDate', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-mono"
                          placeholder="2021.03"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-neutral-500 mb-1">结束时间</label>
                        <input
                          type="text"
                          value={proj.endDate}
                          onChange={(e) => handleProjectChange(proj.id, 'endDate', e.target.value)}
                          className="w-full text-xs p-2 bg-white border border-neutral-200 rounded-lg font-mono"
                          placeholder="2022.05"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">立项产品背景</label>
                    <input
                      type="text"
                      value={proj.background || ''}
                      onChange={(e) => handleProjectChange(proj.id, 'background', e.target.value)}
                      className="w-full text-xs p-1.5 bg-white border border-neutral-200 rounded-lg"
                      placeholder="老系统在高峰端存在极其庞杂的卡顿和多层流阻塞，阻碍了千人协同，故主导重组"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">个人主要职责</label>
                    <textarea
                      value={proj.responsibilities || ''}
                      onChange={(e) => handleProjectChange(proj.id, 'responsibilities', e.target.value)}
                      rows={2}
                      className="w-full text-xs p-1.5 bg-white border border-neutral-200 rounded-lg"
                      placeholder="主导拖拽交互和组件树解耦合设计..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-500 mb-1">项目业绩与量化成果</label>
                    <textarea
                      value={proj.results || ''}
                      onChange={(e) => handleProjectChange(proj.id, 'results', e.target.value)}
                      rows={2}
                      className="w-full text-xs p-1.5 bg-white border border-neutral-200 rounded-lg"
                      placeholder="页面延迟由 300ms 降低至 40ms，获得金牌工程奖。"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module: Technical skills comma-split */}
          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Cpu className="w-4 h-4 text-primary" />
              <h3 className="font-serif font-bold text-neutral-800 text-sm">专业技能清单</h3>
            </div>
            
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">技能库 (英文逗号分号分割各个标签)</label>
              <textarea
                value={content.skills.join(', ')}
                onChange={(e) => {
                  const items = e.target.value.split(/[，,、;]+/);
                  setContent(prev => ({ ...prev, skills: items.map(s => s.trim()).filter(Boolean) }));
                }}
                rows={3}
                className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono leading-relaxed"
                placeholder="Figma, TypeScript, Vue3, React, Webpack, Axure, HTML5,组件重构"
              />
            </div>
          </div>

          {/* Module: Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-warm border border-neutral-100 space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <FileCheck className="w-4 h-4 text-primary" />
              <h3 className="font-serif font-bold text-neutral-800 text-sm">个人亮点总结</h3>
            </div>
            
            <div>
              <label className="block text-[11px] text-neutral-500 mb-1">职业亮点与综合提炼</label>
              <textarea
                value={content.summary || ''}
                onChange={(e) => setContent(prev => ({ ...prev, summary: e.target.value }))}
                rows={3}
                className="w-full text-xs p-3 bg-neutral-50 border border-neutral-200 rounded-xl leading-relaxed"
                placeholder="4年专注在 B端设计和工程领域，有多个爆款经验和跨端落地实力。热爱研究人机交互最新准则..."
              />
            </div>
          </div>

          </div>
        </div>

        {/* Right Hand: LIVE A4 PRINT REPLICATOR */}
        <div className="lg:col-span-7 flex flex-col bg-neutral-100/65 p-6 rounded-3xl h-full overflow-hidden shadow-sm">
          
          <div className="mb-4 bg-white px-4 py-1.5 rounded-full shadow-sm text-xs font-semibold text-neutral-500 flex items-center justify-center gap-1.5 shrink-0 self-center">
            <Maximize2 className="w-3.5 h-3.5" />
            标准 A4 页面渲染视力仿真模拟（印刷或保存即得同等品质）
          </div>

          {/* Scrollable Container for A4 canvas */}
          <div className="flex-1 overflow-y-auto custom-scrollbar w-full flex justify-center p-1">
            {/* A4 Sandbox canvas */}
            <div 
              id="print-resume-canvas"
              className="w-[210mm] min-h-[297mm] bg-white p-[18mm] shadow-warm text-neutral-800 font-sans text-xs flex flex-col justify-between shrink-0"
              style={{ 
                aspectRatio: '1 / 1.414', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
                fontFamily: templateId === 'technical' ? 'var(--font-sans)' : 'var(--font-sans)'
              }}
            >
            
            {/* Template type simple */}
            {templateId === 'simple' && (
              <div className="space-y-6">
                {/* Header block */}
                <div className="border-b-2 border-primary/20 pb-4 text-center">
                  <h1 className="text-2xl font-serif font-extrabold text-neutral-900 tracking-tight">
                    {content.basicInfo.name || '姓名'}
                  </h1>
                  <p className="text-xs text-primary font-bold tracking-widest mt-1">
                    {content.basicInfo.intention || '求职意向/高级用户体验设计师'}
                  </p>
                  
                  {/* Contact row */}
                  <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-neutral-500 font-mono">
                    {content.basicInfo.phone && <span>📞 {content.basicInfo.phone}</span>}
                    {content.basicInfo.email && <span>📧 {content.basicInfo.email}</span>}
                    {content.basicInfo.city && <span>📍 {content.basicInfo.city}</span>}
                    {content.basicInfo.links && <span className="underline select-all">🔗 {content.basicInfo.links}</span>}
                  </div>
                </div>

                {/* Summary Section */}
                {content.summary && (
                  <div className="space-y-1.5">
                    <h3 className="text-[12px] font-bold text-primary tracking-wide font-serif border-l-4 border-primary pl-2 uppercase">
                      个人亮点总结
                    </h3>
                    <p className="text-[11px] text-neutral-600 leading-relaxed pl-3 font-sans">
                      {content.summary}
                    </p>
                  </div>
                )}

                {/* Education Section */}
                {content.education.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[12px] font-bold text-primary tracking-wide font-serif border-l-4 border-primary pl-2 uppercase">
                      教育背景历程
                    </h3>
                    <div className="space-y-3 pl-3">
                      {content.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start text-[11px]">
                          <div>
                            <span className="font-bold text-neutral-800 text-sm font-serif">{edu.school}</span>
                            <span className="text-neutral-500 ml-2 font-mono">| {edu.degree} · {edu.major}</span>
                            {edu.description && <p className="text-neutral-500 mt-1">{edu.description}</p>}
                          </div>
                          <span className="font-mono text-neutral-400 font-semibold shrink-0">
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience Section */}
                {content.workExperience.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[12px] font-bold text-primary tracking-wide font-serif border-l-4 border-primary pl-2 uppercase">
                      主要工作履历
                    </h3>
                    <div className="space-y-4 pl-3">
                      {content.workExperience.map((work) => (
                        <div key={work.id} className="space-y-2 text-[11px]">
                          <div className="flex justify-between font-bold text-neutral-800 text-sm">
                            <span className="font-serif">{work.company} · <span className="font-sans font-bold text-xs text-primary">{work.position}</span></span>
                            <span className="font-mono text-neutral-400 shrink-0 font-semibold">{work.startDate} - {work.endDate}</span>
                          </div>
                          <pre className="text-neutral-600 leading-relaxed font-sans whitespace-pre-wrap text-xs">
                            {work.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {content.projects.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[12px] font-bold text-primary tracking-wide font-serif border-l-4 border-primary pl-2 uppercase">
                      重大项目实干
                    </h3>
                    <div className="space-y-4 pl-3">
                      {content.projects.map((proj) => (
                        <div key={proj.id} className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between font-bold text-neutral-800 text-sm">
                            <span className="font-serif">{proj.name} — <span className="font-sans font-bold text-xs text-neutral-500">{proj.role}</span></span>
                            <span className="font-mono text-neutral-400 shrink-0 font-semibold">{proj.startDate} - {proj.endDate}</span>
                          </div>
                          
                          {proj.background && (
                            <p className="text-neutral-600"><strong className="text-neutral-700">项目背景:</strong> {proj.background}</p>
                          )}
                          {proj.responsibilities && (
                            <p className="text-neutral-600"><strong className="text-neutral-700">核心开发/职责:</strong> {proj.responsibilities}</p>
                          )}
                          {proj.results && (
                            <p className="text-neutral-600 bg-neutral-50 p-1 rounded"><strong className="text-primary">量化业绩:</strong> {proj.results}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills section */}
                {content.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[12px] font-bold text-primary tracking-wide font-serif border-l-4 border-primary pl-2 uppercase">
                      掌握专业技能
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pl-3">
                      {content.skills.map((skill, index) => (
                        <span key={index} className="bg-neutral-50 text-neutral-800 text-xs px-2 py-0.5 rounded border border-neutral-200/60 font-mono font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Template type technical */}
            {templateId === 'technical' && (
              <div className="space-y-6">
                {/* Header block asymmetrical */}
                <div className="flex justify-between items-start border-b border-neutral-300 pb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900 font-mono tracking-tight">
                      {content.basicInfo.name || '姓名'}
                    </h1>
                    <p className="text-xs text-emerald-800 bg-[#eef6f0] px-2 py-0.5 mt-1 font-semibold rounded font-mono inline-block">
                      {content.basicInfo.intention || '高级前端工程师'}
                    </p>
                  </div>
                  
                  <div className="text-right text-[10px] text-neutral-500 font-mono space-y-0.5">
                    {content.basicInfo.phone && <p>📞 {content.basicInfo.phone}</p>}
                    {content.basicInfo.email && <p>📧 {content.basicInfo.email}</p>}
                    {content.basicInfo.city && <p>📍 {content.basicInfo.city}</p>}
                    {content.basicInfo.links && <p className="underline truncate max-w-[200px]">🔗 {content.basicInfo.links}</p>}
                  </div>
                </div>

                {/* Tech Skills Box prominent */}
                {content.skills.length > 0 && (
                  <div className="bg-neutral-50 p-3.5 rounded-lg border border-neutral-200/60">
                    <h3 className="text-[11px] font-bold text-neutral-700 uppercase tracking-widest font-mono mb-2">
                        // 核心架构与工具栈群谱
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {content.skills.map((skill, index) => (
                        <span key={index} className="bg-white text-emerald-900 border border-emerald-200 text-xs px-2 py-0.5 rounded font-mono font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {content.summary && (
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase font-mono">
                      ## 研发工程亮点概述
                    </h3>
                    <p className="text-[11px] text-neutral-600 leading-relaxed font-mono">
                      {content.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {content.workExperience.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase font-mono">
                      ## 前端与服务端工程经历
                    </h3>
                    <div className="space-y-3">
                      {content.workExperience.map((work) => (
                        <div key={work.id} className="space-y-1 border-l-2 border-emerald-700/20 pl-3">
                          <div className="flex justify-between items-center bg-neutral-50/50 p-1 px-2 rounded">
                            <span className="font-bold text-neutral-800 text-xs font-mono">{work.company} · {work.position}</span>
                            <span className="font-mono text-neutral-400 text-[10px]">{work.startDate} - {work.endDate}</span>
                          </div>
                          <pre className="text-neutral-600 leading-relaxed font-sans whitespace-pre-wrap text-xs">
                            {work.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {content.projects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase font-mono">
                      ## 重大交付项目与攻关事实
                    </h3>
                    <div className="space-y-3">
                      {content.projects.map((proj) => (
                        <div key={proj.id} className="space-y-1.5 pl-3 border-l-2 border-emerald-700/20">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-neutral-800 text-xs font-mono">{proj.name} — {proj.role}</span>
                            <span className="font-mono text-neutral-400 text-[10px]">{proj.startDate} - {proj.endDate}</span>
                          </div>
                          {proj.background && (
                            <p className="text-neutral-600 text-xs"><span className="text-neutral-500 font-mono">[背景]:</span> {proj.background}</p>
                          )}
                          {proj.responsibilities && (
                            <p className="text-neutral-600 text-xs"><span className="text-neutral-500 font-mono">[主研]:</span> {proj.responsibilities}</p>
                          )}
                          {proj.results && (
                            <p className="text-neutral-700 text-xs bg-emerald-50/20 px-1 border-l border-emerald-600"><span className="text-emerald-800 font-mono">[交付指标]:</span> {proj.results}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {content.education.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase font-mono">
                      ## 学历资质背景
                    </h3>
                    <div className="space-y-2 pl-3">
                      {content.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-center text-[11px]">
                          <div>
                            <span className="font-bold text-neutral-800 font-mono">{edu.school}</span>
                            <span className="text-neutral-500 ml-2 font-mono">({edu.degree} · {edu.major})</span>
                          </div>
                          <span className="font-mono text-neutral-400 font-semibold">
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Template type highlight */}
            {templateId === 'highlight' && (
              <div className="space-y-5">
                {/* Header block with elegant desaturated border */}
                <div className="border-[#705c30] border-t-4 pt-4 pb-3 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-serif font-extrabold text-[#705c30] tracking-tight">
                      {content.basicInfo.name || '姓名'}
                    </h1>
                    <p className="text-xs text-neutral-500 font-serif italic mt-1 font-medium">
                      {content.basicInfo.intention || '资深高级产品经理'}
                    </p>
                  </div>
                  
                  <div className="text-right text-[10px] text-neutral-400 font-mono text-xs space-y-0.5">
                    <p>📍 {content.basicInfo.city}</p>
                    <p>📞 {content.basicInfo.phone}</p>
                    <p>✉️ {content.basicInfo.email}</p>
                    {content.basicInfo.links && <p className="underline truncate max-w-[200px]">🔗 {content.basicInfo.links}</p>}
                  </div>
                </div>

                {/* Summary */}
                {content.summary && (
                  <div className="bg-[#FAF6F0] p-3 rounded-lg border border-[#705c30]/10">
                    <h3 className="text-[11px] font-bold text-[#705c30] tracking-wider uppercase border-b border-[#705c30]/20 pb-1 mb-1.5 font-serif">
                      职业里程亮点
                    </h3>
                    <p className="text-[11px] text-[#705c30]/90 leading-relaxed font-sans">
                      {content.summary}
                    </p>
                  </div>
                )}

                {/* Major Achievements (Quantifiable Results summary) - calculated from projects results */}
                <div className="space-y-1.5">
                  <h3 className="text-[11px] font-bold text-[#705c30] tracking-wide font-serif border-b border-neutral-200 pb-1 uppercase">
                    核心量化业绩指标及攻坚事实
                  </h3>
                  <ul className="list-disc pl-5 text-[11px] text-neutral-700 leading-relaxed space-y-1 font-semibold">
                    {content.projects.filter(p => !!p.results).map((p, index) => (
                      <li key={index} className="text-[#705c30] bg-[#FAF6F0]/20 p-1 rounded border-l border-[#705c30]/30 font-serif">
                        {p.results} (在「{p.name}」中重点攻坚达成)
                      </li>
                    ))}
                    {content.workExperience.length > 0 && (
                      <li className="text-neutral-600 font-sans font-normal list-none mt-1 pl-1">
                        * 拥有 {content.workExperience.length} 段高水准技术实干成长历程，积累了丰富的团队对齐及交付敏捷习惯。
                      </li>
                    )}
                  </ul>
                </div>

                {/* Work Experience Section */}
                {content.workExperience.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="text-[11px] font-bold text-neutral-800 tracking-wide font-serif border-b border-neutral-200 pb-1 uppercase">
                      主要从业历程纪事
                    </h3>
                    <div className="space-y-3.5">
                      {content.workExperience.map((work) => (
                        <div key={work.id} className="space-y-1 text-[11px]">
                          <div className="flex justify-between font-bold text-neutral-800 text-sm">
                            <span className="font-serif text-[#705c30]">{work.company} · <span className="font-sans font-bold text-xs text-neutral-700">{work.position}</span></span>
                            <span className="font-mono text-neutral-400 shrink-0 font-semibold text-xs">{work.startDate} - {work.endDate}</span>
                          </div>
                          <pre className="text-neutral-600 leading-relaxed font-sans whitespace-pre-wrap text-[11px]">
                            {work.content}
                          </pre>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {content.education.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold text-neutral-800 tracking-wide font-serif border-b border-neutral-200 pb-1 uppercase">
                      教育研究履历
                    </h3>
                    <div className="space-y-2 pl-1">
                      {content.education.map((edu) => (
                        <div key={edu.id} className="flex justify-between items-start text-[11px]">
                          <div>
                            <span className="font-bold text-neutral-800 text-sm font-serif">{edu.school}</span>
                            <span className="text-neutral-500 ml-2">| {edu.degree} · {edu.major}</span>
                          </div>
                          <span className="font-mono text-neutral-400 font-semibold text-xs text-right shrink-0">
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills section */}
                {content.skills.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[11px] font-bold text-[#705c30] tracking-wide font-serif border-b border-neutral-200 pb-1 uppercase">
                      技术栈及商业工具圈
                    </h3>
                    <p className="text-[11px] text-neutral-600 pl-1 leading-relaxed font-mono">
                      {content.skills.join('  •  ')}
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* Bottom standard A4 validation check */}
            <div className="mt-auto border-t border-dotted border-neutral-200 pt-3 text-[9px] text-neutral-400 font-mono text-center flex justify-between items-center no-print w-full">
              <span>Terra Resume Standard PDF Engine — A4 Type (210×297mm)</span>
              <span>1 / 1 页</span>
            </div>

          </div>

          </div>

        </div>

      </div>

    </div>
  );
}
