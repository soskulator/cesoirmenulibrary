import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DbCategoryQuestion {
  id: string;
  question_text: string;
  correct_answer: string;
  question_type: 'multiple_choice' | 'short_answer';
  options: string[] | null;
  correct_index: number | null;
  category: string;
  difficulty: string;
}

export function useCategoryQuestions(category: string) {
  const [questions, setQuestions] = useState<DbCategoryQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(true);

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('id, question_text, correct_answer, question_type, options, correct_index, category, difficulty')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at');

      if (error) throw error;

      if (data && data.length > 0) {
        const transformed = data.map(q => ({
          ...q,
          question_type: q.question_type as 'multiple_choice' | 'short_answer',
          options: Array.isArray(q.options) ? (q.options as string[]) : null,
        }));
        setQuestions(transformed);
        setIsEmpty(false);
      } else {
        setQuestions([]);
        setIsEmpty(true);
      }
    } catch (err) {
      console.error(`Error fetching ${category} questions:`, err);
      setQuestions([]);
      setIsEmpty(true);
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, isLoading, isEmpty };
}
