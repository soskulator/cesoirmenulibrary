import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTestConfigs, CATEGORIES } from '@/hooks/useQuizQuestions';
import { useToast } from '@/hooks/use-toast';

const VALID_CATEGORIES = new Set<string>(CATEGORIES);
const VALID_TYPES = new Set(['multiple_choice', 'short_answer']);
const VALID_DIFFICULTIES = new Set(['basic', 'standard', 'advanced']);

interface ParsedRow {
  question_text: string;
  correct_answer: string;
  question_type: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_index?: string;
  category: string;
  difficulty?: string;
  target_roles?: string;
}

interface ValidatedRow {
  data: ParsedRow;
  errors: string[];
  rowIndex: number;
}

function validateRow(row: ParsedRow, index: number): ValidatedRow {
  const errors: string[] = [];
  if (!row.question_text?.trim()) errors.push('Missing question_text');
  if (!row.correct_answer?.trim()) errors.push('Missing correct_answer');
  if (!row.question_type?.trim()) errors.push('Missing question_type');
  else if (!VALID_TYPES.has(row.question_type.trim())) errors.push(`Invalid question_type: "${row.question_type}"`);
  if (!row.category?.trim()) errors.push('Missing category');
  else if (!VALID_CATEGORIES.has(row.category.trim())) errors.push(`Invalid category: "${row.category}"`);
  if (row.difficulty && !VALID_DIFFICULTIES.has(row.difficulty.trim())) errors.push(`Invalid difficulty: "${row.difficulty}"`);
  if (row.correct_index) {
    const idx = parseInt(row.correct_index, 10);
    if (isNaN(idx) || idx < 0 || idx > 3) errors.push(`correct_index must be 0-3`);
  }
  return { data: row, errors, rowIndex: index + 2 }; // +2 for 1-indexed + header
}

function buildInsertRow(row: ParsedRow, userId: string) {
  const options: string[] = [];
  if (row.option_a?.trim()) options.push(row.option_a.trim());
  if (row.option_b?.trim()) options.push(row.option_b.trim());
  if (row.option_c?.trim()) options.push(row.option_c.trim());
  if (row.option_d?.trim()) options.push(row.option_d.trim());

  const roles = row.target_roles?.trim()
    ? row.target_roles.split(',').map(r => r.trim()).filter(Boolean)
    : ['server', 'bartender'];

  return {
    question_text: row.question_text.trim(),
    correct_answer: row.correct_answer.trim(),
    question_type: row.question_type.trim(),
    options: options.length > 0 ? options : null,
    correct_index: row.correct_index ? parseInt(row.correct_index, 10) : null,
    category: row.category.trim(),
    difficulty: row.difficulty?.trim() || 'standard',
    target_roles: roles,
    is_active: true,
    created_by: userId,
  };
}

