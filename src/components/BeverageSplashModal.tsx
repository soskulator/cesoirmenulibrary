import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Wine, Sparkles, GlassWater } from 'lucide-react';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';

interface BeverageSplashModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'wine' | 'spirit' | 'cocktail';
}

interface ExtractedColors {
  dominant: string;
  secondary: string;
  accent: string;
}

// Extract dominant colors from an image using canvas
function extractColorsFromImage(imageSrc: string): Promise<ExtractedColors> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ dominant: '30, 25, 20', secondary: '20, 15, 10', accent: '180, 140, 100' });
        return;
      }
      
      // Scale down for faster processing
      const scale = 50 / Math.max(img.width, img.height);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Collect color samples
      const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
      
      for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        if (a < 128) continue; // Skip transparent pixels
        
        // Quantize colors to reduce buckets (divide by 32 for ~8 buckets per channel)
        const key = `${Math.floor(r / 32)}-${Math.floor(g / 32)}-${Math.floor(b / 32)}`;
        
        if (!colorBuckets[key]) {
          colorBuckets[key] = { r: 0, g: 0, b: 0, count: 0 };
        }
        
        colorBuckets[key].r += r;
        colorBuckets[key].g += g;
        colorBuckets[key].b += b;
        colorBuckets[key].count++;
      }
      
      // Sort buckets by frequency
      const sortedBuckets = Object.values(colorBuckets)
        .filter(b => b.count > 5)
        .sort((a, b) => b.count - a.count);
      
      if (sortedBuckets.length === 0) {
        resolve({ dominant: '30, 25, 20', secondary: '20, 15, 10', accent: '180, 140, 100' });
        return;
      }
      
      // Get top 3 colors
      const getAvgColor = (bucket: typeof sortedBuckets[0]) => ({
        r: Math.floor(bucket.r / bucket.count),
        g: Math.floor(bucket.g / bucket.count),
        b: Math.floor(bucket.b / bucket.count),
      });
      
      const dominant = getAvgColor(sortedBuckets[0]);
      const secondary = sortedBuckets[1] ? getAvgColor(sortedBuckets[1]) : { r: dominant.r * 0.6, g: dominant.g * 0.6, b: dominant.b * 0.6 };
      
      // Find accent color (most saturated/vibrant)
      let accentBucket = sortedBuckets[0];
      let maxSaturation = 0;
      for (const bucket of sortedBuckets.slice(0, 5)) {
        const avg = getAvgColor(bucket);
        const max = Math.max(avg.r, avg.g, avg.b);
        const min = Math.min(avg.r, avg.g, avg.b);
        const saturation = max > 0 ? (max - min) / max : 0;
        if (saturation > maxSaturation) {
          maxSaturation = saturation;
          accentBucket = bucket;
        }
      }
      const accent = getAvgColor(accentBucket);
      
      // Darken colors for background use
      const darken = (color: { r: number; g: number; b: number }, factor: number) => ({
        r: Math.floor(color.r * factor),
        g: Math.floor(color.g * factor),
        b: Math.floor(color.b * factor),
      });
      
      const darkDominant = darken(dominant, 0.25);
      const darkSecondary = darken(secondary, 0.15);
      const brightAccent = accent;
      
      resolve({
        dominant: `${darkDominant.r}, ${darkDominant.g}, ${darkDominant.b}`,
        secondary: `${darkSecondary.r}, ${darkSecondary.g}, ${darkSecondary.b}`,
        accent: `${brightAccent.r}, ${brightAccent.g}, ${brightAccent.b}`,
      });
    };
    
    img.onerror = () => {
      resolve({ dominant: '30, 25, 20', secondary: '20, 15, 10', accent: '180, 140, 100' });
    };
    
    img.src = imageSrc;
  });
}

