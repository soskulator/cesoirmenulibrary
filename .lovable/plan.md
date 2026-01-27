
# Main Page Redesign - Learning Platform Style

## Overview
Redesigning the main page (Index.tsx) to adopt the clean, modern learning platform layout shown in the reference image. The new design will feature a left sidebar navigation with a scrollable content list, while maintaining the Ce Soir brand identity.

## Design Analysis from Reference Image

**Key Layout Elements:**
- Fixed left sidebar (approximately 80px wide) with icon-based navigation
- Main content area with a list of course/content cards
- Filter tabs at the top (All, Active, Completed)
- Category filter pills (for filtering by type)
- Clean card design with thumbnail, title, description, rating, and level badge
- Optional right panel for detailed view (can be omitted for simplicity)

**Styling Observations:**
- Cream/warm white background (matches existing brand)
- Rounded corners on all elements
- Subtle shadows on cards
- Clean sans-serif typography
- Warm accent colors (orange/terracotta - matches existing copper palette)
- Star ratings and level badges on content items

---

## Implementation Plan

### Phase 1: Create New Layout Structure

**1.1 Create a Sidebar Navigation Component**
- New file: `src/components/MainSidebar.tsx`
- Icon-based navigation with labels on hover/expanded state
- Navigation items: Main, Menu, Wine, Spirits, Cocktails, Study, Tests, Allergy, Settings
- Login/Logout at the bottom
- Uses existing SidebarProvider from shadcn/ui

**1.2 Create a New Index Layout Wrapper**
- Modify `src/pages/Index.tsx` to use sidebar layout
- Replace full-screen hero with compact header
- Main content becomes a scrollable list

---

### Phase 2: Redesign Main Content Area

**2.1 Create Filter/Tab System**
- Horizontal tabs: "All", "Food", "Drinks", "Tests"
- Category filter pills below tabs (Appetizers, Entrees, Wine, Cocktails, etc.)
- Search icon in top right

**2.2 Create New Content Card Component**
- New file: `src/components/ContentCard.tsx`
- Horizontal card layout with:
  - Left: Square thumbnail image
  - Right: Title, description, category badge, star rating indicator
- Links to appropriate category/flashcard pages

**2.3 Populate Content List**
- Display menu categories and featured items
- Show daily focus items prominently
- Include quick access to study materials and tests

---

### Phase 3: Content Cards Design

**Card Structure:**
```text
+--------+----------------------------------------+
|        | Title (bold)                  [Badge] |
| Image  | Description (2 lines, muted)          |
|        | [Star Rating]        [Level Badge]    |
+--------+----------------------------------------+
```

**Content Types to Display:**
1. Menu Categories (Appetizers, Entrees, Desserts, etc.)
2. Featured Items (Daily Focus dishes)
3. Study Modes (Flashcards, Wine Quiz, Food Quiz)
4. Training Modules (FOH Test, Allergy Center)

---

### Phase 4: Mobile Responsiveness

- Sidebar collapses to bottom tab bar on mobile
- Content cards stack vertically
- Filter pills become horizontally scrollable
- Maintain touch-friendly sizing

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/MainSidebar.tsx` | Create | New sidebar navigation component |
| `src/components/ContentCard.tsx` | Create | New horizontal card component for content items |
| `src/components/ContentFilters.tsx` | Create | Tab and filter pill components |
| `src/pages/Index.tsx` | Modify | Complete redesign with new layout |
| `src/components/Layout.tsx` | Modify | Optional: Add variant for sidebar layout |

---

## Technical Considerations

**Using Existing Components:**
- SidebarProvider, Sidebar, SidebarMenu from `@/components/ui/sidebar`
- Tabs from `@/components/ui/tabs`
- Badge for category/level indicators
- Card components with custom styling
- Existing menu data from `@/data/menuData.ts`

**Brand Consistency:**
- Maintain cream background (`bg-cream`)
- Use copper accent for active states and CTAs
- Playfair Display for headings, Source Sans for body
- Existing shadow tokens for card elevation

**Performance:**
- Lazy load images in content cards
- Maintain existing image optimization patterns
- Keep hero logo for brand recognition (smaller)

---

## Visual Mockup

```text
+-------+------------------------------------------+
| LOGO  |  [All] [Food] [Drinks] [Tests]     [Q]  |
+-------+------------------------------------------+
| Main  | [Appetizers] [Entrees] [Wine] [...]     |
| Menu  |                                          |
| Wine  | +------+----------------------------+    |
|Drinks | |      | French Onion Soup   [App] |    |
|Study  | | IMG  | Oxtail broth, Gruyere...  |    |
| Test  | |      | [Stars]        [Featured] |    |
|Allergy| +------+----------------------------+    |
|-------+                                          |
|Settings +------+----------------------------+    |
| Login  | |      | Lobster Spaghetti  [Ent] |    |
+-------+------------------------------------------+
```

---

## Expected Outcome

A modern, clean training portal interface that:
- Provides quick access to all menu categories
- Displays content in scannable card format
- Maintains brand identity with warm cream/copper palette
- Improves navigation with persistent sidebar
- Feels like a professional learning management system
- Works seamlessly on mobile devices
