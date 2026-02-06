import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuizQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  question_type: 'multiple_choice' | 'short_answer';
  options: string[] | null;
  correct_index: number | null;
  category: string;
  difficulty: string;
  target_roles: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestionInsert {
  question_text: string;
  correct_answer: string;
  question_type: 'multiple_choice' | 'short_answer';
  options?: string[] | null;
  correct_index?: number | null;
  category: string;
  difficulty: string;
  target_roles: string[];
  is_active?: boolean;
  created_by?: string;
}

export interface TestConfig {
  id: string;
  test_name: string;
  test_type: string;
  total_questions: number;
  time_limit_minutes: number | null;
  passing_score: number;
  is_active: boolean;
  created_by: string | null;
  updated_at: string;
  difficulty_filter: string[] | null;
}

export interface QuestionAssignment {
  id: string;
  test_config_id: string;
  question_id: string;
  sort_order: number | null;
  is_required: boolean;
}

const CATEGORIES = ['service', 'menu', 'drinks', 'operations', 'general', 'allergy', 'wine', 'spirits', 'cocktails', 'food'] as const;
const DIFFICULTIES = ['basic', 'standard', 'advanced'] as const;

export { CATEGORIES, DIFFICULTIES };

export function useQuizQuestions() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuestions = useCallback(async (opts: {
    page?: number;
    perPage?: number;
    search?: string;
    category?: string;
    type?: string;
    activeOnly?: boolean | null;
  } = {}) => {
    setIsLoading(true);
    const { page = 1, perPage = 20, search, category, type, activeOnly } = opts;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from('quiz_questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search) query = query.ilike('question_text', `%${search}%`);
    if (category) query = query.eq('category', category);
    if (type) query = query.eq('question_type', type);
    if (activeOnly === true) query = query.eq('is_active', true);
    if (activeOnly === false) query = query.eq('is_active', false);

    const { data, error, count } = await query;
    if (error) {
      toast({ title: 'Error loading questions', description: error.message, variant: 'destructive' });
    } else {
      setQuestions((data as QuizQuestion[]) ?? []);
      setTotalCount(count ?? 0);
    }
    setIsLoading(false);
  }, [toast]);

  const toggleActive = useCallback(async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ is_active: isActive })
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, is_active: isActive } : q));
    return true;
  }, [toast]);

  const createQuestion = useCallback(async (q: QuizQuestionInsert) => {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(q)
      .select()
      .single();
    if (error) {
      toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      return null;
    }
    return data as QuizQuestion;
  }, [toast]);

  const updateQuestion = useCallback(async (id: string, q: Partial<QuizQuestionInsert>) => {
    const { error } = await supabase
      .from('quiz_questions')
      .update(q)
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  }, [toast]);

  const deleteQuestion = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setQuestions(prev => prev.filter(q => q.id !== id));
    setTotalCount(prev => prev - 1);
    return true;
  }, [toast]);

  return { questions, totalCount, isLoading, fetchQuestions, toggleActive, createQuestion, updateQuestion, deleteQuestion };
}

export function useTestConfigs() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<TestConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConfigs = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('test_configurations')
      .select('*')
      .order('test_type');
    if (error) {
      toast({ title: 'Error loading configs', description: error.message, variant: 'destructive' });
    } else {
      setConfigs((data as TestConfig[]) ?? []);
    }
    setIsLoading(false);
  }, [toast]);

  const createConfig = useCallback(async (config: Omit<TestConfig, 'id' | 'created_by' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('test_configurations')
      .insert(config)
      .select()
      .single();
    if (error) {
      toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      return null;
    }
    setConfigs(prev => [...prev, data as TestConfig]);
    return data as TestConfig;
  }, [toast]);

  const updateConfig = useCallback(async (id: string, updates: Partial<TestConfig>) => {
    const { error } = await supabase
      .from('test_configurations')
      .update(updates)
      .eq('id', id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return false;
    }
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    return true;
  }, [toast]);

  return { configs, isLoading, fetchConfigs, createConfig, updateConfig };
}

export function useQuestionAssignments() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<QuestionAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAssignments = useCallback(async (testConfigId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('test_question_assignments')
      .select('*')
      .eq('test_config_id', testConfigId)
      .order('sort_order');
    if (error) {
      toast({ title: 'Error loading assignments', description: error.message, variant: 'destructive' });
    } else {
      setAssignments((data as QuestionAssignment[]) ?? []);
    }
    setIsLoading(false);
  }, [toast]);

  const saveAssignments = useCallback(async (
    testConfigId: string,
    questionIds: string[],
    requiredIds: Set<string>
  ) => {
    // Delete existing assignments
    const { error: delError } = await supabase
      .from('test_question_assignments')
      .delete()
      .eq('test_config_id', testConfigId);
    if (delError) {
      toast({ title: 'Error clearing assignments', description: delError.message, variant: 'destructive' });
      return false;
    }

    if (questionIds.length === 0) {
      setAssignments([]);
      return true;
    }

    const rows = questionIds.map((qId, i) => ({
      test_config_id: testConfigId,
      question_id: qId,
      sort_order: i,
      is_required: requiredIds.has(qId),
    }));

    const { data, error } = await supabase
      .from('test_question_assignments')
      .insert(rows)
      .select();

    if (error) {
      toast({ title: 'Error saving assignments', description: error.message, variant: 'destructive' });
      return false;
    }
    setAssignments((data as QuestionAssignment[]) ?? []);
    return true;
  }, [toast]);

  return { assignments, isLoading, fetchAssignments, saveAssignments };
}
