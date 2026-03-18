import { useMemo } from 'react';
import { MenuItem } from '@/data/menuData';
import { useMenuItems } from '@/hooks/useMenuItems';

/**
 * Generates a deterministic "random" selection based on a seed.
 * Uses a simple hash function to ensure the same items are selected
 * for the same date across all users.
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Simple seeded random number generator (mulberry32)
  const random = () => {
    currentSeed = (currentSeed * 1664525 + 1013904223) % 4294967296;
    return currentSeed / 4294967296;
  };
  
  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Generates a numeric seed from a date string (YYYY-MM-DD format)
 */
function dateToSeed(date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export interface DailyRotationResult {
  foodItems: MenuItem[];
  cocktailOfTheDay: MenuItem | null;
  allCocktails: MenuItem[];
  date: Date;
  dateString: string;
}

/**
 * Hook that provides deterministic daily rotation of menu items.
 * The same items will be shown to all users on the same day.
 */
export function useDailyRotation(foodCount: number = 3, cocktailCount: number = 1): DailyRotationResult {
  const { items } = useMenuItems();
  
  return useMemo(() => {
    const today = new Date();
    const seed = dateToSeed(today);
    
    // Get published items only
    const publishedItems = items.filter(item => item.isPublished);
    
    // Separate food and cocktail items
    const foodItems = publishedItems.filter(item => 
      item.categoryId !== 'cocktails' && 
      item.categoryId !== 'wine' && 
      item.categoryId !== 'spirits'
    );
    const cocktailItems = publishedItems.filter(item => item.categoryId === 'cocktails');
    
    // Shuffle with today's seed
    const shuffledFood = seededShuffle(foodItems, seed);
    const shuffledCocktails = seededShuffle(cocktailItems, seed);
    
    return {
      foodItems: shuffledFood.slice(0, foodCount),
      cocktailOfTheDay: shuffledCocktails[0] || null,
      allCocktails: shuffledCocktails,
      date: today,
      dateString: today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };
  }, [items, foodCount, cocktailCount]);
}

/**
 * Extract glassware from prepNotes (usually the first sentence mentions the glass)
 */
export function extractGlassware(prepNotes: string): string {
  if (!prepNotes) return '';
  
  // Common glass types to look for
  const glassTypes = [
    'coupe', 'martini', 'highball', 'rocks', 'old fashioned', 
    'collins', 'flute', 'wine', 'nick & nora', 'copper mug',
    'snifter', 'tumbler', 'hurricane', 'margarita'
  ];
  
  const lowerNotes = prepNotes.toLowerCase();
  
  for (const glass of glassTypes) {
    if (lowerNotes.includes(glass)) {
      // Extract the sentence containing the glass type
      const sentences = prepNotes.split(/[.!]/);
      const glassSentence = sentences.find(s => s.toLowerCase().includes(glass));
      if (glassSentence) {
        return glassSentence.trim();
      }
    }
  }
  
  // Fallback: return first sentence if it mentions "glass" or "serve"
  const firstSentence = prepNotes.split(/[.!]/)[0];
  if (firstSentence.toLowerCase().includes('glass') || firstSentence.toLowerCase().includes('serve')) {
    return firstSentence.trim();
  }
  
  return '';
}
