import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Pencil, Trash2, Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizQuestions, CATEGORIES, type QuizQuestion, type QuizQuestionInsert } from '@/hooks/useQuizQuestions';
import { QuestionFormModal } from './QuestionFormModal';
import { BulkImportModal } from './BulkImportModal';

const categoryColors: Record<string, string> = {
  service: 'bg-burgundy/15 text-burgundy border-burgundy/30',
  menu: 'bg-jade/15 text-jade border-jade/30',
  drinks: 'bg-gold/15 text-gold border-gold/30',
  operations: 'bg-terracotta/15 text-terracotta border-terracotta/30',
  general: 'bg-muted text-muted-foreground border-muted',
  allergy: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-400',
  wine: 'bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400',
  spirits: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400',
  cocktails: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-400',
  food: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export function QuestionBankTab() {
  const { user } = useAuth();
  const { questions, totalCount, isLoading, fetchQuestions, toggleActive, createQuestion, updateQuestion, deleteQuestion } = useQuizQuestions();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const perPage = 20;

  const loadQuestions = useCallback(() => {
    fetchQuestions({
      page,
      perPage,
      search: search || undefined,
      category: filterCategory || undefined,
      type: filterType || undefined,
      activeOnly: filterActive,
    });
  }, [page, search, filterCategory, filterType, filterActive, fetchQuestions, perPage]);

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  // Reset page on filter change
  useEffect(() => { setPage(1); }, [search, filterCategory, filterType, filterActive]);

  const totalPages = Math.ceil(totalCount / perPage);

  const handleSave = async (data: QuizQuestionInsert): Promise<boolean> => {
    if (editingQuestion) {
      const ok = await updateQuestion(editingQuestion.id, data);
      if (ok) loadQuestions();
      return ok;
    } else {
      const result = await createQuestion({ ...data, created_by: user?.id });
      if (result) loadQuestions();
      return !!result;
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteQuestion(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center flex-1 w-full sm:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterCategory} onValueChange={v => setFilterCategory(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={v => setFilterType(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
            onValueChange={v => setFilterActive(v === 'all' ? null : v === 'active')}
          >
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Questions
          </Button>
          <Button onClick={() => { setEditingQuestion(null); setModalOpen(true); }} className="bg-copper hover:bg-copper-light text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">{totalCount} question{totalCount !== 1 ? 's' : ''} found</p>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[300px]">Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="w-[70px]">Active</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No questions found
                </TableCell>
              </TableRow>
            ) : (
              questions.map(q => (
                <TableRow key={q.id}>
                  <TableCell className="max-w-[400px]">
                    <span className="line-clamp-2 text-sm">{q.question_text.length > 80 ? q.question_text.slice(0, 80) + '…' : q.question_text}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs capitalize ${categoryColors[q.category] || ''}`}>
                      {q.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {q.question_type === 'multiple_choice' ? 'MC' : 'SA'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{q.difficulty}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {q.target_roles.map(r => (
                        <Badge key={r} variant="outline" className="text-[10px] px-1.5 py-0">
                          {r === 'server_assistant' ? 'SA' : r.slice(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={q.is_active}
                      onCheckedChange={checked => toggleActive(q.id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingQuestion(q); setModalOpen(true); }}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingId(q.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <QuestionFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingQuestion(null); }}
        onSave={handleSave}
        question={editingQuestion}
      />

      <AlertDialog open={!!deletingId} onOpenChange={v => { if (!v) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this question and any test assignments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BulkImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={loadQuestions}
      />
    </div>
  );
}
