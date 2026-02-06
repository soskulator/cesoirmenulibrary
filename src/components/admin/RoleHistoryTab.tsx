import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { History, ArrowRight, Loader2 } from 'lucide-react';
import { type RoleAuditEntry } from '@/hooks/useStaffManagement';

interface Props {
  log: RoleAuditEntry[];
  isLoading: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  lead_admin: 'Lead Admin',
  admin: 'Admin',
  server: 'Server',
  bartender: 'Bartender',
  server_assistant: 'Server Assistant',
  employee: 'Staff',
};

export function RoleHistoryTab({ log, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-copper" />
          Role Change History
        </CardTitle>
        <CardDescription>Chronological log of all role changes</CardDescription>
      </CardHeader>
      <CardContent>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No role changes recorded yet.</p>
        ) : (
          <>
            {/* Mobile layout */}
            <div className="sm:hidden space-y-3">
              {log.map(entry => (
                <div key={entry.id} className="bg-muted rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{entry.user_name}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-[10px]">
                      {entry.old_role ? ROLE_LABELS[entry.old_role] || entry.old_role : 'None'}
                    </Badge>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <Badge variant="secondary" className="text-[10px]">
                      {entry.new_role ? ROLE_LABELS[entry.new_role] || entry.new_role : 'Removed'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {entry.changed_by_name}
                    {entry.reason && ` · ${entry.reason}`}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Role Change</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {log.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleDateString()}{' '}
                        {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="font-medium">{entry.user_name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{entry.changed_by_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {entry.old_role ? ROLE_LABELS[entry.old_role] || entry.old_role : 'None'}
                          </Badge>
                          <ArrowRight className="w-3 h-3 text-muted-foreground" />
                          <Badge variant="secondary" className="text-[10px]">
                            {entry.new_role ? ROLE_LABELS[entry.new_role] || entry.new_role : 'Removed'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.reason || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}