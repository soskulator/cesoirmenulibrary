import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Mail, UserPlus, RefreshCw, XCircle, Clock, Loader2, Send,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { type StaffInvitation } from '@/hooks/useStaffManagement';

interface Props {
  invitations: StaffInvitation[];
  onSendInvitation: (email: string, fullName: string | null, role: string, invitedBy: string, inviterName: string) => Promise<boolean>;
  onResend: (invitation: StaffInvitation, inviterName: string) => Promise<boolean>;
  onRevoke: (id: string) => Promise<boolean>;
  onRefresh: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  server: 'Server',
  bartender: 'Bartender',
  server_assistant: 'Server Assistant',
  admin: 'Admin',
  lead_admin: 'Lead Admin',
  employee: 'Staff',
};

export function InviteStaffTab({ invitations, onSendInvitation, onResend, onRevoke, onRefresh }: Props) {
  const { user, isLeadAdmin, fullName } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('server');
  const [isSending, setIsSending] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!email.trim() || !user) return;
    setIsSending(true);
    const ok = await onSendInvitation(email, name || null, role, user.id, fullName || 'Admin');
    setIsSending(false);
    if (ok) {
      setEmail('');
      setName('');
      setRole('server');
      onRefresh();
    }
  };

  const handleResend = async (inv: StaffInvitation) => {
    setResendingId(inv.id);
    const ok = await onResend(inv, fullName || 'Admin');
    setResendingId(null);
    if (ok) onRefresh();
  };

  const handleRevoke = async (id: string) => {
    const ok = await onRevoke(id);
    if (ok) onRefresh();
  };

  const pendingInvitations = useMemo(
    () => invitations.filter(i => i.status === 'pending'),
    [invitations]
  );

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-copper" />
            Send Invitation
          </CardTitle>
          <CardDescription>Invite a new team member to join the training platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="employee@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="Jane Smith"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="server">Server (Full Access)</SelectItem>
                <SelectItem value="bartender">Bartender (Full Access)</SelectItem>
                <SelectItem value="server_assistant">Server Assistant (Limited)</SelectItem>
                {isLeadAdmin && <SelectItem value="admin">Admin</SelectItem>}
                {isLeadAdmin && <SelectItem value="lead_admin">Lead Admin</SelectItem>}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {role === 'server' && 'Full access to all training materials and tests'}
              {role === 'bartender' && 'Full access to all training materials and tests'}
              {role === 'server_assistant' && 'Food training only — no wine/spirits/cocktails access'}
              {role === 'admin' && 'Can manage menu and review tests'}
              {role === 'lead_admin' && 'Full access including user management and analytics'}
            </p>
          </div>
          <Button
            onClick={handleSend}
            disabled={isSending || !email.trim()}
            className="bg-copper hover:bg-copper-light text-white"
          >
            {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Invitation
          </Button>
        </CardContent>
      </Card>

      {/* Pending invitations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-copper" />
            Pending Invitations ({pendingInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending invitations</p>
          ) : (
            <div className="space-y-3">
              {pendingInvitations.map(inv => {
                const expired = isExpired(inv.expires_at);
                return (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{inv.email}</p>
                        {inv.full_name && <span className="text-xs text-muted-foreground">({inv.full_name})</span>}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <Badge variant="secondary" className="text-[10px] capitalize">{ROLE_LABELS[inv.invited_role] || inv.invited_role}</Badge>
                        <span className="text-xs text-muted-foreground">
                          Sent {new Date(inv.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                          Expires {new Date(inv.expires_at).toLocaleDateString()}
                        </span>
                        {expired && <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">Expired</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleResend(inv)}
                        disabled={resendingId === inv.id}
                      >
                        {resendingId === inv.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        )}
                        Resend
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleRevoke(inv.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}