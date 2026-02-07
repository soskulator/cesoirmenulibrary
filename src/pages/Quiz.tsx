import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
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
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface TestConfiguration {
  id: string;
  test_name: string;
  test_type: string;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number | null;
  is_active: boolean;
}

// Map test_type to icon + color
const TEST_TYPE_VISUALS: Record<string, { icon: typeof ClipboardList; color: string; bgColor: string }> = {
  service_staff: { icon: Users, color: 'text-burgundy', bgColor: 'from-burgundy/10 via-burgundy/5 to-transparent border-burgundy/20' },
  server_assistant: { icon: UserCheck, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  wine_test: { icon: Wine, color: 'text-burgundy', bgColor: 'from-burgundy/10 via-burgundy/5 to-transparent border-burgundy/20' },
  wine: { icon: Wine, color: 'text-burgundy', bgColor: 'from-burgundy/10 via-burgundy/5 to-transparent border-burgundy/20' },
  food_test: { icon: UtensilsCrossed, color: 'text-sage', bgColor: 'from-sage/10 via-sage/5 to-transparent border-sage/20' },
  food: { icon: UtensilsCrossed, color: 'text-sage', bgColor: 'from-sage/10 via-sage/5 to-transparent border-sage/20' },
  spirits_test: { icon: Martini, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  spirits: { icon: Martini, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' },
  cocktails_test: { icon: Martini, color: 'text-gold', bgColor: 'from-gold/10 via-gold/5 to-transparent border-gold/20' },
  cocktails: { icon: Martini, color: 'text-gold', bgColor: 'from-gold/10 via-gold/5 to-transparent border-gold/20' },
  allergy_test: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'from-destructive/10 via-destructive/5 to-transparent border-destructive/20' },
  allergy: { icon: AlertTriangle, color: 'text-destructive', bgColor: 'from-destructive/10 via-destructive/5 to-transparent border-destructive/20' },
};

const DEFAULT_VISUAL = { icon: ClipboardList, color: 'text-copper', bgColor: 'from-copper/10 via-copper/5 to-transparent border-copper/20' };

function getVisual(testType: string) {
  return TEST_TYPE_VISUALS[testType] ?? DEFAULT_VISUAL;
}

export default function QuizPage() {
  const { hasPermission, isServerAssistant } = useAuth();
  const [tests, setTests] = useState<TestConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('test_configurations')
          .select('*')
          .eq('is_active', true)
          .order('created_at');
        if (error) throw error;
        setTests((data as TestConfiguration[]) ?? []);
      } catch (err) {
        console.error('Error fetching test configurations:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Filter tests for server assistants — only show tests whose type contains 'server_assistant' or generic ones
  const visibleTests = isServerAssistant
    ? tests.filter(t => t.test_type === 'server_assistant' || !['service_staff'].includes(t.test_type))
    : tests;

  return (
    <Layout>
      <div className="container py-6 sm:py-8 md:py-12 max-w-2xl px-3 sm:px-4">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-burgundy/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 text-burgundy" />
          </div>
          <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold mb-2">Staff Testing Center</h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Choose your test or practice quiz below
          </p>
        </div>

        {/* SECTION 1: Required Tests from DB */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Required Tests</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
              ))}
            </div>
          ) : visibleTests.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground border border-dashed rounded-xl">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active tests configured yet.</p>
              <p className="text-xs mt-1">An admin can create tests in the Quiz Builder.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {visibleTests.map((test) => {
                const visual = getVisual(test.test_type);
                const Icon = visual.icon;

                return (
                  <Link key={test.id} to={`/foh-test?type=${test.test_type}`} className="group">
                    <div className={cn(
                      "relative overflow-hidden rounded-xl bg-gradient-to-br border p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
                      visual.bgColor
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                          visual.color.replace('text-', 'bg-') + '/10',
                          `group-hover:${visual.color.replace('text-', 'bg-')}/20`
                        )}>
                          <Icon className={cn("w-5 h-5", visual.color)} />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <h3 className={cn("font-semibold text-foreground transition-colors truncate", `group-hover:${visual.color}`)}>
                            {test.test_name}
                          </h3>
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
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {hasPermission('quiz:wine') && (
              <Link to="/wine-quiz" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-burgundy/10 via-burgundy/5 to-transparent border border-burgundy/20 p-4 transition-all duration-300 hover:border-burgundy/40 hover:shadow-lg hover:shadow-burgundy/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-burgundy/10 flex items-center justify-center group-hover:bg-burgundy/20 transition-colors mx-auto mb-2">
                    <Wine className="w-5 h-5 text-burgundy" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-burgundy transition-colors">Wine</h3>
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
                </div>
              </Link>
            )}

            {hasPermission('page:cocktail-flashcards') && (
              <Link to="/cocktail-flashcards" className="group">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gold/10 via-gold/5 to-transparent border border-gold/20 p-4 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-0.5 text-center">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors mx-auto mb-2">
                    <Martini className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground group-hover:text-gold transition-colors">Cocktails</h3>
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
                </div>
              </Link>
            )}
          </div>

          {/* Allergy Test */}
          {hasPermission('quiz:allergy') && (
            <Link to="/allergy-quiz" className="group block">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20 p-4 transition-all duration-300 hover:border-destructive/40 hover:shadow-lg hover:shadow-destructive/10 hover:-translate-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-destructive transition-colors">Allergy Quiz</h3>
                    <p className="text-xs text-muted-foreground">Ingredient removal training</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-destructive group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
