import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Pencil, ListChecks, Loader2 } from 'lucide-react';
import { useTestConfigs, type TestConfig } from '@/hooks/useQuizQuestions';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onManageQuestions: (config: TestConfig) => void;
}

export function TestConfigurationsTab({ onManageQuestions }: Props) {
  const { configs, isLoading, fetchConfigs, updateConfig } = useTestConfigs();
  const { toast } = useToast();
  const [editing, setEditing] = useState<TestConfig | null>(null);
  const [form, setForm] = useState({ test_name: '', total_questions: 30, passing_score: 70, time_limit_minutes: '' as string, is_active: true });

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const openEdit = (config: TestConfig) => {
    setEditing(config);
    setForm({
      test_name: config.test_name,
      total_questions: config.total_questions,
      passing_score: config.passing_score,
      time_limit_minutes: config.time_limit_minutes?.toString() ?? '',
      is_active: config.is_active,
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    const ok = await updateConfig(editing.id, {
      test_name: form.test_name,
      total_questions: form.total_questions,
      passing_score: form.passing_score,
      time_limit_minutes: form.time_limit_minutes ? Number(form.time_limit_minutes) : null,
      is_active: form.is_active,
    });
    if (ok) {
      toast({ title: 'Configuration updated' });
      setEditing(null);
    }
  };

  const testTypeLabels: Record<string, string> = {
    service_staff: 'Server & Bartender',
    server_assistant: 'Server Assistant',
    wine: 'Wine',
    food: 'Food',
    spirits: 'Spirits',
    cocktails: 'Cocktails',
    allergy: 'Allergy',
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{configs.length} test configuration{configs.length !== 1 ? 's' : ''}</p>

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

      {/* Edit Modal */}
      <Dialog open={!!editing} onOpenChange={v => { if (!v) setEditing(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit Test Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Test Name</Label>
              <Input value={form.test_name} onChange={e => setForm(f => ({ ...f, test_name: e.target.value }))} />
            </div>
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
            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <Label>Active</Label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-copper hover:bg-copper-light text-white">Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
