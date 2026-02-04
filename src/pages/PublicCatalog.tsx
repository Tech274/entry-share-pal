import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, Search, PlusCircle, Mail, Phone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LabTemplateCard from '@/components/catalog/LabTemplateCard';
import { LabTemplateCardSkeletonGrid } from '@/components/catalog/LabTemplateCardSkeleton';

import { FloatingParticles } from '@/components/catalog/FloatingParticles';
import { AnimatedCategoryPill } from '@/components/catalog/AnimatedCategoryPill';
import { ScrollToTopButton } from '@/components/catalog/ScrollToTopButton';
import { CategoryPillSkeletonRow } from '@/components/catalog/CategoryPillSkeleton';
import { RollingBanner, LabHighlight, labHighlights } from '@/components/catalog/RollingBanner';
import { cn } from '@/lib/utils';
import { useLabCatalog, useLabCatalogCategories, useLabCatalogEntryLabels, groupByCategory } from '@/hooks/useLabCatalog';
import { Link } from 'react-router-dom';
import { getIconComponent } from '@/lib/categoryIcons';
import { useCountUp } from '@/hooks/useCountUp';
import { useParallax } from '@/hooks/useParallax';
import mmlLogo from '@/assets/mml-logo.png';

// Animated stats component with count-up effect
const AnimatedStats = () => {
  const templatesCount = useCountUp({ end: 2500, duration: 2000, delay: 200, suffix: '+' });
  const categoriesCount = useCountUp({ end: 50, duration: 1800, delay: 400, suffix: '+' });
  const techCount = useCountUp({ end: 250, duration: 2000, delay: 600, suffix: '+' });

  return (
    <div className="flex flex-wrap justify-center gap-8 mb-8">
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="text-3xl md:text-4xl font-bold tabular-nums">{templatesCount}</div>
        <div className="text-sm text-primary-foreground/70">Templates</div>
      </div>
      <div className="h-12 w-px bg-primary-foreground/20 hidden sm:block animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }} />
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
        <div className="text-3xl md:text-4xl font-bold tabular-nums">{categoriesCount}</div>
        <div className="text-sm text-primary-foreground/70">Categories</div>
      </div>
      <div className="h-12 w-px bg-primary-foreground/20 hidden sm:block animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }} />
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
        <div className="text-3xl md:text-4xl font-bold tabular-nums">{techCount}</div>
        <div className="text-sm text-primary-foreground/70">Technologies</div>
      </div>
    </div>
  );
};

