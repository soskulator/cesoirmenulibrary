import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wine, BookOpen, ArrowRight, GlassWater, ListOrdered, Clock } from 'lucide-react';
import { MenuItem } from '@/data/menuData';
import { getDishImage } from '@/data/dishImages';
import { extractGlassware } from '@/hooks/useDailyRotation';

interface DailyCocktailCardProps {
  cocktail: MenuItem;
  dateString: string;
}

export function DailyCocktailCard({ cocktail, dateString }: DailyCocktailCardProps) {
  const image = getDishImage(cocktail.id);
  const glassware = extractGlassware(cocktail.prepNotes);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
    >
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal shadow-elevated">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Section */}
            <div className="relative h-64 md:h-auto md:min-h-[400px] overflow-hidden">
              {image ? (
                <img 
                  src={image} 
                  alt={cocktail.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-copper/20 to-burgundy/20 flex items-center justify-center">
                  <Wine className="w-24 h-24 text-copper/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
              
              {/* Daily Badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-copper text-charcoal font-semibold px-3 py-1">
                  <Wine className="w-3 h-3 mr-1" />
                  Cocktail of the Day
                </Badge>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6 md:p-8 flex flex-col justify-center text-cream">
              {/* Date */}
              <p className="text-copper text-sm font-medium mb-2">{dateString}</p>
              
              {/* Name */}
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-3">
                {cocktail.name}
              </h3>
              
              {/* Short Description */}
              <p className="text-cream/70 text-sm mb-4">
                {cocktail.shortDescription}
              </p>
              
              {/* History */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-copper" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-copper">History</span>
                </div>
                <p className="text-cream/80 text-sm leading-relaxed line-clamp-3">
                  {cocktail.longDescription}
                </p>
              </div>
              
              {/* Recipe */}
              <div className="mb-4 p-4 bg-copper/10 rounded-lg border border-copper/20">
                <div className="flex items-center gap-2 mb-2">
                  <ListOrdered className="w-4 h-4 text-copper" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-copper">Recipe</span>
                </div>
                <p className="text-cream font-medium text-sm">
                  {cocktail.ingredientsText}
                </p>
              </div>
              
              {/* Glassware */}
              {glassware && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <GlassWater className="w-4 h-4 text-copper" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-copper">Glassware</span>
                  </div>
                  <p className="text-cream/80 text-sm italic">{glassware}</p>
                </div>
              )}
              
              {/* CTA */}
              <div className="flex gap-3 mt-auto">
                <Button 
                  className="bg-copper text-charcoal hover:bg-copper-light font-semibold flex-1"
                  asChild
                >
                  <Link to="/cocktail-flashcards">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Study Cocktails
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="border-copper/40 text-copper hover:bg-copper/10 hover:text-copper"
                  asChild
                >
                  <Link to="/cocktails">
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
