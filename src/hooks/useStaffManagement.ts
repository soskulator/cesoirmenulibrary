import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AppRole } from '@/contexts/AuthContext';

export interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role: AppRole | null;
  last_sign_in: string | null;
  avg_quiz_score: number | null;
}

export interface StaffInvitation {
  id: string;
  email: string;
  full_name: string | null;
  invited_role: string;
  status: string;
  invitation_code: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface RoleAuditEntry {
  id: string;
  user_id: string;
  changed_by: string;
  old_role: string | null;
  new_role: string | null;
  reason: string | null;
  created_at: string;
  user_name?: string;
  changed_by_name?: string;
}

const PUBLISHED_URL = 'https://cesoirmenulibrary.lovable.app';

export function useStaffManagement() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [auditLog, setAuditLog] = useState<RoleAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const [{ data: profiles }, { data: roles }, { data: scores }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*'),
        supabase.from('quiz_scores').select('user_id, percentage'),
      ]);

      // Compute avg quiz score per user
      const scoreMap: Record<string, { sum: number; count: number }> = {};
      (scores || []).forEach(s => {
        if (!scoreMap[s.user_id]) scoreMap[s.user_id] = { sum: 0, count: 0 };
        scoreMap[s.user_id].sum += Number(s.percentage);
        scoreMap[s.user_id].count++;
      });

      const members: StaffMember[] = (profiles || []).map(p => {
        const userRole = roles?.find(r => r.user_id === p.id);
        const avg = scoreMap[p.id] ? Math.round(scoreMap[p.id].sum / scoreMap[p.id].count) : null;
        return {
          id: p.id,
          email: p.email,
          full_name: p.full_name,
          created_at: p.created_at,
          role: (userRole?.role as AppRole) ?? null,
          last_sign_in: null, // Not available from profiles
          avg_quiz_score: avg,
        };
      });

      setStaff(members);
    } catch (err) {
      console.error('Error fetching staff:', err);
      toast({ title: 'Error loading staff', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchInvitations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('staff_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setInvitations((data as StaffInvitation[]) ?? []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
    }
  }, []);

  const fetchAuditLog = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('role_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      // Enrich with profile names
      const userIds = new Set<string>();
      (data || []).forEach(e => {
        userIds.add(e.user_id);
        userIds.add(e.changed_by);
      });

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', Array.from(userIds));

      const nameMap: Record<string, string> = {};
      (profiles || []).forEach(p => {
        nameMap[p.id] = p.full_name || p.email;
      });

      const enriched: RoleAuditEntry[] = (data || []).map(e => ({
        ...e,
        user_name: nameMap[e.user_id] || 'Unknown',
        changed_by_name: nameMap[e.changed_by] || 'Unknown',
      }));

      setAuditLog(enriched);
    } catch (err) {
      console.error('Error fetching audit log:', err);
    }
  }, []);

  const changeRole = useCallback(async (
    userId: string,
    oldRole: AppRole | null,
    newRole: AppRole | 'remove',
    changedBy: string,
    reason?: string
  ) => {
    try {
      // Delete existing roles
      const { error: delError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);
      if (delError) throw delError;

      // Insert new role if not removing
      if (newRole !== 'remove') {
        const { error: insError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole } as any);
        if (insError) throw insError;
      }

      // Log to audit
      await supabase.from('role_audit_log').insert({
        user_id: userId,
        changed_by: changedBy,
        old_role: oldRole,
        new_role: newRole === 'remove' ? null : newRole,
        reason: reason || null,
      });

      toast({ title: 'Role updated successfully' });
      return true;
    } catch (err) {
      console.error('Error changing role:', err);
      toast({ title: 'Failed to update role', variant: 'destructive' });
      return false;
    }
  }, [toast]);

  const sendInvitation = useCallback(async (
    email: string,
    fullName: string | null,
    invitedRole: string,
    invitedBy: string,
    inviterName: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('staff_invitations')
        .insert({
          email: email.toLowerCase().trim(),
          full_name: fullName || null,
          invited_role: invitedRole,
          invited_by: invitedBy,
        })
        .select()
        .single();

      if (error) throw error;

      const invitation = data as StaffInvitation;
      const inviteLink = `${PUBLISHED_URL}/auth?invitation=${invitation.invitation_code}`;

      // Send email
      const { error: emailError } = await supabase.functions.invoke('send-staff-invitation', {
        body: {
          email: invitation.email,
          fullName: invitation.full_name,
          invitedRole: invitation.invited_role,
          invitationCode: invitation.invitation_code,
          inviterName,
        },
      });

      if (emailError) {
        console.error('Email send failed:', emailError);
        toast({
          title: 'Invitation created',
          description: 'Email delivery failed — share the link manually.',
        });
      } else {
        toast({
          title: 'Invitation sent!',
          description: `Invitation email sent to ${email}.`,
        });
      }

      return true;
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      toast({
        title: 'Failed to create invitation',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const resendInvitation = useCallback(async (invitation: StaffInvitation, inviterName: string) => {
    try {
      // Reset expiry
      const { error: updateError } = await supabase
        .from('staff_invitations')
        .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', invitation.id);
      if (updateError) throw updateError;

      const inviteLink = `${PUBLISHED_URL}/auth?invitation=${invitation.invitation_code}`;

      const { error: emailError } = await supabase.functions.invoke('send-staff-invitation', {
        body: {
          email: invitation.email,
          fullName: invitation.full_name,
          invitedRole: invitation.invited_role,
          invitationCode: invitation.invitation_code,
          inviterName,
        },
      });

      if (emailError) throw emailError;
      toast({ title: 'Invitation resent', description: `Email sent to ${invitation.email}.` });
      return true;
    } catch (err) {
      console.error('Error resending invitation:', err);
      toast({ title: 'Failed to resend', variant: 'destructive' });
      return false;
    }
  }, [toast]);

  const revokeInvitation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_invitations')
        .update({ status: 'revoked' })
        .eq('id', id);
      if (error) throw error;
      toast({ title: 'Invitation revoked' });
      return true;
    } catch (err) {
      console.error('Error revoking invitation:', err);
      toast({ title: 'Failed to revoke', variant: 'destructive' });
      return false;
    }
  }, [toast]);

  const removeEmployee = useCallback(async (userId: string, type: 'data' | 'complete') => {
    try {
      if (type === 'complete') {
        const { data, error } = await supabase.functions.invoke('delete-user', {
          body: { userId },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
      } else {
        await Promise.all([
          supabase.from('quiz_scores').delete().eq('user_id', userId),
          supabase.from('study_progress').delete().eq('user_id', userId),
          supabase.from('staff_activity_log').delete().eq('user_id', userId),
        ]);
      }
      toast({
        title: type === 'complete' ? 'Employee removed from system' : 'Training data cleared',
      });
      return true;
    } catch (err: any) {
      console.error('Error removing employee:', err);
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
      return false;
    }
  }, [toast]);

  return {
    staff,
    invitations,
    auditLog,
    isLoading,
    fetchStaff,
    fetchInvitations,
    fetchAuditLog,
    changeRole,
    sendInvitation,
    resendInvitation,
    revokeInvitation,
    removeEmployee,
  };
}