const PublicCatalog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentLabHighlight, setCurrentLabHighlight] = useState<LabHighlight>(labHighlights[0]);
  const [currentLabIndex, setCurrentLabIndex] = useState(0);
  const [isHeroTransitioning, setIsHeroTransitioning] = useState(false);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [goToLabIndex, setGoToLabIndex] = useState<((idx: number) => void) | null>(null);

  // Keyboard navigation for hero carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentLabIndex + 1) % labHighlights.length;
        goToLabIndex?.(nextIndex);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (currentLabIndex - 1 + labHighlights.length) % labHighlights.length;
        goToLabIndex?.(prevIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLabIndex, goToLabIndex]);
  
  // Parallax effect for hero section
  const parallaxOffset = useParallax({ speed: 0.3, maxOffset: 80 });
  
  const { data: catalogEntries = [], isLoading: entriesLoading } = useLabCatalog();
  const { data: dbCategories = [], isLoading: categoriesLoading } = useLabCatalogCategories();
  const { data: entryLabels = [], isLoading: labelsLoading } = useLabCatalogEntryLabels();

  const isLoading = entriesLoading || categoriesLoading || labelsLoading;
  
  // Create a map of entry_id -> labels for quick lookup
  const entryLabelsMap = useMemo(() => {
    const map: Record<string, { label_id: string; name: string; color: string }[]> = {};
    entryLabels.forEach(el => {
      if (!map[el.entry_id]) {
        map[el.entry_id] = [];
      }
      map[el.entry_id].push({
        label_id: el.label_id,
        name: el.name,
        color: el.color,
      });
    });
    return map;
  }, [entryLabels]);

  // Set initial category when categories load
  useEffect(() => {
    if (dbCategories.length > 0 && activeCategory === null) {
      setActiveCategory(dbCategories[0].category_id);
    }
  }, [dbCategories, activeCategory]);
  
  // Group database entries by category
  const dbTemplatesByCategory = useMemo(() => groupByCategory(catalogEntries), [catalogEntries]);
  
  // Get templates for a category
  const getTemplates = useCallback((categoryId: string) => {
    return dbTemplatesByCategory[categoryId] || [];
  }, [dbTemplatesByCategory]);

  // Get category info by ID
  const getCategoryInfo = useCallback((categoryId: string) => {
    return dbCategories.find(c => c.category_id === categoryId);
  }, [dbCategories]);

  // Get all templates for search
  const allTemplates = useMemo(() => {
    return dbCategories.flatMap(cat => {
      const templates = getTemplates(cat.category_id);
      const IconComponent = getIconComponent(cat.icon_name || 'Layers');
      return templates.map(t => ({ 
        ...t, 
        category: cat.category_id, 
        categoryLabel: cat.label, 
        icon: IconComponent,
        iconName: cat.icon_name,
        uniqueKey: `${cat.category_id}-${t.name}`,
        labels: entryLabelsMap[t.id] || [],
      }));
    });
  }, [dbCategories, getTemplates, entryLabelsMap]);

  // Filter templates based on search query
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    let filtered = allTemplates;
    
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.categoryLabel.toLowerCase().includes(query) ||
      t.labels.some(l => l.name.toLowerCase().includes(query))
    );
    
    return filtered;
  }, [searchQuery, allTemplates]);

  const isSearching = searchQuery.trim().length > 0;
  const currentCategoryInfo = getCategoryInfo(activeCategory || '');
  const CurrentCategoryIcon = currentCategoryInfo ? getIconComponent(currentCategoryInfo.icon_name || 'Layers') : Layers;
  
  // Current templates with unique keys
  const currentTemplates = useMemo(() => {
    if (isSearching) {
      return searchResults || [];
    }
    if (activeCategory) {
      const templates = getTemplates(activeCategory);
      const IconComponent = currentCategoryInfo ? getIconComponent(currentCategoryInfo.icon_name || 'Layers') : Layers;
      return templates.map(t => ({
        ...t,
        category: activeCategory,
        categoryLabel: currentCategoryInfo?.label || '',
        icon: IconComponent,
        iconName: currentCategoryInfo?.icon_name,
        uniqueKey: `${activeCategory}-${t.name}`,
        labels: entryLabelsMap[t.id] || [],
      }));
    }
    return [];
  }, [isSearching, searchResults, activeCategory, getTemplates, currentCategoryInfo, entryLabelsMap]);

  // Category counts
  const getCategoryCount = useCallback((categoryId: string) => {
    return (dbTemplatesByCategory[categoryId] || []).length;
  }, [dbTemplatesByCategory]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setActiveCategory(null);
    } else if (dbCategories.length > 0) {
      setActiveCategory(dbCategories[0].category_id);
    }
  }, [dbCategories]);

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Public Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/catalog" className="flex items-center gap-2">
            <img src={mmlLogo} alt="MakeMyLabs" className="h-8 w-auto" />
            <span className="font-semibold text-lg hidden sm:inline">Lab Catalog</span>
          </Link>
          <div className="flex items-center gap-3">
            <a 
              href="mailto:labs@makemylabs.com" 
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact Us</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section 
        className="bg-primary text-primary-foreground py-16 relative overflow-hidden"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
      >
        <FloatingParticles />
        <div 
          className="absolute inset-0 bg-gradient-to-b from-primary-foreground/5 to-transparent pointer-events-none"
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        />
        <div 
          className="container mx-auto px-4 text-center relative z-10"
          style={{ transform: `translateY(${parallaxOffset * 0.15}px)` }}
        >
          {/* Animated Hero Content */}
          <div 
            className={cn(
              "transition-all duration-300 ease-out",
              isHeroTransitioning 
                ? "opacity-0 translate-y-3 scale-95" 
                : "opacity-100 translate-y-0 scale-100"
            )}
          >
            {(() => {
              const HeroIcon = currentLabHighlight.icon;
              return (
                <div 
                  className={cn(
                    "p-4 rounded-2xl bg-gradient-to-br shadow-xl mb-6 transition-all duration-500 inline-block",
                    currentLabHighlight.gradient
                  )}
                  style={{ transform: `translateY(${parallaxOffset * -0.2}px)` }}
                >
                  <HeroIcon className="h-16 w-16 text-white" />
                </div>
              );
            })()}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {currentLabHighlight.title}
            </h1>
            <p className="text-sm text-primary-foreground/70 mb-4">
              {currentLabHighlight.tagline}
            </p>
            
            {/* Feature/Toolset Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {currentLabHighlight.features.map((feature, idx) => (
                <span
                  key={feature}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium",
                    "bg-primary-foreground/10 text-primary-foreground/90",
                    "border border-primary-foreground/20",
                    "backdrop-blur-sm"
                  )}
                  style={{ animationDelay: `${idx * 75}ms` }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
          {/* Navigation Dots with Tooltips */}
          <TooltipProvider delayDuration={100}>
            <div className="flex justify-center gap-2 mb-6">
              {labHighlights.map((lab, idx) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => goToLabIndex?.(idx)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300 cursor-pointer",
                        idx === currentLabIndex 
                          ? "w-6 bg-primary-foreground" 
                          : "w-2 bg-primary-foreground/30 hover:bg-primary-foreground/50"
                      )}
                      aria-label={`View ${lab.title}`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {lab.title}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
          
          {/* Hidden RollingBanner to drive state changes */}
          <div className="hidden">
            <RollingBanner 
              isPaused={isHeroPaused}
              onLabChange={(lab, index, transitioning) => {
                setCurrentLabHighlight(lab);
                setCurrentLabIndex(index);
                setIsHeroTransitioning(transitioning);
              }}
              onGoToIndex={(fn) => setGoToLabIndex(() => fn)}
            />
          </div>
          
          {/* Animated Stats Section */}
          <AnimatedStats />

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search labs by name, technology, or category..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 bg-background text-foreground h-12"
              />
            </div>
            <Button 
              asChild
              size="lg"
              className="btn-glow bg-accent text-accent-foreground hover:bg-accent/90 shrink-0"
            >
              <a href="mailto:labs@makemylabs.com?subject=Lab%20Request">
                <PlusCircle className="h-5 w-5 mr-2" />
                Request a Lab
              </a>
            </Button>
          </div>
        </div>
      </section>

      {!isSearching && (
        <section className="py-6 bg-gradient-to-b from-muted/40 to-background border-b">
          <div className="container mx-auto px-4">
            {categoriesLoading ? (
              <div className="space-y-3">
                <CategoryPillSkeletonRow count={6} variant="featured" />
                <div className="pt-3 border-t border-muted/50">
                  <CategoryPillSkeletonRow count={8} variant="secondary" />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {dbCategories
                  .filter(c => c.is_featured)
                  .map((category, index) => {
                    const Icon = getIconComponent(category.icon_name || 'Layers');
                    const isActive = activeCategory === category.category_id;
                    const count = getCategoryCount(category.category_id);
                    return (
                      <AnimatedCategoryPill
                        key={category.id}
                        category={category}
                        Icon={Icon}
                        isActive={isActive}
                        count={count}
                        onClick={() => setActiveCategory(category.category_id)}
                        index={index}
                        variant="featured"
                      />
                    );
                  })}
              </div>
            )}
            {dbCategories.filter(c => !c.is_featured).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-muted/50">
                {dbCategories
                  .filter(c => !c.is_featured)
                  .map((category, index) => {
                    const Icon = getIconComponent(category.icon_name || 'Layers');
                    const isActive = activeCategory === category.category_id;
                    const count = getCategoryCount(category.category_id);
                    return (
                      <AnimatedCategoryPill
                        key={category.id}
                        category={category}
                        Icon={Icon}
                        isActive={isActive}
                        count={count}
                        onClick={() => setActiveCategory(category.category_id)}
                        index={index}
                        variant="secondary"
                      />
                    );
                  })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Category Content */}
      <section className="py-12 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div 
              key={activeCategory || 'search'} 
              className="animate-fade-in"
            >
              <div className="text-center mb-10">
                <div className="flex items-center justify-center gap-3 mb-3">
                  {currentCategoryInfo && (
                    <CurrentCategoryIcon className="h-8 w-8 transition-transform duration-300 text-primary" />
                  )}
                  <h2 className="text-2xl font-bold">
                    {isSearching 
                      ? `Search Results for "${searchQuery}"` 
                      : currentCategoryInfo?.label || 'Select a category'}
                  </h2>
                </div>
                {isSearching && (
                  <p className="text-muted-foreground">
                    Found {currentTemplates.length} matching template{currentTemplates.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {isLoading ? (
                <LabTemplateCardSkeletonGrid count={9} />
              ) : currentTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates available for this category yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentTemplates.map((template: any, index: number) => (
                    <LabTemplateCard
                      key={template.uniqueKey}
                      template={template}
                      categoryIcon={template.icon}
                      isFeatured={true}
                      isSearching={isSearching}
                      isSelected={false}
                      onToggleSelect={() => {}}
                      animationIndex={index}
                      hideSelection
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">Templates</div>
              <div className="text-sm text-muted-foreground">Browse our complete catalog</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Categories</div>
              <div className="text-sm text-muted-foreground">Organized by technology area</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={mmlLogo} alt="MakeMyLabs" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} MakeMyLabs. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="mailto:labs@makemylabs.com" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Mail className="h-4 w-4" />
                labs@makemylabs.com
              </a>
              <a href="tel:+919876543210" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Phone className="h-4 w-4" />
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <ScrollToTopButton threshold={400} />
    </div>
  );
};

export default PublicCatalog;
