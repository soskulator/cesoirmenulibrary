import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search, Trash2, Shield, ShieldCheck, Loader2, Users, ArrowUpDown,
} from 'lucide-react';
import { AppRole, useAuth } from '@/contexts/AuthContext';
import { type StaffMember } from '@/hooks/useStaffManagement';

interface Props {
  staff: StaffMember[];
  isLoading: boolean;
  onChangeRole: (userId: string, oldRole: AppRole | null, newRole: AppRole | 'remove') => Promise<boolean>;
  onRemove: (userId: string, type: 'data' | 'complete') => Promise<boolean>;
  onRefresh: () => void;
}

type SortKey = 'name' | 'role' | 'score';

const ROLE_ORDER: Record<string, number> = {
  lead_admin: 0, admin: 1, server: 2, bartender: 3, server_assistant: 4, employee: 5,
};

export function ActiveStaffTab({ staff, isLoading, onChangeRole, onRemove, onRefresh }: Props) {
  const { user, isLeadAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [removing, setRemoving] = useState<StaffMember | null>(null);
  const [removeType, setRemoveType] = useState<'data' | 'complete'>('data');
  const [isRemoving, setIsRemoving] = useState(false);

  const filtered = useMemo(() => {
    let result = staff.filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        s.email.toLowerCase().includes(q) ||
        (s.full_name && s.full_name.toLowerCase().includes(q));
      const matchesRole = !roleFilter || s.role === roleFilter;
      return matchesSearch && matchesRole;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') {
        cmp = (a.full_name || a.email).localeCompare(b.full_name || b.email);
      } else if (sortBy === 'role') {
        cmp = (ROLE_ORDER[a.role || 'employee'] ?? 99) - (ROLE_ORDER[b.role || 'employee'] ?? 99);
      } else if (sortBy === 'score') {
        cmp = (a.avg_quiz_score ?? -1) - (b.avg_quiz_score ?? -1);
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [staff, search, roleFilter, sortBy, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc);
    else { setSortBy(key); setSortAsc(true); }
  };

  const handleRemove = async () => {
    if (!removing) return;
    setIsRemoving(true);
    const ok = await onRemove(removing.id, removeType);
    setIsRemoving(false);
    if (ok) {
      setRemoving(null);
      setRemoveType('data');
      onRefresh();
    }
  };

  const getRoleBadge = (role: AppRole | null) => {
    switch (role) {
      case 'lead_admin':
        return <Badge className="bg-copper text-cream"><ShieldCheck className="w-3 h-3 mr-1" />Lead Admin</Badge>;
      case 'admin':
        return <Badge className="bg-copper text-charcoal"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'server':
        return <Badge variant="secondary">Server</Badge>;
      case 'bartender':
        return <Badge variant="secondary">Bartender</Badge>;
      case 'server_assistant':
        return <Badge variant="outline">Server Assistant</Badge>;
      default:
        return <Badge variant="outline">No Role</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-copper" />
                Active Staff ({staff.length})
              </CardTitle>
              <CardDescription>Manage roles and track performance</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search name or email…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={v => setRoleFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="lead_admin">Lead Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="server">Server</SelectItem>
                  <SelectItem value="bartender">Bartender</SelectItem>
                  <SelectItem value="server_assistant">Server Assistant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {/* Mobile card layout */}
          <div className="sm:hidden space-y-3">
            {filtered.map(s => (
              <div key={s.id} className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">
                      {s.full_name || 'Unknown'}
                      {s.id === user?.id && <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                  {isLeadAdmin && s.id !== user?.id ? (
                    <div className="flex items-center gap-1">
                      <Select
                        value={s.role || 'none'}
                        onValueChange={async v => {
                          const newRole = v === 'none' ? 'remove' : v as AppRole;
                          const ok = await onChangeRole(s.id, s.role, newRole);
                          if (ok) onRefresh();
                        }}
                      >
                        <SelectTrigger className="w-[100px] h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          <SelectItem value="server">Server</SelectItem>
                          <SelectItem value="bartender">Bartender</SelectItem>
                          <SelectItem value="server_assistant">SA</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="lead_admin">Lead Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setRemoving(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : getRoleBadge(s.role)}
                </div>
                {s.avg_quiz_score !== null && (
                  <p className="text-xs text-muted-foreground">Avg Quiz: <strong>{s.avg_quiz_score}%</strong></p>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No staff match your search.</p>
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                    Name <ArrowUpDown className="inline w-3 h-3 ml-1" />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort('role')}>
                    Role <ArrowUpDown className="inline w-3 h-3 ml-1" />
                  </TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('score')}>
                    Avg Quiz <ArrowUpDown className="inline w-3 h-3 ml-1" />
                  </TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {s.full_name || 'Unknown'}
                      {s.id === user?.id && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{s.email}</TableCell>
                    <TableCell>
                      {isLeadAdmin && s.id !== user?.id ? (
                        <Select
                          value={s.role || 'none'}
                          onValueChange={async v => {
                            const newRole = v === 'none' ? 'remove' : v as AppRole;
                            const ok = await onChangeRole(s.id, s.role, newRole);
                            if (ok) onRefresh();
                          }}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Role</SelectItem>
                            <SelectItem value="server">Server</SelectItem>
                            <SelectItem value="bartender">Bartender</SelectItem>
                            <SelectItem value="server_assistant">Server Assistant</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="lead_admin">Lead Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : getRoleBadge(s.role)}
                    </TableCell>
                    <TableCell className="text-right">
                      {s.avg_quiz_score !== null ? `${s.avg_quiz_score}%` : '—'}
                    </TableCell>
                    <TableCell>
                      {isLeadAdmin && s.id !== user?.id && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setRemoving(s)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No staff match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Remove dialog */}
      <AlertDialog open={!!removing} onOpenChange={o => { if (!o) { setRemoving(null); setRemoveType('data'); } }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Employee</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Choose how to remove <strong>{removing?.full_name || removing?.email}</strong>:</p>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${removeType === 'data' ? 'border-copper bg-copper/5' : 'border-border'}`}>
                    <input type="radio" checked={removeType === 'data'} onChange={() => setRemoveType('data')} className="mt-1" />
                    <div>
                      <p className="font-medium text-sm text-foreground">Remove Training Data Only</p>
                      <p className="text-xs text-muted-foreground">Clears quiz scores, study progress, and activity logs. Account remains active.</p>
                    </div>
                  </label>
                  {isLeadAdmin && (
                    <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${removeType === 'complete' ? 'border-destructive bg-destructive/5' : 'border-border'}`}>
                      <input type="radio" checked={removeType === 'complete'} onChange={() => setRemoveType('complete')} className="mt-1" />
                      <div>
                        <p className="font-medium text-sm text-foreground">Completely Remove from System</p>
                        <p className="text-xs text-muted-foreground">Permanently deletes account, all data, and auth credentials. This cannot be undone.</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className={removeType === 'complete' ? 'bg-destructive hover:bg-destructive/90' : 'bg-copper hover:bg-copper-light'}
            >
              {isRemoving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {removeType === 'complete' ? 'Permanently Remove' : 'Clear Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}