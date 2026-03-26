import { useState, useEffect } from "react";
import { usePageTitle } from '@/hooks/usePageTitle';
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, CreditCard, HelpCircle, AlertTriangle, ArrowRight, ArrowDown, MapPin, BookOpen, Utensils, GraduationCap, TrendingUp, Brain, LogIn } from "lucide-react";
import { getCategoryById } from "@/data/menuTypes";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useCategories } from "@/hooks/useCategories";
import { useDailyRotation } from "@/hooks/useDailyRotation";
import { DailyCocktailCard } from "@/components/DailyCocktailCard";
import { getDishImage } from "@/data/dishImages";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import bayfrontSketch from "@/assets/bayfront-fountain-sketch.jpg";
import logoImage from "@/assets/cesoir-logo.png";

// ─── Feature cards config ───
const features = [{
  icon: Layers,
  title: "Browse Menu",
  description: "Explore all categories and menu items",
  path: "/categories"
}, {
  icon: CreditCard,
  title: "Flashcards",
  description: "Study with interactive flip cards",
  path: "/flashcards"
}, {
  icon: HelpCircle,
  title: "Test Mode",
  description: "Test your knowledge",
  path: "/quiz"
}, {
  icon: AlertTriangle,
  title: "Allergy Check",
  description: "Quick allergen reference",
  path: "/allergy"
}];

// ─── Animation variants ───
const staggerContainer = {
  hidden: {
    opacity: 0
  },
  show: {
    opacity: 1,
    transition: {
  staggerChildren: 0.03,
      delayChildren: 0.05
    }
  }
};
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 24
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
    duration: 0.2,
      ease: "easeOut" as const
    }
  }
};

