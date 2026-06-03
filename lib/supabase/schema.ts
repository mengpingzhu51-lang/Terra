import type { Evaluation, GenerationRecord, JobDescription, Resume } from "@/src/types";

export const TABLES = {
  resumes: "resumes",
  jobDescriptions: "job_descriptions",
  evaluations: "evaluations",
  generationRecords: "generation_records",
} as const;

export interface AppStatePayload {
  resumes: Resume[];
  jds: JobDescription[];
  evaluations: Evaluation[];
  records: GenerationRecord[];
}

export const emptyAppState: AppStatePayload = {
  resumes: [],
  jds: [],
  evaluations: [],
  records: [],
};

export function resumeToRow(resume: Resume, userId: string) {
  return {
    id: resume.id,
    user_id: resume.userId || userId,
    title: resume.title,
    source_resume_id: resume.sourceResumeId ?? null,
    related_jd_id: resume.relatedJdId ?? null,
    related_evaluation_id: resume.relatedEvaluationId ?? null,
    template_id: resume.templateId,
    content: resume.content,
    version_type: resume.versionType,
    created_at: resume.createdAt,
    updated_at: resume.updatedAt,
  };
}

export function rowToResume(row: any): Resume {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    sourceResumeId: row.source_resume_id ?? undefined,
    relatedJdId: row.related_jd_id ?? undefined,
    relatedEvaluationId: row.related_evaluation_id ?? undefined,
    templateId: row.template_id,
    content: row.content,
    versionType: row.version_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function jdToRow(jd: JobDescription, userId: string) {
  return {
    id: jd.id,
    user_id: jd.userId || userId,
    title: jd.title,
    company: jd.company ?? null,
    raw_content: jd.rawContent,
    responsibilities: jd.responsibilities ?? [],
    requirements: jd.requirements ?? [],
    keywords: jd.keywords ?? [],
    experience_requirement: jd.experienceRequirement ?? null,
    education_requirement: jd.educationRequirement ?? null,
    created_at: jd.createdAt,
    updated_at: jd.updatedAt,
  };
}

export function rowToJd(row: any): JobDescription {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    company: row.company ?? undefined,
    rawContent: row.raw_content,
    responsibilities: row.responsibilities ?? undefined,
    requirements: row.requirements ?? undefined,
    keywords: row.keywords ?? undefined,
    experienceRequirement: row.experience_requirement ?? undefined,
    educationRequirement: row.education_requirement ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function evaluationToRow(evaluation: Evaluation, userId: string) {
  return {
    id: evaluation.id,
    user_id: evaluation.userId || userId,
    resume_id: evaluation.resumeId,
    jd_id: evaluation.jdId,
    total_score: evaluation.totalScore,
    dimension_scores: evaluation.dimensionScores,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    risks: evaluation.risks,
    keyword_matches: evaluation.keywordMatches,
    missing_keywords: evaluation.missingKeywords,
    suggestions: evaluation.suggestions,
    created_at: evaluation.createdAt,
  };
}

export function rowToEvaluation(row: any): Evaluation {
  return {
    id: row.id,
    userId: row.user_id,
    resumeId: row.resume_id,
    jdId: row.jd_id,
    totalScore: row.total_score,
    dimensionScores: row.dimension_scores,
    strengths: row.strengths ?? [],
    weaknesses: row.weaknesses ?? [],
    risks: row.risks ?? [],
    keywordMatches: row.keyword_matches ?? [],
    missingKeywords: row.missing_keywords ?? [],
    suggestions: row.suggestions ?? [],
    createdAt: row.created_at,
  };
}

export function recordToRow(record: GenerationRecord, userId: string) {
  return {
    id: record.id,
    user_id: record.userId || userId,
    type: record.type,
    input_summary: record.inputSummary ?? null,
    output_content: record.outputContent ?? null,
    resume_id: record.resumeId ?? null,
    jd_id: record.jdId ?? null,
    evaluation_id: record.evaluationId ?? null,
    status: record.status,
    error_message: record.errorMessage ?? null,
    created_at: record.createdAt,
  };
}

export function rowToRecord(row: any): GenerationRecord {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    inputSummary: row.input_summary ?? undefined,
    outputContent: row.output_content ?? undefined,
    resumeId: row.resume_id ?? undefined,
    jdId: row.jd_id ?? undefined,
    evaluationId: row.evaluation_id ?? undefined,
    status: row.status,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
  };
}
