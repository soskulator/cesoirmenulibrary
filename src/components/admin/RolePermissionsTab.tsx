import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useRolePermissions, PERMISSION_LABELS, CONFIGURABLE_ROLES, ROLE_LABELS } from '@/hooks/useRolePermissions';

export function RolePermissionsTab() {
  const { permissions, isLoading, fetchPermissions, togglePermission } = useRolePermissions();

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  if (isLoading && permissions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-copper" />
      </div>
    );
  }

  // Group permission keys by group
  const groups: Record<string, string[]> = {};
  Object.entries(PERMISSION_LABELS).forEach(([key, { group }]) => {
    if (!groups[group]) groups[group] = [];
    groups[group].push(key);
  });

  const getPermissionValue = (role: string, key: string): boolean => {
    const perm = permissions.find(p => p.role === role && p.permission_key === key);
    return perm?.is_enabled ?? true;
  };

  const handleToggle = async (role: string, key: string, current: boolean) => {
    await togglePermission(role, key, !current);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4" />
        <span>Admins and Lead Admins always have full access to all sections.</span>
      </div>

      {Object.entries(groups).map(([groupName, keys]) => (
        <Card key={groupName}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">{groupName}</CardTitle>
            <CardDescription>Control which {groupName.toLowerCase()} each role can access</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Header row */}
            <div className="grid gap-2" style={{ gridTemplateColumns: `1fr repeat(${CONFIGURABLE_ROLES.length}, 100px)` }}>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b">
                Permission
              </div>
              {CONFIGURABLE_ROLES.map(role => (
                <div key={role} className="text-xs font-medium text-center text-muted-foreground uppercase tracking-wider pb-2 border-b">
                  {ROLE_LABELS[role]}
                </div>
              ))}

              {/* Permission rows */}
              {keys.map(key => (
                <>
                  <div key={`label-${key}`} className="flex items-center py-2.5 text-sm font-medium">
                    {PERMISSION_LABELS[key].label}
                  </div>
                  {CONFIGURABLE_ROLES.map(role => {
                    const enabled = getPermissionValue(role, key);
                    return (
                      <div key={`${role}-${key}`} className="flex items-center justify-center py-2.5">
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => handleToggle(role, key, enabled)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            New permission keys will appear here automatically when you add new test types or content sections.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
