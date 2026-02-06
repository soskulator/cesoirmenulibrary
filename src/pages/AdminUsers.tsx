import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus, History, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStaffManagement } from '@/hooks/useStaffManagement';
import { ActiveStaffTab } from '@/components/admin/ActiveStaffTab';
import { InviteStaffTab } from '@/components/admin/InviteStaffTab';
import { RoleHistoryTab } from '@/components/admin/RoleHistoryTab';

export default function AdminUsersPage() {
  const { user, isAdmin, isLeadAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('staff');

  const {
    staff, invitations, auditLog, isLoading,
    fetchStaff, fetchInvitations, fetchAuditLog,
    changeRole, sendInvitation, resendInvitation, revokeInvitation, removeEmployee,
  } = useStaffManagement();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin');
    }
  }, [authLoading, user, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStaff();
      fetchInvitations();
      if (isLeadAdmin) fetchAuditLog();
    }
  }, [isAdmin, isLeadAdmin, fetchStaff, fetchInvitations, fetchAuditLog]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-copper" />
        </div>
      </Layout>
    );
  }

  if (!user || !isAdmin) return null;

  const handleChangeRole = async (userId: string, oldRole: any, newRole: any) => {
    const ok = await changeRole(userId, oldRole, newRole, user.id);
    if (ok) fetchStaff();
    return ok;
  };

  const handleRemove = async (userId: string, type: 'data' | 'complete') => {
    const ok = await removeEmployee(userId, type);
    if (ok) fetchStaff();
    return ok;
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
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">User Management</h1>
            <p className="text-sm text-muted-foreground">Manage team members, invitations, and roles</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/60 mb-6">
            <TabsTrigger value="staff" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Users className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Active Staff</span>
              <span className="sm:hidden">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="invite" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <UserPlus className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Invite Staff</span>
              <span className="sm:hidden">Invite</span>
            </TabsTrigger>
            {isLeadAdmin && (
              <TabsTrigger value="history" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <History className="w-4 h-4 mr-1.5 sm:mr-2" />
                <span className="hidden sm:inline">Role History</span>
                <span className="sm:hidden">History</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="staff">
            <ActiveStaffTab
              staff={staff}
              isLoading={isLoading}
              onChangeRole={handleChangeRole}
              onRemove={handleRemove}
              onRefresh={fetchStaff}
            />
          </TabsContent>

          <TabsContent value="invite">
            <InviteStaffTab
              invitations={invitations}
              onSendInvitation={sendInvitation}
              onResend={resendInvitation}
              onRevoke={revokeInvitation}
              onRefresh={fetchInvitations}
            />
          </TabsContent>

          {isLeadAdmin && (
            <TabsContent value="history">
              <RoleHistoryTab log={auditLog} isLoading={false} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}