import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useQuizScores() {
  const { user } = useAuth();

  const saveQuizScore = useCallback(async (
    quizType: string,
    score: number,
    totalQuestions: number
  ) => {
    if (!user) return;

    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    try {
      const { error } = await supabase
        .from('quiz_scores')
        .insert({
          user_id: user.id,
          quiz_type: quizType,
          score,
          total_questions: totalQuestions,
          percentage,
        });

      if (error) {
        // Silently fail if table doesn't exist yet
        if (!error.message.includes('does not exist')) {
          console.error('Error saving quiz score:', error);
        }
      }
    } catch (error) {
      console.error('Error saving quiz score:', error);
    }
  }, [user]);

  return { saveQuizScore };
}