// Shared viewport config — triggers as soon as ANY part is visible
const vp = { once: true, amount: 0 as const, margin: "50px" };
export default function Index() {
  usePageTitle("");
  const {
    user
  } = useAuth();
  const {
    foodItems,
    cocktailOfTheDay,
    dateString
  } = useDailyRotation(3, 1);

  const { items: menuItems } = useMenuItems();
  const { categories } = useCategories();

  // Unique allergen count
  const uniqueAllergenCount = new Set(menuItems.flatMap((item) => item.allergens)).size;

  // Active tests count
  const [activeTestCount, setActiveTestCount] = useState(3);
  useEffect(() => {
    supabase.from("test_configurations").select("id", {
      count: "exact",
      head: true
    }).eq("is_active", true).then(({
      count
    }) => {
      if (count != null) setActiveTestCount(count);
    });
  }, []);
  const {
    scrollY
  } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0]);
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight * 0.8,
      behavior: "smooth"
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
      const [attemptsRes, studyRes, quizScoresRes] = await Promise.all([
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
        supabase
          .from("quiz_scores")
          .select("quiz_type, percentage, completed_at")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(20),
      ]);

      const lastAttempt = attemptsRes.data?.[0];

      const quizScores = quizScoresRes.data ?? [];
      const bestPractice = quizScores.reduce<number | null>(
        (best, row) =>
          best === null || row.percentage > best ? row.percentage : best,
        null
      );

      const displayScore = lastAttempt?.percentage ?? bestPractice ?? null;
      const displayDate = lastAttempt?.completed_at ?? quizScores[0]?.completed_at ?? null;

      setProgressData({
        lastScore: displayScore,
        lastDate: displayDate,
        flashcardsStudied: studyRes.count ?? 0,
      });
    };
    fetchProgress();
  }, [user]);
  return <Layout>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative flex items-center justify-center overflow-hidden bg-cream" style={{
      minHeight: 'max(85vh, 85svh)'
    }}>
        {/* Background sketch */}
        <div className="absolute inset-0">
          <img src={bayfrontSketch} alt="" aria-hidden="true" className="w-full h-full object-cover opacity-20" loading="eager" decoding="async" width={1920} height={1280} />
          <div className="absolute inset-0 bg-gradient-to-b from-cream/50 via-cream/20 to-cream/60" />
        </div>

        <motion.div className="relative z-10 flex flex-col items-center text-center px-6 py-10 md:py-16 -mt-6 md:mt-0" style={{
        opacity: heroOpacity
      }}>
          {/* Logo */}
          <motion.div initial={{
          opacity: 0,
          scale: 0.92
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.9,
          delay: 0.2
        }} className="mb-0 mt-4">
            <img src={logoImage} alt="Ce Soir" className="h-[16rem] md:h-[22rem] lg:h-[26rem] w-auto mx-auto drop-shadow-lg" width={530} height={466} decoding="async" />
          </motion.div>

          {/* Subtitle */}
          <motion.p className="text-charcoal text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-normal mb-1.5 -mt-14 md:-mt-20 lg:-mt-24" initial={{
          opacity: 0,
          y: 16
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.5,
          duration: 0.6
        }}>
            Menu Library
          </motion.p>

          {/* Decorative divider */}
          <motion.div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-copper to-transparent mb-1" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.6,
          duration: 0.5
        }} />

          {/* Location */}
          <motion.div className="flex items-center justify-center gap-2 text-copper-dark mb-6" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.7,
          duration: 0.5
        }}>
            <MapPin className="w-3.5 h-3.5 text-copper" />
            <span className="text-xs tracking-[0.2em] uppercase font-semibold" style={{
            fontFamily: "'DM Sans', sans-serif"
          }}>Naples, Florida</span>
          </motion.div>

          {/* ── Hero CTAs ── */}
          <motion.div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-md" initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.9,
          duration: 0.6
        }}>
            {user ? <>
                <Button size="lg" className="w-full bg-gradient-to-br from-copper to-copper-dark text-white font-semibold py-3.5 px-6 text-sm tracking-wide shadow-[0_4px_20px_rgba(184,115,58,0.3)] hover:shadow-[0_6px_28px_rgba(184,115,58,0.4)] hover:brightness-110 transition-all duration-300" asChild>
                  <Link to="/quiz">
                    <Brain className="w-4 h-4 mr-2" />
                    Go to Training
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full border-copper text-copper-dark font-semibold py-3.5 px-6 text-sm tracking-wide bg-white shadow-sm hover:bg-copper hover:text-white transition-all duration-300" asChild>
                  <Link to="/categories">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Menu
                  </Link>
                </Button>
              </> : <>
                <Button size="lg" className="w-full bg-gradient-to-br from-copper to-copper-dark text-white font-semibold py-3.5 px-6 text-sm tracking-wide shadow-[0_4px_20px_rgba(184,115,58,0.3)] hover:shadow-[0_6px_28px_rgba(184,115,58,0.4)] hover:brightness-110 transition-all duration-300" asChild>
                  <Link to="/categories">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Menu
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full border-copper text-copper-dark font-semibold py-3.5 px-6 text-sm tracking-wide bg-white shadow-sm hover:bg-copper hover:text-white transition-all duration-300" asChild>
                  <Link to="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Staff Login
                  </Link>
                </Button>
              </>}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.button onClick={scrollToContent} className="absolute bottom-6 left-1/2 -translate-x-1/2 text-charcoal/40 hover:text-charcoal/80 transition-colors cursor-pointer" initial={{
        opacity: 0
      }} animate={{
        opacity: 0.4,
          y: [0, 8, 0]
        }} transition={{
        opacity: {
          delay: 0.8
        },
        y: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }
      }} aria-label="Scroll to content">
          <ArrowDown className="w-5 h-5" />
        </motion.button>
      </section>

      {/* ═══════════════════ STAFF TRAINING PORTAL ═══════════════════ */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 32
         }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={vp} transition={{
          duration: 0.7
        }} className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Staff Training Portal
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">Master our menu</p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={vp} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => <motion.div key={feature.path} variants={fadeUp}>
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
              </motion.div>)}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ MY PROGRESS (logged-in only) ═══════════════════ */}
      {user && progressData && <section className="py-14 md:py-20 bg-muted/20">
          <div className="container max-w-2xl">
            <motion.div initial={{
          opacity: 0,
          y: 24
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={vp} transition={{
          duration: 0.6
        }}>
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
                      {progressData.lastScore !== null ? <>
                          <p className="text-3xl font-serif font-bold text-copper">
                            {Math.round(progressData.lastScore)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {progressData.lastDate ? new Date(progressData.lastDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric"
                      }) : ""}
                          </p>
                        </> : <p className="text-sm text-muted-foreground italic">No tests taken yet</p>}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Flashcards Studied</p>
                      <p className="text-3xl font-serif font-bold text-copper">
                        {progressData.flashcardsStudied}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">items reviewed</p>
                    </div>
                  </div>

                  <Button className="w-full bg-copper text-white hover:bg-copper-light font-semibold" asChild>
                    <Link to="/flashcards">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Continue Studying
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>}

      {/* ═══════════════════ FEATURED COCKTAIL ═══════════════════ */}
      {cocktailOfTheDay && <section className="py-14 md:py-24 bg-muted/30">
          <div className="container">
            <motion.div initial={{
          opacity: 0,
          y: 32
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={vp} transition={{
          duration: 0.7
        }} className="mb-8">
              <h2 className="font-serif text-3xl font-semibold text-center mb-2">Featured Cocktail</h2>
              <p className="text-muted-foreground text-center max-w-sm mx-auto">
                Study today's spotlight — ingredients, garnish, and glassware
              </p>
            </motion.div>

            <DailyCocktailCard cocktail={cocktailOfTheDay} dateString={dateString} />
          </div>
        </section>}

      {/* ═══════════════════ TODAY'S FOOD FOCUS ═══════════════════ */}
      <section className="py-14 md:py-24 bg-background">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 32
         }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={vp} transition={{
          duration: 0.7
        }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Utensils className="w-5 h-5 text-copper" />
                <Badge className="bg-copper/10 text-copper border-0">
                  {new Date().toLocaleDateString("en-US", {
                  weekday: "long"
                })}
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

          <motion.div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3" variants={staggerContainer} initial="hidden" whileInView="show" viewport={vp}>
            {foodItems.map((menuItem) => {
            const category = getCategoryById(menuItem.categoryId);
            const image = getDishImage(menuItem.id, menuItem.imageUrl);
            return <motion.div key={menuItem.id} variants={fadeUp}>
                  <Link to={`/categories/${menuItem.categoryId}`} className="block">
                    <Card className="group border-0 bg-card hover:shadow-elevated transition-all duration-500 overflow-hidden cursor-pointer">
                      {image && <div className="relative h-40 overflow-hidden">
                          <img src={image} alt={menuItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />
                          <Badge className="absolute top-3 left-3 bg-copper/90 text-charcoal text-xs font-semibold">
                            {category?.name || "Menu Item"}
                          </Badge>
                        </div>}
                      <CardContent className="p-5 md:p-6">
                        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-copper transition-colors">
                          {menuItem.name}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{menuItem.shortDescription}</p>
                        <p className="text-xs text-muted-foreground/70 line-clamp-2">{menuItem.ingredientsText}</p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>;
          })}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ STATS ═══════════════════ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div initial={{
          opacity: 0,
          y: 32
           }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={vp} transition={{
          duration: 0.7
        }}>
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
                    <p className="text-4xl md:text-5xl font-serif font-bold text-copper">{uniqueAllergenCount}</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Allergens Tracked</p>
                  </div>
                  <div>
                    <p className="text-4xl md:text-5xl font-serif font-bold text-copper">{activeTestCount}</p>
                    <p className="text-sm text-cream/60 mt-2 tracking-wide uppercase">Active Tests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

    </Layout>;
}