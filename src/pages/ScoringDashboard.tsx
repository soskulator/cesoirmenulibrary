import { useEffect, useState } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Trophy, ArrowLeft, ArrowUpDown, TrendingUp, Users, AlertTriangle,
  BarChart3, Download, ChevronDown, ChevronRight, Loader2, Bell,
  Target, Calendar, XCircle, Trash2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useScoringData, type StaffScore, type StaffDetail } from '@/hooks/useScoringData';
import { StaffActivityLog } from '@/components/admin/StaffActivityLog';
import { QuizPerformanceDashboard } from '@/components/admin/QuizPerformanceDashboard';
import { FohTestQuestionManager } from '@/components/admin/FohTestQuestionManager';
import { FohTestReviewManager } from '@/components/admin/FohTestReviewManager';
import { TeamStudyProgressChart } from '@/components/admin/TeamStudyProgressChart';
import { Separator } from '@/components/ui/separator';

const ROLE_LABELS: Record<string, string> = {
  lead_admin: 'Lead Admin',
  admin: 'Admin',
  server: 'Server',
  bartender: 'Bartender',
  server_assistant: 'Server Assistant',
  employee: 'Staff',
};

type SortKey = 'rank' | 'name' | 'role' | 'avg' | 'best' | 'tests' | 'date';

function getScoreTier(score: number): string {
  if (score >= 80) return 'high';
  if (score >= 60) return 'mid';
  return 'low';
}

