import { useState, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { serviceStaffQuestions, serverAssistantQuestions } from '@/data/fohTestData';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Database,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSeedQuestions() {
  usePageTitle("Seed Questions");
  const { user, isLeadAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [existingCount, setExistingCount] = useState<number | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isLeadAdmin)) {
      navigate('/admin');
    }
  }, [authLoading, user, isLeadAdmin, navigate]);

  // Check existing question count
  useEffect(() => {
    const checkExisting = async () => {
      const { count } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true });
      setExistingCount(count ?? 0);
    };
    checkExisting();
  }, [importResult]);

  const handleImport = async () => {
    if (!user) return;
    setIsImporting(true);
    setProgress(0);
    setImportResult(null);
    setShowConfirm(false);

    const allQuestions = [
      ...serviceStaffQuestions.map(q => ({ ...q, targetRoles: ['server', 'bartender'], testType: 'service_staff' as const })),
      ...serverAssistantQuestions.map(q => ({ ...q, targetRoles: ['server_assistant'], testType: 'server_assistant' as const })),
    ];

    // Fetch test configurations
    const { data: configs } = await supabase
      .from('test_configurations')
      .select('id, test_type');

    const configMap: Record<string, string> = {};
    configs?.forEach(c => { configMap[c.test_type] = c.id; });

    let success = 0;
    let errors = 0;
    const totalCount = allQuestions.length;

    for (let i = 0; i < totalCount; i++) {
      const q = allQuestions[i];

      // Insert question
      const { data: inserted, error } = await supabase
        .from('quiz_questions')
        .insert({
          question_text: q.question,
          correct_answer: q.correctAnswer,
          question_type: q.type,
          options: q.options ? q.options : null,
          correct_index: q.correctIndex ?? null,
          category: q.category,
          target_roles: q.targetRoles,
          is_active: true,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (error || !inserted) {
        errors++;
      } else {
        success++;
        // Create assignment
        const configId = configMap[q.testType];
        if (configId) {
          await supabase.from('test_question_assignments').insert({
            test_config_id: configId,
            question_id: inserted.id,
            sort_order: i,
            is_required: false,
          });
        }
      }

      setProgress(Math.round(((i + 1) / totalCount) * 100));
    }

    setImportResult({ success, errors });
    setIsImporting(false);
    toast({
      title: 'Import Complete',
      description: `${success} questions imported, ${errors} errors.`,
    });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 px-4 max-w-3xl">
          <p className="text-muted-foreground">Checking permissions…</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isLeadAdmin) return null;

  const hasExistingData = (existingCount ?? 0) > 0;

  return (
    <Layout>
      <div className="py-6 sm:py-8 px-4 max-w-3xl mx-auto w-full">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-copper" />
              </div>
              <div>
                <CardTitle className="text-xl">Import FoH Test Questions</CardTitle>
                <CardDescription>
                  Migrate hardcoded questions into the database
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Source stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-serif font-bold text-copper">{serviceStaffQuestions.length}</p>
                  <p className="text-sm text-muted-foreground">Server/Bartender</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/30">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-serif font-bold text-copper">{serverAssistantQuestions.length}</p>
                  <p className="text-sm text-muted-foreground">Server Assistant</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-sm text-muted-foreground">
              Total: <strong>{serviceStaffQuestions.length + serverAssistantQuestions.length}</strong> questions will be imported into the <code className="bg-muted px-1 rounded">quiz_questions</code> table with corresponding <code className="bg-muted px-1 rounded">test_question_assignments</code>.
            </div>

            {/* Existing data warning */}
            {existingCount !== null && hasExistingData && !showConfirm && !importResult && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Questions already imported
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    There are already <strong>{existingCount}</strong> questions in the database. Importing again will create duplicates.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="destructive" onClick={() => setShowConfirm(true)}>
                      Import Again
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/admin')}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            {isImporting && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing questions…
                  </span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}

            {/* Result */}
            {importResult && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">
                    Import Complete
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-1">
                    <Badge variant="secondary" className="mr-2">{importResult.success} imported</Badge>
                    {importResult.errors > 0 && (
                      <Badge variant="destructive">{importResult.errors} errors</Badge>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Import button */}
            {!isImporting && !importResult && (!hasExistingData || showConfirm) && (
              <Button
                size="lg"
                className="w-full bg-copper hover:bg-copper-light text-white"
                onClick={handleImport}
              >
                <Upload className="w-5 h-5 mr-2" />
                Import FoH Test Questions
              </Button>
            )}

            {importResult && (
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin">Return to Admin Center</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
