import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StaffScore {
  userId: string;
  fullName: string;
  email: string;
  role: string | null;
  avgScore: number;
  bestScore: number;
  testsTaken: number;
  lastTestDate: string | null;
  attempts: TestAttempt[];
}

export interface TestAttempt {
  id: string;
  testType: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface CategoryBreakdown {
  category: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface MissedQuestion {
  questionText: string;
  correctAnswer: string;
  timesWrong: number;
}

export interface StaffDetail {
  attempts: TestAttempt[];
  categoryBreakdown: CategoryBreakdown[];
  missedQuestions: MissedQuestion[];
}

export interface OverviewStats {
  avgTeamScore: number;
  testsThisWeek: number;
  staffNotTested: number;
  lowestCategory: string;
  lowestCategoryScore: number;
}

export interface IncompleteStaff {
  userId: string;
  fullName: string;
  email: string;
  role: string | null;
  missingTests: string[];
}

export interface InactiveStaff {
  userId: string;
  fullName: string;
  email: string;
  role: string | null;
  lastSeen: string | null;
  daysSinceActive: number;
}

const ROLE_LABELS: Record<string, string> = {
  lead_admin: 'Lead Admin',
  admin: 'Admin',
  server: 'Server',
  bartender: 'Bartender',
  server_assistant: 'Server Assistant',
  employee: 'Staff',
};

export function useScoringData() {
  const [leaderboard, setLeaderboard] = useState<StaffScore[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [incompleteStaff, setIncompleteStaff] = useState<IncompleteStaff[]>([]);
  const [inactiveStaff, setInactiveStaff] = useState<InactiveStaff[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        { data: profiles },
        { data: roles },
        { data: attempts },
        { data: testConfigs },
        { data: sessions },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email'),
        supabase.from('user_roles').select('user_id, role'),
        supabase.from('foh_test_attempts').select('*').not('completed_at', 'is', null).order('completed_at', { ascending: false }),
        supabase.from('test_configurations').select('test_type, test_name').eq('is_active', true),
        supabase.from('user_sessions').select('user_id, session_end, last_heartbeat').order('session_end', { ascending: false }),
      ]);

      const roleMap: Record<string, string> = {};
      (roles || []).forEach(r => { roleMap[r.user_id] = r.role; });

      const profileMap: Record<string, { fullName: string; email: string }> = {};
      (profiles || []).forEach(p => {
        profileMap[p.id] = { fullName: p.full_name || 'Unknown', email: p.email };
      });

      // Build leaderboard
      const staffMap: Record<string, StaffScore> = {};
      (attempts || []).forEach(a => {
        if (!staffMap[a.user_id]) {
          const profile = profileMap[a.user_id];
          staffMap[a.user_id] = {
            userId: a.user_id,
            fullName: profile?.fullName || 'Unknown',
            email: profile?.email || '',
            role: roleMap[a.user_id] || null,
            avgScore: 0,
            bestScore: 0,
            testsTaken: 0,
            lastTestDate: null,
            attempts: [],
          };
        }
        const s = staffMap[a.user_id];
        const pct = Number(a.percentage) || 0;
        s.attempts.push({
          id: a.id,
          testType: a.test_type,
          score: a.score || 0,
          totalQuestions: a.total_questions || 0,
          percentage: pct,
          completedAt: a.completed_at!,
        });
        s.testsTaken++;
        if (pct > s.bestScore) s.bestScore = pct;
        if (!s.lastTestDate || a.completed_at! > s.lastTestDate) {
          s.lastTestDate = a.completed_at!;
        }
      });

      // Calculate averages
      Object.values(staffMap).forEach(s => {
        const sum = s.attempts.reduce((acc, a) => acc + a.percentage, 0);
        s.avgScore = s.testsTaken > 0 ? Math.round(sum / s.testsTaken) : 0;
      });

      const board = Object.values(staffMap).sort((a, b) => b.avgScore - a.avgScore);
      setLeaderboard(board);

      // Overview stats
      const allScores = (attempts || []).map(a => Number(a.percentage) || 0);
      const avgTeamScore = allScores.length > 0
        ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
        : 0;

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const testsThisWeek = (attempts || []).filter(a => new Date(a.completed_at!) >= weekAgo).length;

      const testedUserIds = new Set(Object.keys(staffMap));
      const allStaffIds = new Set((profiles || []).map(p => p.id));
      const staffNotTested = [...allStaffIds].filter(id => !testedUserIds.has(id)).length;

      // Lowest category by test_type
      const catScores: Record<string, { sum: number; count: number }> = {};
      (attempts || []).forEach(a => {
        if (!catScores[a.test_type]) catScores[a.test_type] = { sum: 0, count: 0 };
        catScores[a.test_type].sum += Number(a.percentage) || 0;
        catScores[a.test_type].count++;
      });

      // Build a test_type -> display name map from DB configs
      const testNameMap: Record<string, string> = {
        service_staff: 'Server & Bartender',
        server_assistant: 'Server Assistant',
      };
      (testConfigs || []).forEach(tc => {
        if (tc.test_name) testNameMap[tc.test_type] = tc.test_name;
      });

      let lowestCategory = 'N/A';
      let lowestCategoryScore = 100;
      Object.entries(catScores).forEach(([cat, { sum, count }]) => {
        const avg = Math.round(sum / count);
        if (avg < lowestCategoryScore) {
          lowestCategoryScore = avg;
          lowestCategory = testNameMap[cat] || cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
      });

      setOverview({ avgTeamScore, testsThisWeek, staffNotTested, lowestCategory, lowestCategoryScore });

      // Completion tracker
      const requiredTestTypes = (testConfigs || []).map(t => t.test_type);
      // Build display name map for missing test labels
      const testDisplayMap: Record<string, string> = {
        service_staff: 'Server & Bartender Test',
        server_assistant: 'Server Assistant Test',
      };
      (testConfigs || []).forEach(tc => {
        if (tc.test_name) testDisplayMap[tc.test_type] = tc.test_name;
      });

      const incomplete: IncompleteStaff[] = [];
      (profiles || []).forEach(p => {
        const userAttempts = staffMap[p.id]?.attempts || [];
        const completedTypes = new Set(userAttempts.map(a => a.testType));
        const missing = requiredTestTypes.filter(t => !completedTypes.has(t));
        if (missing.length > 0) {
          incomplete.push({
            userId: p.id,
            fullName: p.full_name || 'Unknown',
            email: p.email,
            role: roleMap[p.id] || null,
            missingTests: missing.map(t => testDisplayMap[t] || t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
          });
        }
      });
      setIncompleteStaff(incomplete);

      // Build inactive staff list (7+ days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const latestSessionMap: Record<string, string> = {};
      (sessions || []).forEach(s => {
        const uid = s.user_id;
        const ts = s.session_end || s.last_heartbeat;
        if (ts && !latestSessionMap[uid]) {
          latestSessionMap[uid] = ts;
        }
      });

      const inactive: InactiveStaff[] = [];
      (profiles || []).forEach(p => {
        const role = roleMap[p.id];
        if (role === 'lead_admin' || role === 'admin') return;
        const lastSeen = latestSessionMap[p.id] || null;
        if (!lastSeen || new Date(lastSeen) < sevenDaysAgo) {
          const days = lastSeen
            ? Math.floor((Date.now() - new Date(lastSeen).getTime()) / 86400000)
            : 999;
          inactive.push({
            userId: p.id,
            fullName: p.full_name || 'Unknown',
            email: p.email,
            role: role || null,
            lastSeen,
            daysSinceActive: days,
          });
        }
      });

      inactive.sort((a, b) => b.daysSinceActive - a.daysSinceActive);
      setInactiveStaff(inactive);

    } catch (err) {
      console.error('Error fetching scoring data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStaffDetail = useCallback(async (userId: string): Promise<StaffDetail> => {
    try {
      // Get all attempt IDs for this user
      const { data: userAttempts } = await supabase
        .from('foh_test_attempts')
        .select('id, test_type, score, total_questions, percentage, completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      const attemptIds = (userAttempts || []).map(a => a.id);

      let answers: any[] = [];
      if (attemptIds.length > 0) {
        const { data } = await supabase
          .from('foh_test_answers')
          .select('question_text, correct_answer, is_correct, attempt_id')
          .in('attempt_id', attemptIds);
        answers = data || [];
      }

      // Category breakdown from attempt test types
      const catMap: Record<string, { correct: number; total: number }> = {};
      (userAttempts || []).forEach(a => {
        const cat = a.test_type;
        if (!catMap[cat]) catMap[cat] = { correct: 0, total: 0 };
        catMap[cat].correct += a.score || 0;
        catMap[cat].total += a.total_questions || 0;
      });

      const categoryBreakdown: CategoryBreakdown[] = Object.entries(catMap).map(([cat, { correct, total }]) => ({
        category: cat,
        correct,
        total,
        percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      }));

      // Most missed questions
      const missMap: Record<string, { questionText: string; correctAnswer: string; timesWrong: number }> = {};
      answers.forEach(a => {
        if (!a.is_correct) {
          const key = a.question_text;
          if (!missMap[key]) {
            missMap[key] = { questionText: a.question_text, correctAnswer: a.correct_answer, timesWrong: 0 };
          }
          missMap[key].timesWrong++;
        }
      });

      const missedQuestions = Object.values(missMap)
        .sort((a, b) => b.timesWrong - a.timesWrong)
        .slice(0, 5);

      return {
        attempts: (userAttempts || []).map(a => ({
          id: a.id,
          testType: a.test_type,
          score: a.score || 0,
          totalQuestions: a.total_questions || 0,
          percentage: Number(a.percentage) || 0,
          completedAt: a.completed_at!,
        })),
        categoryBreakdown,
        missedQuestions,
      };
    } catch (err) {
      console.error('Error fetching staff detail:', err);
      return { attempts: [], categoryBreakdown: [], missedQuestions: [] };
    }
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ['Name', 'Email', 'Role', 'Avg Score', 'Best Score', 'Tests Taken', 'Last Test Date'];
    const rows = leaderboard.map(s => [
      s.fullName,
      s.email,
      ROLE_LABELS[s.role || ''] || s.role || 'No Role',
      `${s.avgScore}%`,
      `${s.bestScore}%`,
      s.testsTaken.toString(),
      s.lastTestDate ? new Date(s.lastTestDate).toLocaleDateString() : 'Never',
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ce-soir-staff-scores-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [leaderboard]);

  const sendReminder = useCallback(async (staff: IncompleteStaff) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-test-reminder', {
        body: {
          email: staff.email,
          fullName: staff.fullName,
          missingTests: staff.missingTests,
        },
      });
      if (error) throw error;
      toast.success(`Reminder sent to ${staff.fullName}`);
    } catch (err: any) {
      console.error('Error sending reminder:', err);
      toast.error('Failed to send reminder');
    }
  }, []);

  const deleteUserScores = useCallback(async (userId: string, userName: string) => {
    try {
      // Delete foh_test_answers for this user's attempts
      const { data: userAttempts } = await supabase
        .from('foh_test_attempts')
        .select('id')
        .eq('user_id', userId);

      const attemptIds = (userAttempts || []).map(a => a.id);
      if (attemptIds.length > 0) {
        await supabase
          .from('foh_test_answers')
          .delete()
          .in('attempt_id', attemptIds);
      }

      // Delete foh_test_attempts
      const { error: attError } = await supabase
        .from('foh_test_attempts')
        .delete()
        .eq('user_id', userId);
      if (attError) throw attError;

      // Delete quiz_scores
      await supabase
        .from('quiz_scores')
        .delete()
        .eq('user_id', userId);

      toast.success(`All test scores removed for ${userName}`);

      // Remove from local state
      setLeaderboard(prev => prev.filter(s => s.userId !== userId));

      return true;
    } catch (err: any) {
      console.error('Error deleting scores:', err);
      toast.error('Failed to remove scores');
      return false;
    }
  }, []);

  return {
    leaderboard,
    overview,
    incompleteStaff,
    inactiveStaff,
    isLoading,
    fetchAll,
    fetchStaffDetail,
    exportCSV,
    sendReminder,
    deleteUserScores,
  };
}
