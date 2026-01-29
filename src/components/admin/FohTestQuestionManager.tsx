import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFohTestQuestions, DbFohTestQuestion } from '@/hooks/useFohTestQuestions';
import { getCategoryLabel, getCategoryColor, TestType, getTestTypeLabel } from '@/data/fohTestData';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  RefreshCw,
  Users,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionFormData {
  question: string;
  type: 'multiple_choice' | 'short_answer';
  options: string[];
  correct_answer: string;
  correct_index: number | null;
  category: 'service' | 'menu' | 'drinks' | 'operations' | 'general';
  test_type: TestType;
  is_active: boolean;
}

const defaultFormData: QuestionFormData = {
  question: '',
  type: 'short_answer',
  options: ['', '', '', ''],
  correct_answer: '',
  correct_index: null,
  category: 'general',
  test_type: 'service_staff',
  is_active: true,
};

export function FohTestQuestionManager() {
  const [activeTab, setActiveTab] = useState<TestType>('service_staff');
  const {
    questions,
    isLoading,
    isInitialized,
    initializeFromStatic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useFohTestQuestions();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<DbFohTestQuestion | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(defaultFormData);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Filter questions by test type and search
  const filteredQuestions = questions.filter(q => {
    const matchesTestType = q.test_type === activeTab;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.correct_answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || q.category === categoryFilter;
    return matchesTestType && matchesSearch && matchesCategory;
  });

  const serviceStaffCount = questions.filter(q => q.test_type === 'service_staff').length;
  const serverAssistantCount = questions.filter(q => q.test_type === 'server_assistant').length;

  const openAddDialog = () => {
    setEditingQuestion(null);
    setFormData({ ...defaultFormData, test_type: activeTab });
    setIsDialogOpen(true);
  };

  const openEditDialog = (question: DbFohTestQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      type: question.type,
      options: question.options.length > 0 ? [...question.options] : ['', '', '', ''],
      correct_answer: question.correct_answer,
      correct_index: question.correct_index,
      category: question.category,
      test_type: question.test_type,
      is_active: question.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.correct_answer.trim()) return;

    setIsSaving(true);

    const questionData = {
      question: formData.question,
      type: formData.type,
      options: formData.type === 'multiple_choice' ? formData.options.filter(o => o.trim()) : [],
      correct_answer: formData.correct_answer,
      correct_index: formData.type === 'multiple_choice' ? formData.correct_index : null,
      category: formData.category,
      test_type: formData.test_type,
      is_active: formData.is_active,
    };

    let success = false;
    if (editingQuestion) {
      success = await updateQuestion(editingQuestion.id, questionData);
    } else {
      success = await addQuestion(questionData);
    }

    if (success) {
      setIsDialogOpen(false);
      setFormData(defaultFormData);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteQuestion(id);
    setDeletingId(null);
  };

  const handleInitialize = async (testType?: TestType) => {
    setIsInitializing(true);
    await initializeFromStatic(testType);
    setIsInitializing(false);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <Card className="bg-card shadow-card h-full overflow-hidden">
      <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-burgundy/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-burgundy" />
          </div>
          <div className="flex items-center gap-2">
            {!isInitialized && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleInitialize()}
                disabled={isLoading || isInitializing}
                className="text-xs sm:text-sm"
              >
                {isInitializing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                )}
                Sync All
              </Button>
            )}
            <Button 
              size="sm" 
              className="bg-burgundy hover:bg-burgundy/90 text-white text-xs sm:text-sm"
              onClick={openAddDialog}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        <CardTitle className="font-serif text-lg sm:text-xl">FoH Test Questions</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {isInitialized ? (
            <span className="text-jade">✓ {questions.length} questions in database</span>
          ) : (
            'Click "Sync All" to initialize both tests'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {/* Test Type Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TestType)} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="service_staff" className="text-xs sm:text-sm gap-1">
              <Users className="w-3.5 h-3.5" />
              Service ({serviceStaffCount})
            </TabsTrigger>
            <TabsTrigger value="server_assistant" className="text-xs sm:text-sm gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              SA ({serverAssistantCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="menu">Menu</SelectItem>
              <SelectItem value="drinks">Drinks</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Questions List */}
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2 pr-3">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  className={cn(
                    "p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors",
                    !q.is_active && "opacity-50"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn(getCategoryColor(q.category), "text-[10px]")}>
                          {getCategoryLabel(q.category).split(' ')[0]}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {q.type === 'multiple_choice' ? 'MC' : 'SA'}
                        </Badge>
                        {!q.is_active && (
                          <Badge variant="secondary" className="text-[10px]">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        Answer: {q.correct_answer}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8"
                        onClick={() => openEditDialog(q)}
                      >
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive"
                        disabled={deletingId === q.id}
                        onClick={() => handleDelete(q.id)}
                      >
                        {deletingId === q.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredQuestions.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm mb-3">
                    No questions found for {getTestTypeLabel(activeTab)}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleInitialize(activeTab)}
                    disabled={isInitializing}
                  >
                    {isInitializing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    )}
                    Initialize {activeTab === 'service_staff' ? 'Service' : 'SA'} Questions
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          {filteredQuestions.length} of {questions.filter(q => q.test_type === activeTab).length} questions
        </p>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="Enter the question..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Test Type</Label>
                <Select 
                  value={formData.test_type} 
                  onValueChange={(v: TestType) => setFormData({ ...formData, test_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service_staff">Service Staff</SelectItem>
                    <SelectItem value="server_assistant">Server Assistant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v: 'multiple_choice' | 'short_answer') => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short_answer">Short Answer</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v: typeof formData.category) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="menu">Menu</SelectItem>
                  <SelectItem value="drinks">Drinks</SelectItem>
                  <SelectItem value="operations">Operations</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'multiple_choice' && (
              <div className="space-y-2">
                <Label>Options (select the correct one)</Label>
                {formData.options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correct_index === idx}
                      onChange={() => setFormData({ 
                        ...formData, 
                        correct_index: idx,
                        correct_answer: formData.options[idx]
                      })}
                      className="w-4 h-4"
                    />
                    <Input
                      value={option}
                      onChange={(e) => {
                        updateOption(idx, e.target.value);
                        if (formData.correct_index === idx) {
                          setFormData(prev => ({ ...prev, correct_answer: e.target.value }));
                        }
                      }}
                      placeholder={`Option ${idx + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            )}

            {formData.type === 'short_answer' && (
              <div className="space-y-2">
                <Label>Correct Answer</Label>
                <Textarea
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  placeholder="Enter the correct answer..."
                  rows={2}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Active (shown in tests)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.question.trim() || !formData.correct_answer.trim()}
              className="bg-burgundy hover:bg-burgundy/90"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingQuestion ? 'Update' : 'Add'} Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
