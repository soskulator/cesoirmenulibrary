

## Add Live Visual Feedback to Flashcard Drag Gestures

### What changes

Three enhancements applied identically to both `FlashCard.tsx` and `BeverageFlashCard.tsx`:

### 1. Card tilt during drag

Add a `cardRotate` transform derived from the existing `x` motion value:

```ts
const cardRotate = useTransform(x, [-150, 0, 150], [-8, 0, 8]);
```

Add `rotate: cardRotate` to the outer `motion.div` style prop (alongside existing `x, y, rotateX, rotateY`).

### 2. Directional edge glow overlays

Add two opacity transforms:

```ts
const rightGlow = useTransform(x, [0, 100], [0, 0.25]);
const leftGlow = useTransform(x, [-100, 0], [0.25, 0]);
```

Insert two `motion.div` elements inside the **front face** container (as last children, absolutely positioned, pointer-events-none):

- Right glow: `absolute inset-y-0 right-0 w-16 bg-copper rounded-r-xl pointer-events-none` with `style={{ opacity: rightGlow }}`
- Left glow: `absolute inset-y-0 left-0 w-16 bg-muted rounded-l-xl pointer-events-none` with `style={{ opacity: leftGlow }}`

For BeverageFlashCard, use `rounded-r-2xl` / `rounded-l-2xl` to match its `rounded-2xl` card corners.

### 3. Replace static swipe hint text with pill hints

**FlashCard.tsx** (lines 125-127): Replace the `<p>Swipe up to flip • Left/right to navigate</p>` with:

```tsx
<div className="flex items-center justify-center gap-3 mb-1">
  <span className="text-[9px] uppercase tracking-widest text-cream/50">← prev</span>
  <span className="text-[9px] uppercase tracking-widest text-cream/50">↕ flip</span>
  <span className="text-[9px] uppercase tracking-widest text-cream/50">next →</span>
</div>
```

**BeverageFlashCard.tsx** (lines 165-167): Replace the `<p>Swipe up to flip</p>` with the same three-pill pattern using `text-cream/40` to match existing styling.

### Files modified

- `src/components/FlashCard.tsx`
- `src/components/BeverageFlashCard.tsx`

No other files affected. No structural or layout changes beyond the above.

