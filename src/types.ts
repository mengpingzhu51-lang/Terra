/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BasicInfo {
  name: string;
  phone: string;
  email: string;
  city: string;
  intention: string;
  links?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  major: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  content: string;
}

export interface ProjectExperience {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  background?: string;
  responsibilities?: string;
  results?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeContent {
  basicInfo: BasicInfo;
  education: Education[];
  workExperience: WorkExperience[];
  projects: ProjectExperience[];
  skills: string[];
  summary?: string;
  customSections?: CustomSection[];
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  sourceResumeId?: string;
  relatedJdId?: string;
  relatedEvaluationId?: string;
  templateId: string; // 'simple' | 'technical' | 'highlight'
  content: ResumeContent;
  versionType: 'original' | 'manual_copy' | 'jd_optimized';
  createdAt: string;
  updatedAt: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  company?: string;
  rawContent: string;
  responsibilities?: string[];
  requirements?: string[];
  keywords?: string[];
  experienceRequirement?: string;
  educationRequirement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DimensionScores {
  skills: number;
  experience: number;
  responsibility: number;
  industry: number;
  achievement: number;
}

export interface KeywordMatch {
  keyword: string;
  required: boolean;
  match: boolean;
  suggestion: string;
}

export interface OptimizationSuggestion {
  section: string;
  issue: string;
  suggestion: string;
  exampleRewrite?: string;
}

export interface Evaluation {
  id: string;
  userId: string;
  resumeId: string;
  jdId: string;
  totalScore: number;
  dimensionScores: DimensionScores;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  keywordMatches: KeywordMatch[];
  missingKeywords: string[];
  suggestions: OptimizationSuggestion[];
  createdAt: string;
}

export interface GenerationRecord {
  id: string;
  userId: string;
  type:
    | 'resume_parse'
    | 'resume_generate'
    | 'jd_parse'
    | 'evaluation'
    | 'optimization_suggestion'
    | 'jd_resume_optimize';
  inputSummary?: string;
  outputContent?: any;
  resumeId?: string;
  jdId?: string;
  evaluationId?: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}
