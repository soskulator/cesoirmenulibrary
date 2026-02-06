import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  MapPin,
  BookOpen,
  Utensils,
} from "lucide-react";
import { categories, menuItems, getCategoryById } from "@/data/menuData";
import { getCategoryIcon } from "@/data/categoryIcons";
import { useDailyRotation } from "@/hooks/useDailyRotation";
import { DailyCocktailCard } from "@/components/DailyCocktailCard";
import { getDishImage } from "@/data/dishImages";
import bayfrontSketch from "@/assets/bayfront-fountain-sketch.jpg";
import logoImage from "@/assets/cesoir-logo.png";

// ─── Feature cards config ───
const features = [
  {
    icon: Layers,
    title: "Browse Menu",
    description: "Explore all categories and menu items",
    path: "/categories",
  },
  {
    icon: CreditCard,
    title: "Flashcards",
    description: "Study with interactive flip cards",
    path: "/flashcards",
  },
  {
    icon: HelpCircle,
    title: "Test Mode",
    description: "Test your knowledge",
    path: "/quiz",
  },
  {
    icon: AlertTriangle,
    title: "Allergy Check",
    description: "Quick allergen reference",
    path: "/allergy",
  },
];

// ─── Animation variants ───
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Index() {
  // Daily rotation for food + cocktail spotlight
  const { foodItems, cocktailOfTheDay, dateString } = useDailyRotation(3, 1);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <Layout>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative min-h-[85svh] flex items-center justify-center overflow-hidden bg-cream">
        {/* Background sketch */}
        <div className="absolute inset-0">
          <img
            src={bayfrontSketch}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-20"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1280}
          />
          {/* Stronger overlay for consistent text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-cream/50 via-cream/20 to-cream/60" />
        </div>

        <motion.div className="relative z-10 text-center px-6" style={{ opacity: heroOpacity }}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mb-6"
          >
            <img
              src={logoImage}
              alt="Ce Soir"
              className="h-32 md:h-36 lg:h-44 w-auto mx-auto drop-shadow-lg"
              width={530}
              height={176}
              decoding="async"
            />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-charcoal text-2xl md:text-3xl lg:text-4xl font-serif font-semibold tracking-wide mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Menu Library
          </motion.p>

          {/* Location */}
          <motion.div
            className="flex items-center justify-center gap-2 text-charcoal mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-widest uppercase">Naples, Florida</span>
          </motion.div>

          {/* ── Hero CTAs — module navigation ── */}
          <motion.div
            className="flex flex-col items-center gap-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-charcoal text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-charcoal-light hover:shadow-xl transition-all duration-300 group"
                asChild
              >
                <Link to="/flashcards">
                  <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Study Flashcards
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-copper text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-copper-light hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/categories">
                  <Layers className="w-5 h-5 mr-2" />
                  Explore Menu
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                className="border-charcoal/30 text-charcoal hover:bg-charcoal/10 font-medium px-5 py-2"
                asChild
              >
                <Link to="/quiz">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Tests
                </Link>
              </Button>
              <Button
                variant="outline"
                className="border-charcoal/30 text-charcoal hover:bg-charcoal/10 font-medium px-5 py-2"
                asChild
              >
                <Link to="/allergy">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Allergy Center
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-charcoal/40 hover:text-charcoal/80 transition-colors cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1.8 },
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
          }}
          aria-label="Scroll to content"
        >
          <ArrowDown className="w-6 h-6" />
        </motion.button>
      </section>

      {/* ═══════════════════ STAFF TRAINING PORTAL ═══════════════════ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-14"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Staff Training Portal
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Master the menu, create positive memories.</p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-5 grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div key={feature.path} variants={fadeUp}>
                <Link to={feature.path}>
                  <Card className="group h-full border-0 bg-card/50 hover:bg-card transition-all duration-500 hover:shadow-elevated">
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-copper/10 text-copper flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-copper group-hover:text-charcoal transition-all duration-500">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-lg md:text-xl font-semibold mb-2 group-hover:text-copper transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ FEATURED COCKTAIL ═══════════════════ */}
      {cocktailOfTheDay && (
        <section className="py-14 md:py-24 bg-muted/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="mb-8"
            >
              <h2 className="font-serif text-3xl font-semibold text-center mb-2">Featured Cocktail</h2>
              <p className="text-muted-foreground text-center max-w-sm mx-auto">
                Study today's spotlight — ingredients, garnish, and glassware
              </p>
            </motion.div>

            <DailyCocktailCard cocktail={cocktailOfTheDay} dateString={dateString} />
          </div>
        </section>
      )}

      {/* ═══════════════════ TODAY'S FOOD FOCUS ═══════════════════ */}
      <section className="py-14 md:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="w-5 h-5 text-copper" />
                <Badge className="bg-copper/10 text-copper border-0">
                  {new Date().toLocaleDateString("en-US", { weekday: "long" })}
                </Badge>
              </div>
              <h2 className="font-serif text-3xl font-semibold">Today's Food Focus</h2>
              <p className="text-muted-foreground text-sm mt-1">Daily rotating dishes to study</p>
            </div>
            <Button variant="ghost" className="text-copper hover:text-copper-light self-start sm:self-center" asChild>
              <Link to="/daily-focus">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {foodItems.map((menuItem) => {
              const category = getCategoryById(menuItem.categoryId);
              const image = getDishImage(menuItem.id);
              return (
                <motion.div key={menuItem.id} variants={fadeUp}>
                  <Card className="group border-0 bg-card hover:shadow-elevated transition-all duration-500 overflow-hidden">
                    {image && (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={image}
                          alt={menuItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                        <Badge className="absolute top-3 left-3 bg-copper/90 text-charcoal text-xs font-semibold">
                          {category?.name || "Menu Item"}
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-5 md:p-6">
                      <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-copper transition-colors">
                        {menuItem.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{menuItem.shortDescription}</p>
                      <p className="text-xs text-muted-foreground/70 line-clamp-2">{menuItem.ingredientsText}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ MENU CATEGORIES ═══════════════════ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10"
          >
            <div>
              <h2 className="font-serif text-3xl font-semibold">Menu Categories</h2>
              <p className="text-muted-foreground text-sm mt-1">Showing 3 of {categories.length} categories</p>
            </div>
            <Button variant="ghost" className="text-copper hover:text-copper-light self-start sm:self-center" asChild>
              <Link to="/categories">
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {categories.slice(0, 3).map((category) => {
              const itemCount = menuItems.filter((i) => i.categoryId === category.id && i.isPublished).length;
              const categoryIcon = getCategoryIcon(category.id);
              return (
                <motion.div key={category.id} variants={fadeUp}>
                  <Link to={`/categories/${category.id}`}>
                    <Card className="group border-0 bg-card/50 hover:bg-card hover:shadow-elevated transition-all duration-500 overflow-hidden relative">
                      {categoryIcon && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <img
                            src={categoryIcon}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover opacity-10 group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-500"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-br from-card/80 via-card/60 to-card/80" />
                        </div>
                      )}
                      <CardContent className="p-6 md:p-8 relative z-10">
                        <div className="flex items-center gap-5">
                          {categoryIcon ? (
                            <img
                              src={categoryIcon}
                              alt={category.name}
                              className="w-14 h-14 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                              decoding="async"
                              width={56}
                              height={56}
                            />
                          ) : (
                            <span className="text-5xl">{category.icon}</span>
                          )}
                          <div>
                            <h3 className="font-serif text-xl md:text-2xl font-semibold group-hover:text-copper transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-muted-foreground italic mb-2">{category.nameFrench}</p>
                            <Badge variant="secondary" className="bg-muted">
                              {itemCount} items
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <Card className="border-0 bg-gradient-to-r from-charcoal to-charcoal-light text-cream overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="grid gap-8 grid-cols-2 md:grid-cols-4 text-center">
                  <div>
                    <p className="text-4xl md:text-5xl font-serif font-bold text-copper">{menuItems.length}</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Menu Items</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-serif font-bold text-copper">{categories.length}</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Categories</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-serif font-bold text-copper">10+</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Allergens Tracked</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-serif font-bold text-copper">3</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Study Modes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
