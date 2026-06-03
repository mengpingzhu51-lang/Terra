import { createSupabaseAdminClient } from "@/lib/supabase/server";
import {
  emptyAppState,
  evaluationToRow,
  jdToRow,
  recordToRow,
  resumeToRow,
  rowToEvaluation,
  rowToJd,
  rowToRecord,
  rowToResume,
  TABLES,
  type AppStatePayload,
} from "@/lib/supabase/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function replaceUserRows(table: string, userId: string, rows: any[]) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const deleteResult = await supabase.from(table).delete().eq("user_id", userId);
  if (deleteResult.error) throw deleteResult.error;

  if (rows.length > 0) {
    const insertResult = await supabase.from(table).insert(rows);
    if (insertResult.error) throw insertResult.error;
  }
}

export async function GET(req: Request) {
  const supabase = createSupabaseAdminClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }
  if (!supabase) {
    return Response.json({ configured: false, ...emptyAppState });
  }

  try {
    const [resumes, jds, evaluations, records] = await Promise.all([
      supabase.from(TABLES.resumes).select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
      supabase.from(TABLES.jobDescriptions).select("*").eq("user_id", userId).order("updated_at", { ascending: false }),
      supabase.from(TABLES.evaluations).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from(TABLES.generationRecords).select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const error = resumes.error || jds.error || evaluations.error || records.error;
    if (error) throw error;

    return Response.json({
      configured: true,
      resumes: (resumes.data ?? []).map(rowToResume),
      jds: (jds.data ?? []).map(rowToJd),
      evaluations: (evaluations.data ?? []).map(rowToEvaluation),
      records: (records.data ?? []).map(rowToRecord),
    });
  } catch (error: any) {
    console.error("Supabase state load error:", error);
    return Response.json({ error: error?.message || "读取 Supabase 状态失败" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const supabase = createSupabaseAdminClient();
  const body = await req.json();
  const userId = body.userId;

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }
  if (!supabase) {
    return Response.json({ configured: false, skipped: true });
  }

  const state: AppStatePayload = {
    resumes: body.resumes ?? [],
    jds: body.jds ?? [],
    evaluations: body.evaluations ?? [],
    records: body.records ?? [],
  };

  try {
    await replaceUserRows(TABLES.generationRecords, userId, state.records.map((record) => recordToRow(record, userId)));
    await replaceUserRows(TABLES.evaluations, userId, state.evaluations.map((evaluation) => evaluationToRow(evaluation, userId)));
    await replaceUserRows(TABLES.jobDescriptions, userId, state.jds.map((jd) => jdToRow(jd, userId)));
    await replaceUserRows(TABLES.resumes, userId, state.resumes.map((resume) => resumeToRow(resume, userId)));

    return Response.json({ configured: true, ok: true });
  } catch (error: any) {
    console.error("Supabase state sync error:", error);
    return Response.json({ error: error?.message || "同步 Supabase 状态失败" }, { status: 500 });
  }
}