const TEMPLATE_CSV = `question_text,correct_answer,question_type,option_a,option_b,option_c,option_d,correct_index,category,difficulty,target_roles
"What grape is Sancerre made from?","Sauvignon Blanc","multiple_choice","Chardonnay","Sauvignon Blanc","Pinot Noir","Riesling",1,"wine","standard","server,bartender"
"Name three classic French mother sauces.","Béchamel, Velouté, Espagnole","short_answer","","","","",,"food","advanced","server"`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quiz_questions_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function BulkImportModal({ open, onClose, onImported }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { configs, fetchConfigs } = useTestConfigs();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [markAllRequired, setMarkAllRequired] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch configs on open
  useState(() => { if (open) fetchConfigs(); });

  const reset = () => {
    setRows([]);
    setFileName('');
    setSelectedConfigId('');
    setMarkAllRequired(false);
    setProgress(0);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const parseFile = useCallback((file: File) => {
    setFileName(file.name);
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validated = results.data.map((row, i) => validateRow(row, i));
        setRows(validated);
      },
      error: () => {
        toast({ title: 'Failed to parse CSV', variant: 'destructive' });
      },
    });
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) parseFile(file);
    else toast({ title: 'Please upload a .csv file', variant: 'destructive' });
  }, [parseFile, toast]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const validRows = rows.filter(r => r.errors.length === 0);
  const errorRows = rows.filter(r => r.errors.length > 0);
  const selectedConfig = configs.find(c => c.id === selectedConfigId);

  const handleImport = async () => {
    if (!user || validRows.length === 0) return;
    setImporting(true);
    setProgress(0);

    const insertData = validRows.map(r => buildInsertRow(r.data, user.id));

    // Batch insert in chunks of 50
    const chunkSize = 50;
    const insertedIds: string[] = [];
    const totalChunks = Math.ceil(insertData.length / chunkSize);

    for (let i = 0; i < insertData.length; i += chunkSize) {
      const chunk = insertData.slice(i, i + chunkSize);
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert(chunk)
        .select('id');

      if (error) {
        toast({ title: 'Import failed', description: error.message, variant: 'destructive' });
        setImporting(false);
        return;
      }
      if (data) insertedIds.push(...data.map(d => d.id));
      setProgress(Math.round(((i / chunkSize + 1) / totalChunks) * (selectedConfigId ? 80 : 100)));
    }

    // Assign to test config if selected
    if (selectedConfigId && insertedIds.length > 0) {
      const assignments = insertedIds.map((qId, i) => ({
        test_config_id: selectedConfigId,
        question_id: qId,
        sort_order: i,
        is_required: markAllRequired,
      }));

      const assignChunks = Math.ceil(assignments.length / chunkSize);
      for (let i = 0; i < assignments.length; i += chunkSize) {
        const chunk = assignments.slice(i, i + chunkSize);
        const { error } = await supabase
          .from('test_question_assignments')
          .insert(chunk);

        if (error) {
          toast({ title: 'Assignment failed', description: error.message, variant: 'destructive' });
          break;
        }
        setProgress(80 + Math.round(((i / chunkSize + 1) / assignChunks) * 20));
      }
    }

    setProgress(100);
    const msg = selectedConfig
      ? `${insertedIds.length} questions imported and assigned to "${selectedConfig.test_name}"`
      : `${insertedIds.length} questions imported successfully`;
    toast({ title: 'Import Complete', description: msg });
    setImporting(false);
    onImported();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Questions from File
          </DialogTitle>
        </DialogHeader>

        {/* Template download */}
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-sm text-copper hover:text-copper-light underline underline-offset-2 w-fit"
        >
          <Download className="w-3.5 h-3.5" />
          Download CSV Template
        </button>

        {/* Upload area */}
        {rows.length === 0 ? (
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-copper/50 hover:bg-muted/30 transition-colors"
          >
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drop your CSV file here or click to browse</p>
            <p className="text-xs text-muted-foreground">Accepts .csv files only</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="gap-1">
                <FileText className="w-3 h-3" /> {fileName}
              </Badge>
              <Badge className="bg-jade/15 text-jade border-jade/30 gap-1">
                <CheckCircle2 className="w-3 h-3" /> {validRows.length} valid
              </Badge>
              {errorRows.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" /> {errorRows.length} errors
                </Badge>
              )}
              <span className="text-sm text-muted-foreground ml-auto">
                {rows.length} questions parsed
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>Change file</Button>
            </div>

            {/* Preview table */}
            <div className="border rounded-lg overflow-x-auto max-h-[220px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Row</TableHead>
                    <TableHead className="min-w-[200px]">Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 10).map((r, i) => (
                    <TableRow key={i} className={r.errors.length > 0 ? 'bg-destructive/5' : ''}>
                      <TableCell className="text-xs text-muted-foreground">{r.rowIndex}</TableCell>
                      <TableCell className="text-sm max-w-[250px] truncate">
                        {r.data.question_text?.slice(0, 60) || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">{r.data.category || '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {r.data.question_type === 'multiple_choice' ? 'MC' : r.data.question_type === 'short_answer' ? 'SA' : r.data.question_type || '—'}
                      </TableCell>
                      <TableCell>
                        {r.errors.length > 0 ? (
                          <span className="text-xs text-destructive">{r.errors.join('; ')}</span>
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-jade" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {rows.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-2">
                        … and {rows.length - 10} more rows
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Assignment options */}
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <Label>Assign to Test Configuration (optional)</Label>
                <Select value={selectedConfigId} onValueChange={setSelectedConfigId}>
                  <SelectTrigger>
                    <SelectValue placeholder="None — import questions only" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None — import questions only</SelectItem>
                    {configs.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.test_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedConfigId && selectedConfigId !== 'none' && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="mark-required"
                    checked={markAllRequired}
                    onCheckedChange={v => setMarkAllRequired(v === true)}
                  />
                  <Label htmlFor="mark-required" className="text-sm">Mark all as required</Label>
                </div>
              )}
            </div>

            {/* Progress */}
            {importing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">Importing… {progress}%</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={importing}>Cancel</Button>
              <Button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="bg-copper hover:bg-copper-light text-white"
              >
                {importing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing…</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Import {validRows.length} Questions</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Column reference */}
        {rows.length === 0 && (
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-3">
            <p className="font-medium text-foreground text-sm mb-2">Expected CSV columns:</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
              <span><strong>question_text</strong> — required</span>
              <span><strong>correct_answer</strong> — required</span>
              <span><strong>question_type</strong> — "multiple_choice" or "short_answer"</span>
              <span><strong>category</strong> — wine, food, spirits, etc.</span>
              <span><strong>option_a…option_d</strong> — for MC questions</span>
              <span><strong>correct_index</strong> — 0-3 for MC</span>
              <span><strong>difficulty</strong> — basic / standard / advanced</span>
              <span><strong>target_roles</strong> — e.g. "server,bartender"</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
