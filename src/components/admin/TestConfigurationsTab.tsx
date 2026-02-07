import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Pencil, ListChecks, Loader2, Plus } from 'lucide-react';
import { useTestConfigs, DIFFICULTIES, type TestConfig } from '@/hooks/useQuizQuestions';
import { useToast } from '@/hooks/use-toast';

const SUGGESTED_TEST_TYPES = [
  { value: 'service_staff', label: 'Server & Bartender' },
  { value: 'server_assistant', label: 'Server Assistant' },
  { value: 'wine', label: 'Wine' },
  { value: 'wine_test', label: 'Wine Test' },
  { value: 'food', label: 'Food' },
  { value: 'food_test', label: 'Food Test' },
  { value: 'spirits', label: 'Spirits' },
  { value: 'spirits_test', label: 'Spirits Test' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'cocktails_test', label: 'Cocktails Test' },
  { value: 'allergy', label: 'Allergy' },
  { value: 'allergy_test', label: 'Allergy Test' },
  { value: '__custom__', label: 'Custom…' },
] as const;

interface Props {
  onManageQuestions: (config: TestConfig) => void;
}

const defaultForm = {
  test_name: '',
  test_type: '',
  total_questions: 30,
  passing_score: 70,
  time_limit_minutes: '' as string,
  is_active: true,
  difficulty_filter: [] as string[],
};

export function TestConfigurationsTab({ onManageQuestions }: Props) {
  const { configs, isLoading, fetchConfigs, createConfig, updateConfig } = useTestConfigs();
  const { toast } = useToast();
  const [editing, setEditing] = useState<TestConfig | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...defaultForm });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const openEdit = (config: TestConfig) => {
    setEditing(config);
    setCreating(false);
    setForm({
      test_name: config.test_name,
      test_type: config.test_type,
      total_questions: config.total_questions,
      passing_score: config.passing_score,
      time_limit_minutes: config.time_limit_minutes?.toString() ?? '',
      is_active: config.is_active,
      difficulty_filter: config.difficulty_filter ?? [],
    });
  };

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({ ...defaultForm });
  };

  const closeModal = () => {
    setEditing(null);
    setCreating(false);
  };

  const handleSave = async () => {
    if (!form.test_name.trim()) {
      toast({ title: 'Test name is required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const diffFilter = form.difficulty_filter.length > 0 ? form.difficulty_filter : null;

    if (editing) {
      const ok = await updateConfig(editing.id, {
        test_name: form.test_name,
        total_questions: form.total_questions,
        passing_score: form.passing_score,
        time_limit_minutes: form.time_limit_minutes ? Number(form.time_limit_minutes) : null,
        is_active: form.is_active,
        difficulty_filter: diffFilter,
      });
      if (ok) {
        toast({ title: 'Configuration updated' });
        closeModal();
      }
    } else if (creating) {
      if (!form.test_type.trim()) {
        toast({ title: 'Test type identifier is required', variant: 'destructive' });
        setIsSaving(false);
        return;
      }
      const result = await createConfig({
        test_name: form.test_name,
        test_type: form.test_type.toLowerCase().replace(/\s+/g, '_'),
        total_questions: form.total_questions,
        passing_score: form.passing_score,
        time_limit_minutes: form.time_limit_minutes ? Number(form.time_limit_minutes) : null,
        is_active: form.is_active,
        difficulty_filter: diffFilter,
      });
      if (result) {
        toast({ title: 'Test configuration created' });
        closeModal();
      }
    }
    setIsSaving(false);
  };

  const testTypeLabels: Record<string, string> = Object.fromEntries(
    SUGGESTED_TEST_TYPES.filter(t => t.value !== '__custom__').map(t => [t.value, t.label])
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isModalOpen = !!editing || creating;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{configs.length} test configuration{configs.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate} className="bg-copper hover:bg-copper-light text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create New Test
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {configs.map(config => (
          <Card key={config.id} className={`transition-all ${config.is_active ? '' : 'opacity-60'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-copper" />
                  <CardTitle className="text-base font-serif">{config.test_name}</CardTitle>
                </div>
                <Badge variant={config.is_active ? 'default' : 'secondary'} className={config.is_active ? 'bg-jade text-white' : ''}>
                  {config.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Type:</span>{' '}
                  <span className="font-medium">{testTypeLabels[config.test_type] || config.test_type}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Questions:</span>{' '}
                  <span className="font-medium">{config.total_questions}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pass:</span>{' '}
                  <span className="font-medium">{config.passing_score}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Time:</span>{' '}
                  <span className="font-medium">{config.time_limit_minutes ? `${config.time_limit_minutes} min` : 'None'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Difficulty:</span>{' '}
                  <span className="font-medium capitalize">
                    {config.difficulty_filter && config.difficulty_filter.length > 0
                      ? config.difficulty_filter.join(', ')
                      : 'All'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => openEdit(config)}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => onManageQuestions(config)} className="border-copper/30 hover:bg-copper/10 hover:text-copper">
                  <ListChecks className="w-3.5 h-3.5 mr-1.5" />
                  Manage Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={v => { if (!v) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              {creating ? 'Create Test Configuration' : 'Edit Test Configuration'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} placeholder="e.g. Wine Knowledge Test" />
            </div>
            {creating && (
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select
                  value={SUGGESTED_TEST_TYPES.some(t => t.value === form.test_type) ? form.test_type : (form.test_type ? '__custom__' : '')}
                  onValueChange={v => {
                    if (v === '__custom__') {
                      setForm(f => ({ ...f, test_type: '' }));
                    } else {
                      setForm(f => ({ ...f, test_type: v }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUGGESTED_TEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!SUGGESTED_TEST_TYPES.some(t => t.value === form.test_type) || form.test_type === '') && (
                  <Input
                    value={form.test_type}
                    onChange={e => setForm(f => ({ ...f, test_type: e.target.value }))}
                    placeholder="e.g. sommelier_advanced"
                    className="mt-2"
                  />
                )}
                <p className="text-xs text-muted-foreground">Unique key used internally (lowercase, underscores). Cannot be changed later.</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Questions</Label>
                <Input type="number" value={form.total_questions} onChange={e => setForm(f => ({ ...f, total_questions: Number(e.target.value) }))} />
              </div>
              <div className="space-y-2">
                <Label>Passing Score (%)</Label>
                <Input type="number" value={form.passing_score} onChange={e => setForm(f => ({ ...f, passing_score: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Time Limit (minutes, optional)</Label>
              <Input type="number" value={form.time_limit_minutes} onChange={e => setForm(f => ({ ...f, time_limit_minutes: e.target.value }))} placeholder="No limit" />
            </div>
            <div className="space-y-2">
              <Label>Difficulty Filter</Label>
              <p className="text-xs text-muted-foreground">Leave unchecked for all difficulties</p>
              <div className="flex gap-4">
                {DIFFICULTIES.map(d => (
                  <label key={d} className="flex items-center gap-2 capitalize cursor-pointer">
                    <Checkbox
                      checked={form.difficulty_filter.includes(d)}
                      onCheckedChange={(checked) => {
                        setForm(f => ({
                          ...f,
                          difficulty_filter: checked
                            ? [...f.difficulty_filter, d]
                            : f.difficulty_filter.filter(x => x !== d),
                        }));
                      }}
                    />
                    {d}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-copper hover:bg-copper-light text-white">
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {creating ? 'Create Test' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}