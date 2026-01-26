import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  serviceStaffQuestions, 
  serverAssistantQuestions, 
  FohTestQuestion,
  TestType 
} from '@/data/fohTestData';

export interface DbFohTestQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options: string[];
  correct_answer: string;
  correct_index: number | null;
  category: 'service' | 'menu' | 'drinks' | 'operations' | 'general';
  test_type: TestType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useFohTestQuestions(testType?: TestType) {
  const [questions, setQuestions] = useState<DbFohTestQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('foh_test_questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (testType) {
        query = query.eq('test_type', testType);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const transformedData = data.map(item => ({
          ...item,
          options: Array.isArray(item.options) ? item.options : [],
          test_type: (item.test_type as TestType) || 'service_staff',
        })) as DbFohTestQuestion[];
        
        setQuestions(transformedData);
        setIsInitialized(true);
      } else {
        setIsInitialized(false);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [testType]);

  const initializeFromStatic = useCallback(async (targetTestType?: TestType) => {
    try {
      setIsLoading(true);
      
      // Get the appropriate static questions
      const staticQuestions = targetTestType === 'server_assistant' 
        ? serverAssistantQuestions 
        : targetTestType === 'service_staff'
        ? serviceStaffQuestions
        : [...serviceStaffQuestions, ...serverAssistantQuestions];
      
      // Transform static questions to database format
      const dbQuestions = staticQuestions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options || [],
        correct_answer: q.correctAnswer,
        correct_index: q.correctIndex ?? null,
        category: q.category,
        test_type: q.testType,
        is_active: true,
      }));

      const { error } = await supabase
        .from('foh_test_questions')
        .insert(dbQuestions);

      if (error) throw error;

      toast({
        title: 'Questions Initialized',
        description: `${staticQuestions.length} questions synced to database.`,
      });

      await fetchQuestions();
    } catch (error) {
      console.error('Error initializing questions:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize questions.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuestions, toast]);

  const addQuestion = useCallback(async (question: Omit<DbFohTestQuestion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('foh_test_questions')
        .insert(question);

      if (error) throw error;

      toast({
        title: 'Question Added',
        description: 'New question has been added.',
      });

      await fetchQuestions();
      return true;
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: 'Error',
        description: 'Failed to add question.',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchQuestions, toast]);

  const updateQuestion = useCallback(async (id: string, updates: Partial<DbFohTestQuestion>) => {
    try {
      const { error } = await supabase
        .from('foh_test_questions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Question Updated',
        description: 'Question has been updated.',
      });

      await fetchQuestions();
      return true;
    } catch (error) {
      console.error('Error updating question:', error);
      toast({
        title: 'Error',
        description: 'Failed to update question.',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchQuestions, toast]);

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('foh_test_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Question Deleted',
        description: 'Question has been removed.',
      });

      await fetchQuestions();
      return true;
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete question.',
        variant: 'destructive',
      });
      return false;
    }
  }, [fetchQuestions, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Convert to test format for a specific test type
  const getTestQuestions = useCallback((forTestType?: TestType): FohTestQuestion[] => {
    const targetType = forTestType || testType;
    
    if (isInitialized && questions.length > 0) {
      const filtered = targetType 
        ? questions.filter(q => q.is_active && q.test_type === targetType)
        : questions.filter(q => q.is_active);
      
      return filtered.map((q, index) => ({
        id: index + 1,
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correct_answer,
        correctIndex: q.correct_index ?? undefined,
        category: q.category,
        testType: q.test_type,
      }));
    }
    
    // Fallback to static questions
    if (targetType === 'server_assistant') {
      return serverAssistantQuestions;
    } else if (targetType === 'service_staff') {
      return serviceStaffQuestions;
    }
    return [...serviceStaffQuestions, ...serverAssistantQuestions];
  }, [questions, isInitialized, testType]);

  return {
    questions,
    isLoading,
    isInitialized,
    fetchQuestions,
    initializeFromStatic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    getTestQuestions,
  };
}
