import { useState, useEffect } from 'react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Brain, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QuestionBankTab } from '@/components/admin/QuestionBankTab';
import { TestConfigurationsTab } from '@/components/admin/TestConfigurationsTab';
import { AssignQuestionsTab } from '@/components/admin/AssignQuestionsTab';
import { FohDiagnosticsPanel } from '@/components/admin/FohDiagnosticsPanel';
import { type TestConfig } from '@/hooks/useQuizQuestions';

export default function QuizBuilder() {
  usePageTitle("Quiz Builder");
  const { user, isLeadAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('questions');
  const [assignConfig, setAssignConfig] = useState<TestConfig | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isLeadAdmin)) {
      navigate('/admin');
    }
  }, [authLoading, user, isLeadAdmin, navigate]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 px-4 max-w-6xl">
          <p className="text-muted-foreground">Checking permissions…</p>
        </div>
      </Layout>
    );
  }

  if (!user || !isLeadAdmin) return null;

  const handleManageQuestions = (config: TestConfig) => {
    setAssignConfig(config);
    setActiveTab('assign');
  };

  return (
    <Layout>
      <div className="py-6 sm:py-8 px-4 max-w-6xl mx-auto w-full overflow-x-hidden">
        {/* Back link */}
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-copper to-copper-light flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Quiz & Test Builder</h1>
            <p className="text-sm text-muted-foreground">Manage questions, configure tests, and control what staff see</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); if (v !== 'assign') setAssignConfig(null); }}>
          <TabsList className="bg-muted/60 mb-6">
            <TabsTrigger value="questions" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Question Bank
            </TabsTrigger>
            <TabsTrigger value="configs" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Test Configurations
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Diagnostics
            </TabsTrigger>
            {assignConfig && (
              <TabsTrigger value="assign" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Assign Questions
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="questions">
            <QuestionBankTab />
          </TabsContent>

          <TabsContent value="configs">
            <TestConfigurationsTab onManageQuestions={handleManageQuestions} />
          </TabsContent>

          <TabsContent value="diagnostics">
            <FohDiagnosticsPanel />
          </TabsContent>

          {assignConfig && (
            <TabsContent value="assign">
              <AssignQuestionsTab
                config={assignConfig}
                onBack={() => { setAssignConfig(null); setActiveTab('configs'); }}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}