export default function ScoringDashboard() {
  usePageTitle("Staff Scoring");
  const { isAdmin, isLeadAdmin } = useAuth();
  const {
    leaderboard, overview, incompleteStaff, isLoading,
    fetchAll, fetchStaffDetail, exportCSV, sendReminder, deleteUserScores,
  } = useScoringData();

  const [sortBy, setSortBy] = useState<SortKey>('avg');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [staffDetails, setStaffDetails] = useState<Record<string, StaffDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffScore | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin, fetchAll]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(key === 'name'); }
  };

  const sorted = [...leaderboard].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'name': cmp = (a.fullName).localeCompare(b.fullName); break;
      case 'role': cmp = (a.role || '').localeCompare(b.role || ''); break;
      case 'avg': cmp = a.avgScore - b.avgScore; break;
      case 'best': cmp = a.bestScore - b.bestScore; break;
      case 'tests': cmp = a.testsTaken - b.testsTaken; break;
      case 'date':
        cmp = (a.lastTestDate || '').localeCompare(b.lastTestDate || '');
        break;
      default: cmp = a.avgScore - b.avgScore;
    }
    return sortAsc ? cmp : -cmp;
  });

  const handleExpand = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (!staffDetails[userId]) {
      setDetailLoading(userId);
      const detail = await fetchStaffDetail(userId);
      setStaffDetails(prev => ({ ...prev, [userId]: detail }));
      setDetailLoading(null);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-copper" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 sm:py-8 px-4 max-w-6xl mx-auto w-full overflow-x-hidden">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-copper to-copper-light flex items-center justify-center shadow-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Staff Scoring</h1>
            <p className="text-sm text-muted-foreground">Performance tracking & leaderboard</p>
          </div>
        </div>

        {/* SECTION 1: Team Overview */}
        {overview && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
            <OverviewCard
              icon={<TrendingUp className="w-5 h-5 text-copper" />}
              label="Avg Team Score"
              value={`${overview.avgTeamScore}%`}
              delay={0}
            />
            <OverviewCard
              icon={<Calendar className="w-5 h-5 text-copper" />}
              label="Tests This Week"
              value={overview.testsThisWeek.toString()}
              delay={0.1}
            />
            <OverviewCard
              icon={<Users className="w-5 h-5 text-copper" />}
              label="Staff Not Tested"
              value={overview.staffNotTested.toString()}
              delay={0.2}
            />
          </div>
        )}

        {/* SECTION 2: Leaderboard */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-copper" />
              Staff Leaderboard
            </CardTitle>
            <CardDescription>Click a name to view detailed breakdown</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {sorted.map((s, i) => {
                const tier = getScoreTier(s.avgScore);
                const isExpanded = expandedUser === s.userId;
                return (
                  <div key={s.userId}>
                    <div
                      className={`rounded-lg p-3 cursor-pointer transition-colors ${
                        tier === 'high' ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30'
                        : tier === 'mid' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30'
                        : 'bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-800/30'
                      }`}
                      onClick={() => handleExpand(s.userId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{s.fullName}</p>
                            <Badge variant="outline" className="text-[10px] mt-0.5">{ROLE_LABELS[s.role || ''] || 'No Role'}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-lg">{s.avgScore}%</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                    {isExpanded && <StaffDetailPanel userId={s.userId} detail={staffDetails[s.userId]} loading={detailLoading === s.userId} isLeadAdmin={isLeadAdmin} onDelete={() => setDeleteTarget(s)} />}
                  </div>
                );
              })}
              {sorted.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No test data yet.</p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Rank</TableHead>
                    <SortableHead label="Name" sortKey="name" current={sortBy} asc={sortAsc} onSort={toggleSort} />
                    <SortableHead label="Role" sortKey="role" current={sortBy} asc={sortAsc} onSort={toggleSort} />
                    <SortableHead label="Avg Score" sortKey="avg" current={sortBy} asc={sortAsc} onSort={toggleSort} className="text-right" />
                    <SortableHead label="Best" sortKey="best" current={sortBy} asc={sortAsc} onSort={toggleSort} className="text-right" />
                    <SortableHead label="Tests" sortKey="tests" current={sortBy} asc={sortAsc} onSort={toggleSort} className="text-right" />
                    <SortableHead label="Last Test" sortKey="date" current={sortBy} asc={sortAsc} onSort={toggleSort} />
                    <TableHead className="w-[30px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((s, i) => {
                    const tier = getScoreTier(s.avgScore);
                    const isExpanded = expandedUser === s.userId;
                    return (
                      <>
                        <TableRow
                          key={s.userId}
                          className={`cursor-pointer transition-colors ${
                            tier === 'high' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
                            : tier === 'mid' ? 'bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                            : 'bg-red-50/50 dark:bg-red-950/10 hover:bg-red-50 dark:hover:bg-red-950/20'
                          }`}
                          onClick={() => handleExpand(s.userId)}
                        >
                          <TableCell className="font-bold text-muted-foreground">#{i + 1}</TableCell>
                          <TableCell className="font-medium">{s.fullName}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{ROLE_LABELS[s.role || ''] || 'No Role'}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-serif font-bold">{s.avgScore}%</TableCell>
                          <TableCell className="text-right">{s.bestScore}%</TableCell>
                          <TableCell className="text-right">{s.testsTaken}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.lastTestDate ? new Date(s.lastTestDate).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${s.userId}-detail`}>
                            <TableCell colSpan={8} className="p-0">
                              <StaffDetailPanel userId={s.userId} detail={staffDetails[s.userId]} loading={detailLoading === s.userId} isLeadAdmin={isLeadAdmin} onDelete={() => setDeleteTarget(s)} />
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                  {sorted.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No test data yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 3: Completion Tracker (Collapsible) */}
        <Collapsible className="mb-8">
          <Card>
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-copper" />
                    Completion Tracker
                    {incompleteStaff.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{incompleteStaff.length}</Badge>
                    )}
                  </CardTitle>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                </div>
                <CardDescription className="text-left">Staff who haven't completed required tests</CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                {incompleteStaff.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">All staff have completed required tests! 🎉</p>
                ) : (
                  <div className="space-y-3">
                    {incompleteStaff.map(s => (
                      <div key={s.userId} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{s.fullName}</p>
                            <Badge variant="outline" className="text-[10px]">{ROLE_LABELS[s.role || ''] || 'No Role'}</Badge>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <XCircle className="w-3 h-3 text-destructive flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">Missing:</span>
                            {s.missingTests.map(t => (
                              <Badge key={t} variant="destructive" className="text-[10px]">{t}</Badge>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => sendReminder(s)}>
                          <Bell className="w-3.5 h-3.5 mr-1" />
                          Send Reminder
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* SECTION 4: Test Management */}
        {isAdmin && (
          <>
            <Separator className="my-6" />
            <h2 className="font-serif text-lg font-semibold mb-3">Test Management</h2>
            <div className="grid lg:grid-cols-2 gap-4 mb-8">
              <FohTestQuestionManager />
              <FohTestReviewManager />
            </div>
          </>
        )}

        {/* SECTION 5: Analytics */}
        {isAdmin && (
          <>
            <Separator className="my-6" />
            <h2 className="font-serif text-lg font-semibold mb-3">Analytics: Team Study Progress</h2>
            <div className="mb-8">
              <TeamStudyProgressChart />
            </div>
          </>
        )}

        {/* SECTION 6: Staff Insights */}
        {isAdmin && (
          <>
            <Separator className="my-6" />
            <h2 className="font-serif text-lg font-semibold mb-3">Staff Insights</h2>
            <div className="grid lg:grid-cols-2 gap-4 mb-8">
              <StaffActivityLog />
              <QuizPerformanceDashboard />
            </div>
          </>
        )}

        {/* SECTION 5: Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="w-5 h-5 text-copper" />
              Export Data
            </CardTitle>
            <CardDescription>Download staff performance data</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={exportCSV}
              disabled={leaderboard.length === 0}
              className="bg-copper hover:bg-copper-light text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export to CSV
            </Button>
          </CardContent>
        </Card>

        {/* Delete Scores Confirmation Dialog */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove All Test Scores?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all completed test attempts, answers, and quiz scores for{' '}
                <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.email}).
                <br /><br />
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (!deleteTarget) return;
                  setIsDeleting(true);
                  await deleteUserScores(deleteTarget.userId, deleteTarget.fullName);
                  setIsDeleting(false);
                  setDeleteTarget(null);
                  setExpandedUser(null);
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove All Scores'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}

// ── Sub-components ──

function OverviewCard({ icon, label, value, sub, delay }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delay: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            {icon}
          </div>
          <p className="text-2xl sm:text-3xl font-serif font-bold text-foreground">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SortableHead({ label, sortKey, current, asc, onSort, className }: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <TableHead className={`cursor-pointer select-none ${className || ''}`} onClick={() => onSort(sortKey)}>
      {label}
      <ArrowUpDown className={`inline w-3 h-3 ml-1 ${current === sortKey ? 'text-copper' : 'text-muted-foreground'}`} />
    </TableHead>
  );
}

function StaffDetailPanel({ userId, detail, loading, isLeadAdmin, onDelete }: { userId: string; detail?: StaffDetail; loading: boolean; isLeadAdmin: boolean; onDelete: () => void }) {
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) return null;

  return (
    <div className="p-4 bg-muted/50 border-t space-y-4">
      {/* Score History */}
      <div>
        <h4 className="text-sm font-semibold mb-2">Score History</h4>
        {detail.attempts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No completed tests.</p>
        ) : (
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {detail.attempts.slice(0, 10).map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs bg-background rounded px-3 py-1.5">
                <span className="text-muted-foreground">{new Date(a.completedAt).toLocaleDateString()}</span>
                <Badge variant="outline" className="text-[10px]">{a.testType}</Badge>
                <span className="font-medium">{a.score}/{a.totalQuestions} ({a.percentage}%)</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {detail.categoryBreakdown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Category Breakdown</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {detail.categoryBreakdown.map(c => (
              <div key={c.category} className="bg-background rounded p-2 text-center">
                <p className="text-xs text-muted-foreground capitalize">{c.category.replace(/_/g, ' ')}</p>
                <p className={`text-sm font-bold ${
                  c.percentage >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                  : c.percentage >= 60 ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
                }`}>
                  {c.percentage}%
                </p>
                <p className="text-[10px] text-muted-foreground">{c.correct}/{c.total}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Missed Questions */}
      {detail.missedQuestions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Most Missed Questions</h4>
          <div className="space-y-1.5">
            {detail.missedQuestions.map((q, i) => (
              <div key={i} className="bg-background rounded px-3 py-2 text-xs">
                <p className="font-medium">{q.questionText}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">Answer: {q.correctAnswer}</span>
                  <Badge variant="destructive" className="text-[10px]">Missed {q.timesWrong}x</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lead Admin: Remove Scores */}
      {isLeadAdmin && (
        <div className="border-t pt-3 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Remove All Test Scores
          </Button>
        </div>
      )}
    </div>
  );
}
