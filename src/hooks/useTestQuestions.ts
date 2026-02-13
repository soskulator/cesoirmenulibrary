import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FohTestQuestion, TestType, serviceStaffQuestions, serverAssistantQuestions } from '@/data/fohTestData';

// Standalone build logic — takes data directly, no dependency on React state
function buildFromData(
  questions: TestQuestion[],
  usingFallback: boolean,
  testConfig: TestConfig | null,
  testType: TestType | null
): FohTestQuestion[] {
  if (usingFallback || questions.length === 0) {
    if (testType === 'server_assistant') {
      return [...serverAssistantQuestions].sort(() => Math.random() - 0.5);
    }
    if (testType === 'service_staff') {
      return [...serviceStaffQuestions].sort(() => Math.random() - 0.5);
    }
    return [];
  }

  const diffFilter = testConfig?.difficulty_filter;
  let filtered = questions;
  if (diffFilter && diffFilter.length > 0) {
    const diffFiltered = questions.filter(q => diffFilter.includes(q.difficulty));
    if (diffFiltered.length > 0) {
      filtered = diffFiltered;
    } else {
      console.warn(`Difficulty filter ${JSON.stringify(diffFilter)} matched 0 questions — ignoring filter`);
    }
  }

  const totalNeeded = testConfig?.total_questions ?? filtered.length;
  const required = filtered.filter(q => q.is_required);
  const pool = filtered.filter(q => !q.is_required);
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  const poolNeeded = Math.max(0, totalNeeded - required.length);
  const selectedPool = shuffledPool.slice(0, poolNeeded);
  const finalSet = [...required, ...selectedPool].sort(() => Math.random() - 0.5);

  return finalSet.map((q, index) => ({
    id: index + 1,
    question: q.question_text,
    type: q.question_type,
    options: q.options ?? undefined,
    correctAnswer: q.correct_answer,
    correctIndex: q.correct_index ?? undefined,
    category: q.category as FohTestQuestion['category'],
    testType: testType!,
    _dbId: q.id,
  }));
}

export interface TestConfig {
  id: string;
  test_name: string;
  test_type: string;
  total_questions: number;
  time_limit_minutes: number | null;
  passing_score: number;
  is_active: boolean;
  difficulty_filter: string[] | null;
}

export interface TestQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  question_type: 'multiple_choice' | 'short_answer';
  options: string[] | null;
  correct_index: number | null;
  category: string;
  difficulty: string;
  is_required: boolean;
}

export function useTestQuestions(testType: TestType | null) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchTestData = useCallback(async () => {
    if (!testType) return;

    setIsLoading(true);
    setError(null);
    setUsingFallback(false);

    try {
      // 1. Fetch the test_configuration for this test_type
      const { data: configData, error: configError } = await supabase
        .from('test_configurations')
        .select('*')
        .eq('test_type', testType)
        .eq('is_active', true)
        .maybeSingle();

      if (configError) throw configError;

      if (!configData) {
        // No config found — use fallback
        setUsingFallback(true);
        setTestConfig(null);
        setQuestions([]);
        return;
      }

      setTestConfig(configData as TestConfig);

      // 2. Fetch assigned questions by joining test_question_assignments with quiz_questions
      const { data: assignmentData, error: assignError } = await supabase
        .from('test_question_assignments')
        .select(`
          question_id,
          is_required,
          sort_order,
          quiz_questions (
            id,
            question_text,
            correct_answer,
            question_type,
            options,
            correct_index,
            category,
            difficulty
          )
        `)
        .eq('test_config_id', configData.id)
        .order('sort_order');

      if (assignError) throw assignError;

      if (!assignmentData || assignmentData.length === 0) {
        // Config exists but no questions assigned — use fallback
        setUsingFallback(true);
        setQuestions([]);
        return;
      }

      // Transform the joined data
      const transformedQuestions: TestQuestion[] = assignmentData
        .filter((a: any) => a.quiz_questions && a.quiz_questions.is_active !== false)
        .map((a: any) => {
          const q = a.quiz_questions;
          return {
            id: q.id,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            question_type: q.question_type as 'multiple_choice' | 'short_answer',
            options: Array.isArray(q.options) ? q.options : null,
            correct_index: q.correct_index,
            category: q.category,
            difficulty: q.difficulty,
            is_required: a.is_required,
          };
        });

      if (transformedQuestions.length === 0) {
        setUsingFallback(true);
        setQuestions([]);
        return;
      }

      setQuestions(transformedQuestions);
    } catch (err) {
      console.error('Error fetching test questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
      setUsingFallback(true);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [testType]);

  useEffect(() => {
    fetchTestData();
  }, [fetchTestData]);

  // Build the final test question set with required + pool logic
  // Whether this test type supports static fallback data
  const isLegacyType = testType === 'service_staff' || testType === 'server_assistant';
  const hasNoQuestions = (usingFallback || questions.length === 0) && !isLegacyType;

  const buildTestQuestions = useCallback((): FohTestQuestion[] => {
    return buildFromData(questions, usingFallback, testConfig, testType);
  }, [questions, usingFallback, testConfig, testType]);

  // Fetch fresh data from DB and build questions in one atomic call
  // This bypasses React state to guarantee the latest data is used
  const fetchAndBuildFresh = useCallback(async (): Promise<FohTestQuestion[]> => {
    if (!testType) return [];

    try {
      const { data: configData, error: configError } = await supabase
        .from('test_configurations')
        .select('*')
        .eq('test_type', testType)
        .eq('is_active', true)
        .maybeSingle();

      if (configError) throw configError;

      if (!configData) {
        return buildFromData([], true, null, testType);
      }

      const freshConfig = configData as TestConfig;

      const { data: assignmentData, error: assignError } = await supabase
        .from('test_question_assignments')
        .select(`
          question_id,
          is_required,
          sort_order,
          quiz_questions (
            id,
            question_text,
            correct_answer,
            question_type,
            options,
            correct_index,
            category,
            difficulty
          )
        `)
        .eq('test_config_id', freshConfig.id)
        .order('sort_order');

      if (assignError) throw assignError;

      if (!assignmentData || assignmentData.length === 0) {
        return buildFromData([], true, freshConfig, testType);
      }

      const freshQuestions: TestQuestion[] = assignmentData
        .filter((a: any) => a.quiz_questions && a.quiz_questions.is_active !== false)
        .map((a: any) => {
          const q = a.quiz_questions;
          return {
            id: q.id,
            question_text: q.question_text,
            correct_answer: q.correct_answer,
            question_type: q.question_type as 'multiple_choice' | 'short_answer',
            options: Array.isArray(q.options) ? q.options : null,
            correct_index: q.correct_index,
            category: q.category,
            difficulty: q.difficulty,
            is_required: a.is_required,
          };
        });

      if (freshQuestions.length === 0) {
        return buildFromData([], true, freshConfig, testType);
      }

      // Also update hook state so UI stays consistent
      setQuestions(freshQuestions);
      setTestConfig(freshConfig);
      setUsingFallback(false);

      return buildFromData(freshQuestions, false, freshConfig, testType);
    } catch (err) {
      console.error('Error fetching fresh test questions:', err);
      // Fall back to whatever is in state
      return buildFromData(questions, usingFallback, testConfig, testType);
    }
  }, [testType, questions, usingFallback, testConfig]);

  return {
    questions,
    testConfig,
    isLoading,
    error,
    usingFallback,
    hasNoQuestions,
    isLegacyType,
    buildTestQuestions,
    fetchAndBuildFresh,
    refetch: fetchTestData,
  };
}
