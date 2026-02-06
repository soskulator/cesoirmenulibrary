import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuestionAssignments, CATEGORIES, type TestConfig, type QuizQuestion } from '@/hooks/useQuizQuestions';
import { useToast } from '@/hooks/use-toast';

interface Props {
  config: TestConfig;
  onBack: () => void;
}

export function AssignQuestionsTab({ config, onBack }: Props) {
  const { toast } = useToast();
  const { assignments, isLoading: assignLoading, fetchAssignments, saveAssignments } = useQuestionAssignments();
  const [allQuestions, setAllQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set());
  const [requiredIds, setRequiredIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');

  // Load all active questions
  useEffect(() => {
    const load = async () => {
      setIsLoadingQuestions(true);
      const { data } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('question_text');
      setAllQuestions((data as QuizQuestion[]) ?? []);
      setIsLoadingQuestions(false);
    };
    load();
  }, []);

  // Load existing assignments
  useEffect(() => {
    fetchAssignments(config.id);
  }, [config.id, fetchAssignments]);

  // Sync local state from assignments
  useEffect(() => {
    const ids = new Set(assignments.map(a => a.question_id));
    const reqIds = new Set(assignments.filter(a => a.is_required).map(a => a.question_id));
    setAssignedIds(ids);
    setRequiredIds(reqIds);
  }, [assignments]);

  const filteredAvailable = useMemo(() => {
    return allQuestions.filter(q => {
      if (filterCategory && q.category !== filterCategory) return false;
      if (search && !q.question_text.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allQuestions, filterCategory, search]);

  const assignedQuestions = useMemo(() => {
    return allQuestions.filter(q => assignedIds.has(q.id));
  }, [allQuestions, assignedIds]);

  const toggleAssign = (id: string) => {
    setAssignedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setRequiredIds(r => { const nr = new Set(r); nr.delete(id); return nr; });
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleRequired = (id: string) => {
    setRequiredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    const ok = await saveAssignments(config.id, Array.from(assignedIds), requiredIds);
    setIsSaving(false);
    if (ok) {
      toast({ title: 'Assignments saved', description: `${assignedIds.size} questions assigned to ${config.test_name}` });
    }
  };

  const requiredCount = requiredIds.size;
  const poolCount = assignedIds.size - requiredCount;
  const isLoading = assignLoading || isLoadingQuestions;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h3 className="font-serif text-lg font-semibold">
            Assign Questions: <span className="text-copper">{config.test_name}</span>
          </h3>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-copper hover:bg-copper-light text-white">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Assignments
        </Button>
      </div>

      {/* Summary bar */}
      <Card className="bg-muted/30">
        <CardContent className="py-3 px-4 flex flex-wrap items-center gap-4 text-sm">
          <span><strong className="text-copper">{requiredCount}</strong> required</span>
          <span>+</span>
          <span><strong>{poolCount}</strong> in pool</span>
          <span>=</span>
          <span><strong>{assignedIds.size}</strong> available</span>
          <span className="text-muted-foreground ml-auto">Test uses <strong>{config.total_questions}</strong> questions</span>
        </CardContent>
      </Card>

      {/* Split view */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Available questions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Available Questions</CardTitle>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              <Select value={filterCategory} onValueChange={v => setFilterCategory(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto space-y-1 pt-0">
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No questions match filters</p>
            ) : (
              filteredAvailable.map(q => (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${assignedIds.has(q.id) ? 'bg-copper/5' : ''}`}
                >
                  <Checkbox
                    checked={assignedIds.has(q.id)}
                    onCheckedChange={() => toggleAssign(q.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{q.question_text}</p>
                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">{q.category}</Badge>
                  </div>
                </label>
              ))
            )}
          </CardContent>
        </Card>

        {/* Assigned questions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Assigned Questions <Badge variant="secondary" className="ml-2">{assignedIds.size}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto space-y-1 pt-0">
            {assignedQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No questions assigned yet</p>
            ) : (
              assignedQuestions.map(q => (
                <div key={q.id} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{q.question_text}</p>
                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">{q.category}</Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-muted-foreground">Required</span>
                    <Switch
                      checked={requiredIds.has(q.id)}
                      onCheckedChange={() => toggleRequired(q.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
