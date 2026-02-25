

# Fix Image Loading Performance

## Problem
The file `src/data/dishImages.ts` statically imports **170+ image files** at the top of the file. Since this module is imported by the homepage (via `useDailyRotation` and `getDishImage`), **every image is loaded as a Vite module on initial page load**, even though only 3-4 are displayed. The performance profile shows:
- First Contentful Paint: **5.2 seconds**
- 213 script-type resources (many are image imports processed by Vite)
- Slowest resources include spirit/drink images taking 1.4-1.6 seconds each

## Solution: Convert to Lazy Dynamic Imports

Replace all static `import` statements in `dishImages.ts` with a **URL-based approach using `new URL(..., import.meta.url).href`**. This gives Vite the asset URL without eagerly loading/processing each file as a JS module. The browser then only fetches images when they are actually rendered (via `loading="lazy"` on `<img>` tags).

## Technical Changes

### 1. Rewrite `src/data/dishImages.ts`
- Remove all 170+ `import` statements at the top
- Replace with inline URL resolution using Vite's `new URL('./path', import.meta.url).href` pattern for each entry in the `dishImages` map
- Example change:
  ```typescript
  // BEFORE
  import frenchOnionSoup from '@/assets/dishes/french-onion-soup.jpg';
  export const dishImages = { 'app-1': frenchOnionSoup, ... };

  // AFTER (no imports needed)
  const img = (path: string) => new URL(`../assets/${path}`, import.meta.url).href;
  export const dishImages: Record<string, string> = {
    'app-1': img('dishes/french-onion-soup.jpg'),
    ...
  };
  ```
- The `getDishImage`, `getUniqueImage`, `hasUniqueImage` functions and the `uniqueWineImages`/`uniqueSpiritImages` sets remain unchanged

### 2. Verify hero image optimization in `src/pages/Index.tsx`
- The hero background (`bayfront-fountain-sketch.jpg`) and logo (`cesoir-logo.png`) are already using direct imports with `fetchPriority="high"` -- these should stay as static imports since they are above-the-fold critical assets
- The food focus cards already use `loading="lazy"` -- no changes needed there

## Expected Impact
- Eliminates ~170 unnecessary JS module evaluations on page load
- FCP should drop from ~5s to under 2s
- Images will only be fetched by the browser when they scroll into view or are referenced by a visible component
- No visual changes -- all images will continue to render identically

