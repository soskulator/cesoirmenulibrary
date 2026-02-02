
# Role-Based Permissions System

This plan implements a comprehensive role-based access control (RBAC) system for the Ce Soir training portal, distinguishing between four distinct roles with tailored permissions.

---

## Role Hierarchy

```text
┌─────────────────────────────────────────────────────────────────────┐
│                           LEAD ADMIN                                 │
│   Full access to all features + exclusive management capabilities    │
├─────────────────────────────────────────────────────────────────────┤
│                              ADMIN                                   │
│   Menu management + Test review (no user management/analytics)       │
├─────────────────────────────────────────────────────────────────────┤
│                     SERVER / BARTENDER                               │
│   Full training materials + Full knowledge test                      │
├─────────────────────────────────────────────────────────────────────┤
│                       SERVER ASSISTANT                               │
│   Limited training (no beverages) + SA-specific test only            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes

### 1. Database Updates
- Expand the `app_role` enum to include: `lead_admin`, `admin`, `server`, `bartender`, `server_assistant`
- Update invitation system to support new roles
- Update RLS policies to handle new role hierarchy

### 2. Frontend Content Restrictions by Role

| Feature | Lead Admin | Admin | Server/Bartender | Server Assistant |
|---------|------------|-------|------------------|------------------|
| Wine List Page | Yes | Yes | Yes | **No** |
| Spirits Page | Yes | Yes | Yes | **No** |
| Cocktails Page | Yes | Yes | Yes | **No** |
| Wine Quiz | Yes | Yes | Yes | **No** |
| Spirits Quiz | Yes | Yes | Yes | **No** |
| Bartender/Server Test | Yes | Yes | Yes | **No** |
| Server Assistant Test | Yes | Yes | Yes | Yes |
| Flashcards (full) | Yes | Yes | Yes | **No (food only)** |
| Menu Categories | Yes | Yes | Yes | Yes |
| Daily Focus | Yes | Yes | Yes | Yes |
| Allergy Center | Yes | Yes | Yes | Yes |
| Admin Center | Yes | Yes | No | No |
| User Management | Yes | **No** | No | No |
| Staff Activity Log | Yes | **No** | No | No |
| Quiz Analytics | Yes | **No** | No | No |
| Menu Management | Yes | Yes | No | No |
| Test Review | Yes | Yes | No | No |

### 3. Navigation Updates
Hide restricted menu items based on role in Header component.

### 4. Route Protection
Add role-based protection to pages that require specific access levels.

---

## Technical Implementation Details

### Phase 1: Database Schema Updates

**Migration: Expand app_role enum**
```sql
-- Add new employee role variants to the enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'server';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'bartender';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'server_assistant';
```

**Update security functions:**
```sql
-- Create function to check if user is staff with beverage access
CREATE OR REPLACE FUNCTION public.has_beverage_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('lead_admin', 'admin', 'server', 'bartender')
  )
$$;
```

### Phase 2: AuthContext Enhancement

Update `src/contexts/AuthContext.tsx` to expose granular role information:

```typescript
// New role helpers
const roleInfo = {
  isLeadAdmin: boolean,
  isAdmin: boolean,
  isServer: boolean,
  isBartender: boolean,
  isServerAssistant: boolean,
  hasBeverageAccess: boolean,  // true for lead_admin, admin, server, bartender
  hasAdminAccess: boolean,     // true for lead_admin, admin
  canManageUsers: boolean,     // true for lead_admin only
  canViewAnalytics: boolean,   // true for lead_admin only
}
```

### Phase 3: Navigation Restrictions

Update `src/components/Header.tsx`:

- Hide "Wine", "Spirits", "Cocktails" nav items for Server Assistants
- Hide beverage-related tests in the Test dropdown for Server Assistants
- Keep Admin Center visible only for admin/lead_admin roles
- Show role-appropriate badge (Server, Bartender, SA, Admin, Lead Admin)

### Phase 4: Page-Level Route Protection

Update `src/App.tsx` with role-specific route guards:

```typescript
// Beverage pages - require beverage access
<Route path="/wine-list" element={
  <ProtectedRoute requiredRole={['lead_admin', 'admin', 'server', 'bartender']}>
    <WineList />
  </ProtectedRoute>
} />

// Admin pages with granular permissions
<Route path="/admin" element={
  <ProtectedRoute requiredRole={['admin', 'lead_admin']}>
    <Admin />
  </ProtectedRoute>
} />
```

### Phase 5: Content Filtering

**Flashcards Page (`src/pages/Flashcards.tsx`):**
- Server Assistants see only food categories (filter out wine, spirits, cocktails)

**Admin Page (`src/pages/Admin.tsx`):**
- Hide Staff Insights section (Activity Log, Quiz Performance) for regular Admins
- Show only for Lead Admins

**AdminUsers Page:**
- Keep restricted to Lead Admin only (already implemented)

### Phase 6: Invitation System Updates

Update `src/pages/AdminUsers.tsx` invite form:
- Add new role options: Server, Bartender, Server Assistant
- Keep Admin and Lead Admin options for Lead Admins only
- Show role descriptions explaining access levels

### Phase 7: Test Type Restrictions

Update `src/pages/FohTest.tsx` and test selection:
- Server Assistants can only access `server_assistant` test type
- Hide Bartender/Server test option for SAs
- Redirect SAs attempting to access `service_staff` test type

---

## Files to Modify

1. **Database Migration** - New migration file for enum expansion
2. `src/contexts/AuthContext.tsx` - Add granular role helpers
3. `src/components/Header.tsx` - Role-based navigation filtering
4. `src/App.tsx` - Enhanced route protection
5. `src/pages/Flashcards.tsx` - Filter categories for SAs
6. `src/pages/Admin.tsx` - Hide analytics for regular Admins
7. `src/pages/FohTest.tsx` - Restrict test types for SAs
8. `src/pages/AdminUsers.tsx` - Update invite role options
9. `src/pages/Quiz.tsx` - Hide beverage tests for SAs
10. `src/pages/WineList.tsx` - Add role protection
11. `src/pages/Spirits.tsx` - Add role protection
12. `src/pages/Cocktails.tsx` - Add role protection
13. `src/pages/WineQuiz.tsx` - Add role protection
14. `src/pages/SpiritsQuiz.tsx` - Add role protection

---

## Migration Path for Existing Users

Existing users with `employee` role will need to be assigned a specific role:
- Option A: Auto-migrate all `employee` to `server` (full access)
- Option B: Leave as `employee` and treat as `server` by default
- Option C: Require Lead Admin to manually update each user's role

Recommended: **Option B** - existing `employee` roles are treated as `server` for backward compatibility.
