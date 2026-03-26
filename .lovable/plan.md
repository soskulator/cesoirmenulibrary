

## Fix Swipe Gesture Logic in FlashCard and BeverageFlashCard

### Problem
1. Fast flick gestures are ignored because only offset distance is checked, not velocity
2. `dragElastic={0.1}` makes cards feel unresponsive during drag

### Changes

**Both `src/components/FlashCard.tsx` and `src/components/BeverageFlashCard.tsx`:**

1. Update constants: `SWIPE_THRESHOLD = 60`, add `VELOCITY_THRESHOLD = 400`
2. Replace `handleDragEnd` with new logic that triggers on either offset OR velocity, using a horizontal-vs-vertical classifier that also considers velocity direction
3. Change `dragElastic` from `0.1` to `0.25`

The new `handleDragEnd` logic (identical in both files):
- Determine if gesture is horizontal using both offset and velocity
- For vertical: flip if offset > 60px OR velocity > 400px/s
- For horizontal: navigate if offset > 60px OR velocity > 400px/s, using offset or velocity sign for direction

No visual, layout, or structural changes.

