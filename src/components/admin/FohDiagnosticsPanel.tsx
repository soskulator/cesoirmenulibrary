import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, CheckCircle2, AlertTriangle, Stethoscope } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  serviceStaffQuestions,
  serverAssistantQuestions,
  type FohTestQuestion,
  type TestType,
} from '@/data/fohTestData';
import {
  EXPECTED_COUNTS,
  validateAllFohQuestionBanks,
} from '@/data/fohTestDataValidation';

interface DbRow {
  id: string;
  question: string;
  correct_answer: string;
  test_type: string;
  is_active: boolean;
}

interface BankReport {
  label: string;
  testType: TestType;
  staticCount: number;
  expectedStaticCount: number;
  dbCount: number;
  dbActiveCount: number;
  staticDuplicateIds: number[];
  staticMissingIds: number[];
  dbDuplicateQuestions: { question: string; ids: string[] }[];
  missingInDb: { id: number; question: string }[];
  extraInDb: { id: string; question: string }[];
  countsMatch: boolean;
  ok: boolean;
}

const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function buildReport(
  label: string,
  testType: TestType,
  staticQuestions: FohTestQuestion[],
  expectedStaticCount: number,
  dbRows: DbRow[],
  staticDuplicateIds: number[],
  staticMissingIds: number[],
): BankReport {
  const dbForType = dbRows.filter(r => r.test_type === testType);
  const dbActive = dbForType.filter(r => r.is_active);

  // Duplicate question text in DB
  const byText = new Map<string, string[]>();
  for (const r of dbForType) {
    const key = normalize(r.question);
    if (!byText.has(key)) byText.set(key, []);
    byText.get(key)!.push(r.id);
  }
  const dbDuplicateQuestions = [...byText.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([key, ids]) => ({
      question: dbForType.find(r => normalize(r.question) === key)?.question ?? key,
      ids,
    }));

  const dbTextSet = new Set(dbForType.map(r => normalize(r.question)));
  const staticTextSet = new Set(staticQuestions.map(q => normalize(q.question)));

  const missingInDb = staticQuestions
    .filter(q => !dbTextSet.has(normalize(q.question)))
    .map(q => ({ id: q.id, question: q.question }));

  const extraInDb = dbForType
    .filter(r => !staticTextSet.has(normalize(r.question)))
    .map(r => ({ id: r.id, question: r.question }));

  const countsMatch =
    dbActive.length === staticQuestions.length &&
    staticQuestions.length === expectedStaticCount;

  const ok =
    countsMatch &&
    staticDuplicateIds.length === 0 &&
    staticMissingIds.length === 0 &&
    dbDuplicateQuestions.length === 0 &&
    missingInDb.length === 0 &&
    extraInDb.length === 0;

  return {
    label,
    testType,
    staticCount: staticQuestions.length,
    expectedStaticCount,
    dbCount: dbForType.length,
    dbActiveCount: dbActive.length,
    staticDuplicateIds,
    staticMissingIds,
    dbDuplicateQuestions,
    missingInDb,
    extraInDb,
    countsMatch,
    ok,
  };
}

export function FohDiagnosticsPanel() {
  const [rows, setRows] = useState<DbRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const staticValidation = useMemo(() => validateAllFohQuestionBanks(), []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('foh_test_questions')
        .select('id, question, correct_answer, test_type, is_active');
      if (error) throw error;
      setRows((data ?? []) as DbRow[]);
    } catch (e) {
      console.error('[FohDiagnostics] load error', e);
      setError(e instanceof Error ? e.message : 'Failed to load diagnostics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const reports: BankReport[] = useMemo(() => {
    const ssStatic = staticValidation.find(r => r.count === serviceStaffQuestions.length);
    const saStatic = staticValidation.find(r => r.count === serverAssistantQuestions.length);
    return [
      buildReport(
        'Server & Bartender',
        'service_staff',
        serviceStaffQuestions,
        EXPECTED_COUNTS.serviceStaffQuestions,
        rows,
        ssStatic?.duplicateIds ?? [],
        ssStatic?.missingIds ?? [],
      ),
      buildReport(
        'Server Assistant',
        'server_assistant',
        serverAssistantQuestions,
        EXPECTED_COUNTS.serverAssistantQuestions,
        rows,
        saStatic?.duplicateIds ?? [],
        saStatic?.missingIds ?? [],
      ),
    ];
  }, [rows, staticValidation]);

  return (
    <Card className="bg-card shadow-card">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-5 h-5 text-copper" />
            </div>
            <div>
              <CardTitle className="font-serif text-xl">FoH Question Diagnostics</CardTitle>
              <CardDescription className="text-sm">
                Compares <code>fohTestData.ts</code> to <code>foh_test_questions</code> in the database.
              </CardDescription>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={load} disabled={isLoading} className="h-8">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && rows.length === 0 ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          reports.map(r => <ReportCard key={r.testType} report={r} />)
        )}
      </CardContent>
    </Card>
  );
}

function ReportCard({ report: r }: { report: BankReport }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {r.ok ? (
            <CheckCircle2 className="w-4 h-4 text-jade" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
          <h3 className="font-serif text-base font-semibold">{r.label}</h3>
          <Badge variant="outline" className="text-[10px]">{r.testType}</Badge>
        </div>
        <Badge
          className={r.ok ? 'bg-jade text-white' : 'bg-amber-500 text-white'}
        >
          {r.ok ? 'Healthy' : 'Needs attention'}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
        <Metric label="Expected (static)" value={r.expectedStaticCount} />
        <Metric
          label="Static actual"
          value={r.staticCount}
          warn={r.staticCount !== r.expectedStaticCount}
        />
        <Metric
          label="DB active / total"
          value={`${r.dbActiveCount} / ${r.dbCount}`}
          warn={r.dbActiveCount !== r.staticCount}
        />
      </div>

      <div className="space-y-2">
        <IssueRow
          label="Duplicate static IDs"
          items={r.staticDuplicateIds.map(String)}
        />
        <IssueRow
          label="Missing static IDs (gaps in expected sequence)"
          items={r.staticMissingIds.map(String)}
        />
        <IssueRow
          label="Duplicate questions in DB"
          items={r.dbDuplicateQuestions.map(d => `"${truncate(d.question)}" (${d.ids.length}×)`)}
        />
        <IssueRow
          label={`In source but missing from DB (${r.missingInDb.length})`}
          items={r.missingInDb.map(m => `#${m.id} — ${truncate(m.question)}`)}
          hint="Run Sync Now on this test to insert the missing entries."
        />
        <IssueRow
          label={`In DB but not in source (${r.extraInDb.length})`}
          items={r.extraInDb.map(m => truncate(m.question))}
          hint="Manual additions or stale rows. Sync Now will remove them."
        />
      </div>
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="rounded-md bg-background border border-border px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`text-lg font-serif ${warn ? 'text-amber-600' : ''}`}>{value}</div>
    </div>
  );
}

function IssueRow({ label, items, hint }: { label: string; items: string[]; hint?: string }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-jade">None</span>
      </div>
    );
  }
  return (
    <details className="text-xs">
      <summary className="cursor-pointer flex items-center justify-between py-1">
        <span className="font-medium">{label}</span>
        <Badge variant="outline" className="text-[10px] text-amber-700 border-amber-600/40">
          {items.length}
        </Badge>
      </summary>
      <ScrollArea className="max-h-40 mt-1">
        <ul className="pl-4 list-disc space-y-0.5 text-muted-foreground">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </ScrollArea>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground italic">{hint}</p>}
    </details>
  );
}

function truncate(s: string, n = 90) {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
