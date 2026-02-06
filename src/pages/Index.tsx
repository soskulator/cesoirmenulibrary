import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  GraduationCap,
  TrendingUp,
  X,
} from "lucide-react";
import { categories, menuItems, getCategoryById } from "@/data/menuData";
import { getCategoryIcon } from "@/data/categoryIcons";
import { useDailyRotation } from "@/hooks/useDailyRotation";
import { DailyCocktailCard } from "@/components/DailyCocktailCard";
import { getDishImage } from "@/data/dishImages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { foodItems, cocktailOfTheDay, dateString } = useDailyRotation(3, 1);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);

  const trainingOptions = [
    { icon: CreditCard, title: "Flashcards", description: "Study with interactive flip cards", path: "/flashcards" },
    { icon: Layers, title: "Explore Menu", description: "Browse all categories and items", path: "/categories" },
    { icon: AlertTriangle, title: "Allergy Center", description: "Quick allergen reference", path: "/allergy" },
  ];

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.8,
      behavior: "smooth",
    });
  };

  // My Progress data
  const [progressData, setProgressData] = useState<{
    lastScore: number | null;
    lastDate: string | null;
    flashcardsStudied: number;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      setProgressData(null);
      return;
    }

    const fetchProgress = async () => {
      const [attemptsRes, studyRes] = await Promise.all([
        supabase
          .from("foh_test_attempts")
          .select("percentage, completed_at")
          .eq("user_id", user.id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false })
          .limit(1),
        supabase
          .from("study_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      const lastAttempt = attemptsRes.data?.[0];
      setProgressData({
        lastScore: lastAttempt?.percentage ?? null,
        lastDate: lastAttempt?.completed_at ?? null,
        flashcardsStudied: studyRes.count ?? 0,
      });
    };

    fetchProgress();
  }, [user]);

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

          {/* ── Hero CTAs ── */}
          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 sm:gap-4">
              <Button
                size="lg"
                className="bg-copper text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-copper-light hover:shadow-xl transition-all duration-300 group"
                onClick={() => setTrainingModalOpen(true)}
              >
                <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Start Training
              </Button>
              <Button
                size="lg"
                className="bg-charcoal text-white font-semibold px-8 py-5 text-base tracking-wide shadow-lg hover:bg-charcoal-light hover:shadow-xl transition-all duration-300"
                asChild
              >
                <Link to="/quiz">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  Take Test
                </Link>
              </Button>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="border-charcoal/30 text-charcoal hover:bg-charcoal/10 font-medium px-6 py-4"
              asChild
            >
              <Link to="/categories">
                <Layers className="w-4 h-4 mr-2" />
                Explore Menu
              </Link>
            </Button>
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
            className="grid gap-4 grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => (
              <motion.div key={feature.path} variants={fadeUp}>
                <Link to={feature.path}>
                  <Card className="group h-full border-0 bg-card/50 hover:bg-card transition-all duration-500 hover:shadow-elevated min-h-[48px]">
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

      {/* ═══════════════════ MY PROGRESS (logged-in only) ═══════════════════ */}
      {user && progressData && (
        <section className="py-14 md:py-20 bg-muted/20">
          <div className="container max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-0 shadow-elevated overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-copper/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-copper" />
                    </div>
                    <h3 className="font-serif text-xl font-semibold">My Progress</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Last Test Score</p>
                      {progressData.lastScore !== null ? (
                        <>
                          <p className="text-3xl font-serif font-bold text-copper">
                            {Math.round(progressData.lastScore)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {progressData.lastDate
                              ? new Date(progressData.lastDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })
                              : ""}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No tests taken yet</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Flashcards Studied</p>
                      <p className="text-3xl font-serif font-bold text-copper">
                        {progressData.flashcardsStudied}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">items reviewed</p>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-copper text-white hover:bg-copper-light font-semibold"
                    asChild
                  >
                    <Link to="/flashcards">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Continue Studying
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

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

      {/* ═══════════════════ TRAINING MODAL ═══════════════════ */}
      <AnimatePresence>
        {trainingModalOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTrainingModalOpen(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-background rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setTrainingModalOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-1">Start Training</h3>
                <p className="text-sm text-muted-foreground mb-5">Choose your study mode</p>
                <div className="flex flex-col gap-3">
                  {trainingOptions.map((opt) => (
                    <button
                      key={opt.path}
                      onClick={() => { setTrainingModalOpen(false); navigate(opt.path); }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-copper/30 transition-all duration-200 text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-copper/10 text-copper flex items-center justify-center group-hover:bg-copper group-hover:text-white transition-all">
                        <opt.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{opt.title}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Layout>
  );
}