export function BeverageSplashModal({ item, isOpen, onClose, type }: BeverageSplashModalProps) {
  const [colors, setColors] = useState<ExtractedColors | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prevItemId = useRef<string | null>(null);
  
  const image = item ? getDishImage(item.id) : null;
  
  useEffect(() => {
    if (isOpen && image && item && item.id !== prevItemId.current) {
      prevItemId.current = item.id;
      setImageLoaded(false);
      extractColorsFromImage(image).then((extractedColors) => {
        setColors(extractedColors);
      });
    }
  }, [isOpen, image, item]);
  
  if (!item) return null;

  // Fallback gradients based on type
  const fallbackGradient = type === 'wine' 
    ? 'from-[#2a1f3d] via-[#1a1525] to-[#0d0a12]'
    : type === 'cocktail'
    ? 'from-[#1a2a3d] via-[#101a25] to-[#080d12]'
    : 'from-[#2d2318] via-[#1a1510] to-[#0d0a08]';
  
  const accentColorClass = type === 'wine' 
    ? 'text-rose-300' 
    : type === 'cocktail' 
    ? 'text-cyan-300' 
    : 'text-amber-300';
    
  const glowColor = type === 'wine' 
    ? 'shadow-rose-500/20' 
    : type === 'cocktail' 
    ? 'shadow-cyan-500/20' 
    : 'shadow-amber-500/20';

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  // Dynamic accent color from extracted palette
  const dynamicAccentStyle = colors ? { color: `rgb(${colors.accent})` } : undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Content - Swipeable */}
          <motion.div
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] mx-4 rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing",
              glowColor
            )}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Dynamic Background Gradient from Image Colors */}
            {colors ? (
              <motion.div 
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                  background: `linear-gradient(180deg, 
                    rgb(${colors.dominant}) 0%, 
                    rgb(${colors.secondary}) 50%, 
                    rgb(${Math.floor(parseInt(colors.secondary.split(',')[0]) * 0.5)}, ${Math.floor(parseInt(colors.secondary.split(',')[1]) * 0.5)}, ${Math.floor(parseInt(colors.secondary.split(',')[2]) * 0.5)}) 100%
                  )`,
                }}
              />
            ) : (
              <div className={cn("absolute inset-0 bg-gradient-to-b", fallbackGradient)} />
            )}
            
            {/* Radial glow effect behind the image */}
            {colors && (
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full blur-3xl opacity-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 0.8 }}
                style={{
                  background: `radial-gradient(circle, rgba(${colors.accent}, 0.5) 0%, transparent 70%)`,
                }}
              />
            )}
            
            {/* Decorative animated orbs using extracted colors */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
                style={{
                  backgroundColor: colors ? `rgba(${colors.accent}, 0.15)` : 'rgba(180, 140, 100, 0.1)',
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl"
                style={{
                  backgroundColor: colors ? `rgba(${colors.dominant}, 0.2)` : 'rgba(180, 140, 100, 0.1)',
                }}
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>

            {/* Close Button */}
            <motion.button
              className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors border border-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Scrollable Content */}
            <div className="relative z-10 overflow-y-auto max-h-[90vh] p-6 md:p-8 pt-16">
              {/* Bottle Image with blend effect */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="relative">
                  {/* Glow Effect matching image colors */}
                  <div 
                    className="absolute inset-0 blur-2xl rounded-full scale-150"
                    style={{
                      backgroundColor: colors ? `rgba(${colors.accent}, 0.25)` : 'rgba(180, 140, 100, 0.2)',
                    }}
                  />
                  
                  {image ? (
                    <motion.img
                      src={image}
                      alt={item.name}
                      className="relative w-auto h-48 md:h-64 object-contain drop-shadow-2xl"
                      style={{
                        filter: imageLoaded ? 'drop-shadow(0 0 30px rgba(255,255,255,0.1))' : 'none',
                      }}
                      initial={{ rotateY: -15, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      onLoad={() => setImageLoaded(true)}
                    />
                  ) : (
                    <div className="relative w-32 h-48 md:h-64 flex items-center justify-center">
                      {type === 'wine' ? (
                        <Wine className="w-16 h-16 text-copper/50" />
                      ) : type === 'cocktail' ? (
                        <GlassWater className="w-16 h-16 text-copper/50" />
                      ) : (
                        <span className="text-6xl">🥃</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                className="text-center mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <h2 className="font-serif text-2xl md:text-4xl font-bold text-white mb-2">
                  {item.name}
                </h2>
                <p 
                  className={cn("text-lg font-serif italic", !colors && accentColorClass)}
                  style={dynamicAccentStyle}
                >
                  {item.shortDescription}
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="flex items-center justify-center gap-4 mb-6"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div 
                  className="h-px w-16"
                  style={{
                    background: colors 
                      ? `linear-gradient(to right, transparent, rgba(${colors.accent}, 0.5))`
                      : 'linear-gradient(to right, transparent, rgba(180, 140, 100, 0.5))',
                  }}
                />
                <Sparkles 
                  className="w-4 h-4" 
                  style={{ color: colors ? `rgb(${colors.accent})` : 'rgb(180, 140, 100)' }}
                />
                <div 
                  className="h-px w-16"
                  style={{
                    background: colors 
                      ? `linear-gradient(to left, transparent, rgba(${colors.accent}, 0.5))`
                      : 'linear-gradient(to left, transparent, rgba(180, 140, 100, 0.5))',
                  }}
                />
              </motion.div>

              {/* Description */}
              <motion.div
                className="space-y-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {/* Long Description */}
                <div>
                  <p className="text-white/80 leading-relaxed text-center md:text-lg">
                    {item.longDescription}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Origin/Ingredients */}
                  {item.ingredientsText && (
                    <motion.div
                      className="rounded-2xl p-4 backdrop-blur-sm"
                      style={{
                        backgroundColor: colors ? `rgba(${colors.dominant}, 0.4)` : 'rgba(255,255,255,0.05)',
                      }}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <h3 
                        className="text-sm font-semibold uppercase tracking-wide mb-2"
                        style={{ color: colors ? `rgb(${colors.accent})` : 'rgb(180, 140, 100)' }}
                      >
                        {type === 'wine' ? 'Origin & Grape' : type === 'cocktail' ? 'Ingredients' : 'Details'}
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {item.ingredientsText}
                      </p>
                    </motion.div>
                  )}

                  {/* Selling Points */}
                  {item.sellingPointsText && (
                    <motion.div
                      className="rounded-2xl p-4 backdrop-blur-sm"
                      style={{
                        backgroundColor: colors ? `rgba(${colors.dominant}, 0.4)` : 'rgba(255,255,255,0.05)',
                      }}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <h3 
                        className="text-sm font-semibold uppercase tracking-wide mb-2"
                        style={{ color: colors ? `rgb(${colors.accent})` : 'rgb(180, 140, 100)' }}
                      >
                        Tasting Notes
                      </h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {item.sellingPointsText}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Pairing/Prep Notes */}
                {item.prepNotes && (
                  <motion.div
                    className="rounded-2xl p-4 backdrop-blur-sm"
                    style={{
                      backgroundColor: colors ? `rgba(${colors.accent}, 0.15)` : 'rgba(180, 140, 100, 0.1)',
                    }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.4 }}
                  >
                    <h3 
                      className="text-sm font-semibold uppercase tracking-wide mb-2"
                      style={{ color: colors ? `rgb(${colors.accent})` : 'rgb(180, 140, 100)' }}
                    >
                      {type === 'wine' ? 'Pairing Suggestions' : type === 'cocktail' ? 'Bartender Notes' : 'Serving Notes'}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed italic">
                      {item.prepNotes}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Bottom Padding for scroll */}
              <div className="h-4" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
