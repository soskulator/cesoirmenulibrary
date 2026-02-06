import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { CATEGORIES, DIFFICULTIES, type QuizQuestion, type QuizQuestionInsert } from '@/hooks/useQuizQuestions';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: QuizQuestionInsert) => Promise<boolean>;
  question?: QuizQuestion | null;
}

const ROLE_OPTIONS = [
  { value: 'server', label: 'Server' },
  { value: 'bartender', label: 'Bartender' },
  { value: 'server_assistant', label: 'Server Assistant' },
];

export function QuestionFormModal({ open, onClose, onSave, question }: Props) {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'short_answer'>('short_answer');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [category, setCategory] = useState('service');
  const [difficulty, setDifficulty] = useState('standard');
  const [targetRoles, setTargetRoles] = useState<string[]>(['server', 'bartender']);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (question) {
      setQuestionText(question.question_text);
      setQuestionType(question.question_type);
      setOptions(question.options?.length ? [...question.options, ...Array(4 - question.options.length).fill('')].slice(0, 4) : ['', '', '', '']);
      setCorrectIndex(question.correct_index ?? 0);
      setCorrectAnswer(question.correct_answer);
      setCategory(question.category);
      setDifficulty(question.difficulty);
      setTargetRoles(question.target_roles);
    } else {
      setQuestionText('');
      setQuestionType('short_answer');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setCorrectAnswer('');
      setCategory('service');
      setDifficulty('standard');
      setTargetRoles(['server', 'bartender']);
    }
  }, [question, open]);

  const handleSave = async () => {
    if (!questionText.trim()) return;
    setIsSaving(true);

    const filteredOptions = options.filter(o => o.trim());
    const data: QuizQuestionInsert = {
      question_text: questionText.trim(),
      question_type: questionType,
      correct_answer: questionType === 'multiple_choice' ? filteredOptions[correctIndex] || '' : correctAnswer.trim(),
      options: questionType === 'multiple_choice' ? filteredOptions : null,
      correct_index: questionType === 'multiple_choice' ? correctIndex : null,
      category,
      difficulty,
      target_roles: targetRoles,
    };

    const success = await onSave(data);
    setIsSaving(false);
    if (success) onClose();
  };

  const toggleRole = (role: string) => {
    setTargetRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {question ? 'Edit Question' : 'Add Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Question text */}
          <div className="space-y-2">
            <Label>Question</Label>
            <Textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Enter question text…"
              rows={3}
            />
          </div>

          {/* Type selector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={questionType} onValueChange={v => setQuestionType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  <SelectItem value="short_answer">Short Answer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* MC Options */}
          {questionType === 'multiple_choice' && (
            <div className="space-y-3">
              <Label>Options (select correct answer)</Label>
              <RadioGroup value={String(correctIndex)} onValueChange={v => setCorrectIndex(Number(v))}>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <RadioGroupItem value={String(i)} id={`opt-${i}`} />
                    <Input
                      value={opt}
                      onChange={e => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* SA correct answer */}
          {questionType === 'short_answer' && (
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              <Textarea
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                placeholder="Enter the expected answer…"
                rows={2}
              />
            </div>
          )}

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target roles */}
          <div className="space-y-2">
            <Label>Target Roles</Label>
            <div className="flex flex-wrap gap-4">
              {ROLE_OPTIONS.map(r => (
                <label key={r.value} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={targetRoles.includes(r.value)}
                    onCheckedChange={() => toggleRole(r.value)}
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving || !questionText.trim()} className="bg-copper hover:bg-copper-light text-white">
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {question ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
