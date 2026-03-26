import { useState, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowRight,
  HelpCircle,
  Wine,
  Martini,
  AlertTriangle,
  UtensilsCrossed,
  ClipboardList,
  Clock,
  Target,
  Users,
  UserCheck,
  Pencil,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Study links for required tests
const STUDY_LINKS: Record<string, { label: string; path: string }> = {
  service_staff: { label: 'Review Menu', path: '/categories' },
  server_assistant: { label: 'Review Menu', path: '/categories' },
  wine_test: { label: 'Review Wines', path: '/wine-list' },
  wine: { label: 'Review Wines', path: '/wine-list' },
};

// Study links for practice cards
const PRACTICE_STUDY_LINKS: Record<string, string> = {
  '/wine-quiz': '/wine-list',
  '/food-quiz': '/categories',
  '/cocktail-flashcards': '/cocktails',
  '/spirits-quiz': '/spirits',
  '/allergy-quiz': '/allergy',
};

interface TestConfiguration {
  id: string;
  test_name: string;
  test_type: string;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number | null;
  is_active: boolean;
}

// Hardcoded fallback tests that always appear
const FALLBACK_TESTS: Array<{
  test_type: string;
  test_name: string;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number | null;
  icon: typeof ClipboardList;
  color: string;
  bgColor: string;
  description: string;
}> = [
  {
    test_type: 'service_staff',
    test_name: 'Server & Bartender Test',
    total_questions: 69,
    passing_score: 70,
    time_limit_minutes: null,
    icon: Users,
    color: 'text-copper',
    bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20',
    description: 'Complete service knowledge',
  },
  {
    test_type: 'server_assistant',
    test_name: 'Server Assistant Test',
    total_questions: 23,
    passing_score: 70,
    time_limit_minutes: null,
    icon: UserCheck,
    color: 'text-jade',
    bgColor: 'from-jade/10 via-jade/5 to-transparent border-jade/20',
    description: 'Essential service skills',
  },
];

// Map test_type to icon + color for DB tests
const TEST_TYPE_VISUALS: Record<string, { icon: typeof ClipboardList; color: string; bgColor: string }> = {
  service_staff: { icon: Users, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  server_assistant: { icon: UserCheck, color: 'text-jade', bgColor: 'from-jade/10 via-jade/5 to-transparent border-jade/20' },
  wine_test: { icon: Wine, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  wine: { icon: Wine, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  food_test: { icon: UtensilsCrossed, color: 'text-sage', bgColor: 'from-sage/10 via-sage/5 to-transparent border-sage/20' },
  food: { icon: UtensilsCrossed, color: 'text-sage', bgColor: 'from-sage/10 via-sage/5 to-transparent border-sage/20' },
  spirits_test: { icon: Martini, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  spirits: { icon: Martini, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  cocktails_test: { icon: Martini, color: 'text-copper', bgColor: 'from-gold/10 via-gold/5 to-transparent border-copper/20' },
  cocktails: { icon: Martini, color: 'text-copper', bgColor: 'from-gold/10 via-gold/5 to-transparent border-copper/20' },
  allergy_test: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'from-destructive/10 via-destructive/5 to-transparent border-destructive/20' },
  allergy: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'from-destructive/10 via-destructive/5 to-transparent border-destructive/20' },
};

const DEFAULT_VISUAL = { icon: ClipboardList, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' };

function getVisual(testType: string) {
  return TEST_TYPE_VISUALS[testType] ?? DEFAULT_VISUAL;
}

// Unified display type for rendering
interface DisplayTest {
  id: string | null;
  test_name: string;
  test_type: string;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number | null;
  is_active: boolean;
  icon: typeof ClipboardList;
  color: string;
  bgColor: string;
  isFromDb: boolean;
}

export default function QuizPage() {
  usePageTitle("Training Tests");
  const { hasPermission, isServerAssistant, isLeadAdmin, user } = useAuth();
  const { getStats, isLoading: progressLoading } = useStudyProgress();
  const progressStats = getStats();

  const [dbTests, setDbTests] = useState<TestConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMinTimeElapsed(true), 300); return () => clearTimeout(t); }, []);

  // Fetch last attempt for progress summary
  const [lastAttempt, setLastAttempt] = useState<{
    percentage: number; test_type: string; completed_at: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('foh_test_attempts')
      .select('percentage, test_type, completed_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setLastAttempt(data); });
  }, [user]);

  // Fetch per-test-type scores
  const [testScores, setTestScores] = useState<
    Record<string, { percentage: number; completed_at: string }>
  >({});

  useEffect(() => {
    if (!user) return;
    supabase
      .from('foh_test_attempts')
      .select('test_type, percentage, completed_at')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        const latest: Record<string, { percentage: number; completed_at: string }> = {};
        data.forEach(row => {
          if (!latest[row.test_type]) {
            latest[row.test_type] = {
              percentage: row.percentage ?? 0,
              completed_at: row.completed_at!,
            };
          }
        });
        setTestScores(latest);
      });
  }, [user]);

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('test_configurations')
          .select('*')
          .order('updated_at');

        if (!isLeadAdmin) {
          query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching test configurations:', error);
          setDbTests([]);
          return;
        }

        setDbTests((data as TestConfiguration[]) ?? []);
      } catch (err) {
        console.error('Unexpected error fetching test configurations:', err);
        setDbTests([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, [isLeadAdmin]);

  // Build merged display list
  const displayTests: DisplayTest[] = (() => {
    const dbMap = new Map(dbTests.map(t => [t.test_type, t]));
    const result: DisplayTest[] = [];

    for (const fb of FALLBACK_TESTS) {
      const dbMatch = dbMap.get(fb.test_type);
      if (dbMatch) {
        result.push({
          id: dbMatch.id,
          test_name: dbMatch.test_name || fb.test_name,
          test_type: fb.test_type,
          total_questions: dbMatch.total_questions ?? fb.total_questions,
          passing_score: dbMatch.passing_score ?? fb.passing_score,
          time_limit_minutes: dbMatch.time_limit_minutes ?? fb.time_limit_minutes,
          is_active: dbMatch.is_active,
          icon: fb.icon,
          color: fb.color,
          bgColor: fb.bgColor,
          isFromDb: true,
        });
        dbMap.delete(fb.test_type);
      } else {
        result.push({
          id: null,
          test_name: fb.test_name,
          test_type: fb.test_type,
          total_questions: fb.total_questions,
          passing_score: fb.passing_score,
          time_limit_minutes: fb.time_limit_minutes,
          is_active: true,
          icon: fb.icon,
          color: fb.color,
          bgColor: fb.bgColor,
          isFromDb: false,
        });
      }
    }

    for (const [, dbTest] of dbMap) {
      const visual = getVisual(dbTest.test_type);
      result.push({
        id: dbTest.id,
        test_name: dbTest.test_name,
        test_type: dbTest.test_type,
        total_questions: dbTest.total_questions,
        passing_score: dbTest.passing_score,
        time_limit_minutes: dbTest.time_limit_minutes,
        is_active: dbTest.is_active,
        icon: visual.icon,
        color: visual.color,
        bgColor: visual.bgColor,
        isFromDb: true,
      });
    }

    return result;
  })();

  const visibleTests = isServerAssistant
    ? displayTests.filter(t => t.test_type !== 'service_staff')
    : displayTests;

  return (
    <Layout>
      <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-copper/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-copper" />
          </div>
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Staff Testing Center</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Choose your test or practice quiz below
          </p>
        </div>

        {/* Progress Summary Strip */}
        {!isLoading && !progressLoading && (
          <div className="grid grid-cols-2 gap-3 mb-6 sm:mb-8">
            <div className="rounded-xl bg-muted/50 border border-border p-3 text-center">
              <p className="text-xl font-bold text-copper">
                {progressStats.known}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Items Studied
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 border border-border p-3 text-center">
              <p className={cn(
                "text-xl font-bold",
                lastAttempt
                  ? lastAttempt.percentage >= 70
                    ? 'text-sage'
                    : 'text-destructive'
                  : 'text-muted-foreground'
              )}>
                {lastAttempt ? `${Math.round(lastAttempt.percentage)}%` : '—'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Last Test Score
              </p>
            </div>
          </div>
        )}

        {/* SECTION 1: Required Tests */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Required Tests</h2>

          {(isLoading || !minTimeElapsed) ? (
            <LoadingSpinner message="Loading tests..." />
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {visibleTests.map((test) => {
                const Icon = test.icon;
                const isInactive = !test.is_active;

                return (
                  <div key={test.test_type} className="relative">
                    <Link to={`/foh-test?type=${test.test_type}`} className={cn("group block", isInactive && "pointer-events-none")}>
                      <div className={cn(
                        "relative overflow-hidden rounded-xl bg-gradient-to-br border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                        test.bgColor,
                        isInactive && "opacity-50 grayscale"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                            test.color.replace('text-', 'bg-') + '/10'
                          )}>
                            <Icon className={cn("w-5 h-5", test.color)} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-foreground transition-colors truncate">
                                {test.test_name}
                              </h3>
                              {isInactive && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-muted-foreground/30 text-muted-foreground">
                                  Inactive
                                </Badge>
                              )}
                              {testScores[test.test_type] && (
                                <Badge
                                  className={cn(
                                    "text-[10px] px-1.5 py-0 ml-1",
                                    testScores[test.test_type].percentage >= test.passing_score
                                      ? "bg-sage/20 text-sage border-sage/30"
                                      : "bg-destructive/20 text-destructive border-destructive/30"
                                  )}
                                  variant="outline"
                                >
                                  {Math.round(testScores[test.test_type].percentage)}%
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {test.total_questions} questions
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                Pass: {test.passing_score}%
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {test.time_limit_minutes ? `${test.time_limit_minutes} min` : 'No limit'}
                              </span>
                            </div>
                            {STUDY_LINKS[test.test_type] && (
                              <Link
                                to={STUDY_LINKS[test.test_type].path}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {STUDY_LINKS[test.test_type].label}
                                <ArrowRight className="w-2.5 h-2.5" />
                              </Link>
                            )}
                          </div>
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            {isLeadAdmin && test.isFromDb && test.id && (
                              <Link
                                to="/admin/quiz-builder"
                                className="p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                                title="Edit test"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Link>
                            )}
                            {!isInactive && (
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: Practice & Study Quizzes */}
        <div className="pt-6 border-t border-border">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Practice & Study</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Self-study quizzes from the menu — not graded, no time limit.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {hasPermission('quiz:wine') && (
              <Link to="/wine-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-copper/10 via-copper/5 to-transparent border border-copper/20 p-4 transition-all duration-300 hover:border-copper/40 hover:shadow-lg hover:shadow-copper/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors mx-auto mb-2">
                    <Wine className="w-5 h-5 text-copper" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-copper transition-colors">Wine</h3>
                  <Link
                    to={PRACTICE_STUDY_LINKS['/wine-quiz']}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block"
                  >
                    Study First →
                  </Link>
                </div>
              </Link>
            )}

            {hasPermission('quiz:food') && (
              <Link to="/food-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-sage/10 via-sage/5 to-transparent border border-sage/20 p-4 transition-all duration-300 hover:border-sage/40 hover:shadow-lg hover:shadow-sage/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-sage/10 flex items-center justify-center group-hover:bg-sage/20 transition-colors mx-auto mb-2">
                    <UtensilsCrossed className="w-5 h-5 text-sage" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-sage transition-colors">Food</h3>
                  <Link
                    to={PRACTICE_STUDY_LINKS['/food-quiz']}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block"
                  >
                    Study First →
                  </Link>
                </div>
              </Link>
            )}

            {hasPermission('page:cocktail-flashcards') && (
              <Link to="/cocktail-flashcards" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border border-copper/20 p-4 transition-all duration-300 hover:border-copper/40 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors mx-auto mb-2">
                    <Martini className="w-5 h-5 text-copper" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-copper transition-colors">Cocktails</h3>
                  <Link
                    to={PRACTICE_STUDY_LINKS['/cocktail-flashcards']}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block"
                  >
                    Study First →
                  </Link>
                </div>
              </Link>
            )}

            {hasPermission('quiz:spirits') && (
              <Link to="/spirits-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-copper/10 via-copper/5 to-transparent border border-copper/20 p-4 transition-all duration-300 hover:border-copper/40 hover:shadow-lg hover:shadow-copper/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center group-hover:bg-copper/20 transition-colors mx-auto mb-2">
                    <Martini className="w-5 h-5 text-copper" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-copper transition-colors">Spirits</h3>
                  <Link
                    to={PRACTICE_STUDY_LINKS['/spirits-quiz']}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block"
                  >
                    Study First →
                  </Link>
                </div>
              </Link>
            )}

            {hasPermission('quiz:allergy') && (
              <Link to="/allergy-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 p-4 transition-all duration-300 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors mx-auto mb-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-destructive transition-colors">Allergy</h3>
                  <Link
                    to={PRACTICE_STUDY_LINKS['/allergy-quiz']}
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity inline-block"
                  >
                    Study First →
                  </Link>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}