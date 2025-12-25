import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { menuItems } from '@/data/menuData';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Trash2, 
  Shield, 
  ShieldCheck,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: AppRole | null;
}

interface Invitation {
  id: string;
  email: string;
  role: AppRole;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

interface StudyProgress {
  user_id: string;
  known_count: number;
  total_studied: number;
}

export default function AdminUsersPage() {
  const { user, isAdmin, isLeadAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [studyProgress, setStudyProgress] = useState<Record<string, StudyProgress>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('employee');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const totalMenuItems = menuItems.filter(i => i.isPublished).length;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && !isAdmin) {
      navigate('/');
      toast({
        title: 'Access Denied',
        description: 'You need admin permissions to access this page.',
        variant: 'destructive',
      });
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    
    try {
      // Fetch profiles and roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        role: roles?.find(r => r.user_id === profile.id)?.role as AppRole | null || null,
      }));

      setUsers(usersWithRoles);

      // Fetch invitations
      const { data: invites, error: invitesError } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (invitesError) throw invitesError;
      setInvitations(invites || []);

      // Fetch study progress for all users
      const { data: progress, error: progressError } = await supabase
        .from('study_progress')
        .select('*');
      
      if (progressError) throw progressError;

      // Aggregate progress by user
      const progressMap: Record<string, StudyProgress> = {};
      (progress || []).forEach(p => {
        if (!progressMap[p.user_id]) {
          progressMap[p.user_id] = { user_id: p.user_id, known_count: 0, total_studied: 0 };
        }
        progressMap[p.user_id].total_studied++;
        if (p.is_known) {
          progressMap[p.user_id].known_count++;
        }
      });
      setStudyProgress(progressMap);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsSendingInvite(true);
    
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          email: inviteEmail.toLowerCase().trim(),
          role: inviteRole,
          invited_by: user!.id,
        });
      
      if (error) {
        if (error.message.includes('duplicate')) {
          toast({
            title: 'Already Invited',
            description: 'This email has already been invited.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Invitation Created',
          description: `Invitation link created for ${inviteEmail}. Share the link with them to complete signup.`,
        });
        setInviteEmail('');
        setInviteRole('employee');
        setInviteDialogOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invitation.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  const deleteInvitation = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('invitations')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
      
      toast({
        title: 'Invitation Deleted',
        description: 'The invitation has been removed.',
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete invitation.',
        variant: 'destructive',
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: AppRole | 'remove') => {
    if (!isLeadAdmin) {
      toast({
        title: 'Permission Denied',
        description: 'Only the lead admin can change roles.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (newRole === 'remove') {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
      } else {
        // Upsert the role
        const { error } = await supabase
          .from('user_roles')
          .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id,role' });
        
        if (error) throw error;
      }
      
      toast({
        title: 'Role Updated',
        description: 'User role has been updated successfully.',
      });
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role.',
        variant: 'destructive',
      });
    }
  };

  const getInviteLink = (token: string) => {
    return `${window.location.origin}/auth?token=${token}`;
  };

  const copyInviteLink = (token: string) => {
    navigator.clipboard.writeText(getInviteLink(token));
    toast({
      title: 'Link Copied',
      description: 'Invitation link copied to clipboard.',
    });
  };

  const getRoleBadge = (role: AppRole | null) => {
    switch (role) {
      case 'lead_admin':
        return <Badge className="bg-burgundy text-cream"><ShieldCheck className="w-3 h-3 mr-1" />Lead Admin</Badge>;
      case 'admin':
        return <Badge className="bg-copper text-charcoal"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'employee':
        return <Badge variant="secondary">Employee</Badge>;
      default:
        return <Badge variant="outline">No Role</Badge>;
    }
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-16 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-copper" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 sm:py-8 max-w-6xl px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Link>
            </Button>
            <div className="w-10 h-10 rounded-lg bg-copper/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-copper" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground text-sm">
                Manage team members and track progress
              </p>
            </div>
          </div>

          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-copper text-charcoal hover:bg-copper-light">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join the staff training portal.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="employee@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {isLeadAdmin && <SelectItem value="lead_admin">Lead Admin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={sendInvitation} disabled={isSendingInvite || !inviteEmail.trim()}>
                  {isSendingInvite ? 'Creating...' : 'Create Invitation'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Invitations */}
        {invitations.filter(i => !i.accepted_at).length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-copper" />
                Pending Invitations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.filter(i => !i.accepted_at).map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{invite.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(invite.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getRoleBadge(invite.role)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyInviteLink(invite.id)}
                      >
                        Copy Link
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteInvitation(invite.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-copper" />
              Team Progress
            </CardTitle>
            <CardDescription>
              Track study progress for each team member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Study Progress</TableHead>
                    <TableHead className="text-right">Mastered</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const progress = studyProgress[u.id];
                    const progressPercent = progress 
                      ? Math.round((progress.known_count / totalMenuItems) * 100)
                      : 0;
                    
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.full_name || 'Unknown'}
                          {u.id === user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {u.email}
                        </TableCell>
                        <TableCell>
                          {isLeadAdmin && u.id !== user?.id ? (
                            <Select 
                              value={u.role || 'none'} 
                              onValueChange={(v) => updateUserRole(u.id, v === 'none' ? 'remove' : v as AppRole)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">No Role</SelectItem>
                                <SelectItem value="employee">Employee</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="lead_admin">Lead Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            getRoleBadge(u.role)
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <Progress value={progressPercent} className="flex-1 h-2" />
                            <span className="text-sm text-muted-foreground w-12 text-right">
                              {progressPercent}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">
                            {progress?.known_count || 0}
                          </span>
                          <span className="text-muted-foreground">
                            /{totalMenuItems}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
