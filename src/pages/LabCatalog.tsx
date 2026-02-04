import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Layers, Search, Tags } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LabTemplateCard from '@/components/catalog/LabTemplateCard';
import { LabTemplateCardSkeletonGrid } from '@/components/catalog/LabTemplateCardSkeleton';
import LabBundleBar from '@/components/catalog/LabBundleBar';
import { LabelFilter } from '@/components/catalog/LabelFilter';
import { FloatingParticles } from '@/components/catalog/FloatingParticles';
import { AnimatedCategoryPill } from '@/components/catalog/AnimatedCategoryPill';
import { ScrollToTopButton } from '@/components/catalog/ScrollToTopButton';
import { CategoryPillSkeletonRow } from '@/components/catalog/CategoryPillSkeleton';
import { RollingBanner, LabHighlight, labHighlights } from '@/components/catalog/RollingBanner';
import { cn } from '@/lib/utils';
import { useLabCatalog, useLabCatalogCategories, useLabCatalogEntryLabels, groupByCategory } from '@/hooks/useLabCatalog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getIconComponent } from '@/lib/categoryIcons';
import { useCountUp } from '@/hooks/useCountUp';
import { useParallax } from '@/hooks/useParallax';

const EXTERNAL_CATALOG_URL = 'https://mml-labs.com/catalog';

// Animated stats component with count-up effect
const AnimatedStats = () => {
  const templatesCount = useCountUp({ end: 2500, duration: 2000, delay: 200, suffix: '+' });
  const categoriesCount = useCountUp({ end: 36, duration: 1800, delay: 400, suffix: '' });
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

const LabCatalog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabs, setSelectedLabs] = useState<Set<string>>(new Set());
  const [selectedLabelFilters, setSelectedLabelFilters] = useState<string[]>([]);
  const [currentLabHighlight, setCurrentLabHighlight] = useState<LabHighlight>(labHighlights[0]);
  
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

  // Get unique labels for filter
  const uniqueLabels = useMemo(() => {
    const labelMap = new Map<string, { label_id: string; name: string; color: string }>();
    entryLabels.forEach(el => {
      if (!labelMap.has(el.label_id)) {
        labelMap.set(el.label_id, { label_id: el.label_id, name: el.name, color: el.color });
      }
    });
    return Array.from(labelMap.values());
  }, [entryLabels]);
  
  // Set initial category when categories load
  useEffect(() => {
    if (dbCategories.length > 0 && activeCategory === null) {
      setActiveCategory(dbCategories[0].category_id);
    }
  }, [dbCategories, activeCategory]);

  // Toggle label filter
  const toggleLabelFilter = useCallback((labelId: string) => {
    setSelectedLabelFilters(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  }, []);

  const clearLabelFilters = useCallback(() => {
    setSelectedLabelFilters([]);
  }, []);
  
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

  // Filter templates based on search query and label filters
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() && selectedLabelFilters.length === 0) return null;
    
    let filtered = allTemplates;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(query) || 
        t.description.toLowerCase().includes(query) ||
        t.categoryLabel.toLowerCase().includes(query) ||
        t.labels.some(l => l.name.toLowerCase().includes(query))
      );
    }
    
    // Apply label filter
    if (selectedLabelFilters.length > 0) {
      filtered = filtered.filter(t => 
        selectedLabelFilters.every(labelId => 
          t.labels.some(l => l.label_id === labelId)
        )
      );
    }
    
    return filtered;
  }, [searchQuery, selectedLabelFilters, allTemplates]);

  const isSearching = searchQuery.trim().length > 0 || selectedLabelFilters.length > 0;
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

  // Selection handlers
  const toggleLabSelection = useCallback((uniqueKey: string) => {
    setSelectedLabs(prev => {
      const next = new Set(prev);
      if (next.has(uniqueKey)) {
        next.delete(uniqueKey);
      } else {
        next.add(uniqueKey);
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLabs(new Set());
  }, []);

  const selectedLabDetails = useMemo(() => {
    return allTemplates.filter(t => selectedLabs.has(t.uniqueKey));
  }, [allTemplates, selectedLabs]);

  const handleRequestBundle = useCallback(() => {
    if (selectedLabDetails.length === 0) return;
    
    // Store selected labs in sessionStorage for the request form
    const bundleData = {
      labs: selectedLabDetails.map(l => ({ name: l.name, category: l.categoryLabel })),
      timestamp: Date.now()
    };
    sessionStorage.setItem('labBundleRequest', JSON.stringify(bundleData));
    
    toast.success(`Bundle with ${selectedLabDetails.length} labs ready!`, {
      description: 'Redirecting to request form...'
    });
    
    // Navigate to submit request page
    setTimeout(() => {
      navigate('/submit-request');
    }, 500);
  }, [selectedLabDetails, navigate]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    if (value.trim() || selectedLabelFilters.length > 0) {
      setActiveCategory(null);
    } else if (dbCategories.length > 0) {
      setActiveCategory(dbCategories[0].category_id);
    }
  }, [dbCategories, selectedLabelFilters.length]);

  // Reset category when label filters are applied
  useEffect(() => {
    if (selectedLabelFilters.length > 0) {
      setActiveCategory(null);
    }
  }, [selectedLabelFilters]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section with Parallax */}
      <section className="bg-primary text-primary-foreground py-16 relative overflow-hidden">
        <FloatingParticles />
        {/* Parallax background layer */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-primary-foreground/5 to-transparent pointer-events-none"
          style={{ transform: `translateY(${parallaxOffset * 0.5}px)` }}
        />
        <div 
          className="container mx-auto px-4 text-center relative z-10"
          style={{ transform: `translateY(${parallaxOffset * 0.15}px)` }}
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2 transition-all duration-500">
            {currentLabHighlight.title}
          </h1>
          <p className="text-sm text-primary-foreground/70 mb-6 transition-all duration-500">
            {currentLabHighlight.tagline}
          </p>
          
          {/* Hidden RollingBanner to drive state changes */}
          <div className="hidden">
            <RollingBanner onLabChange={setCurrentLabHighlight} />
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
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="secondary" 
                    size="lg" 
                    asChild
                    className="bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <a href={EXTERNAL_CATALOG_URL} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-5 w-5 mr-2" />
                      View MML Complete Catalog
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>
                  <p>Opens MML Labs complete catalog in a new tab</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {selectedLabs.size > 0 && (
            <p className="mt-4 text-sm text-primary-foreground/70">
              💡 Tip: Click on lab cards to add them to your bundle
            </p>
          )}
        </div>
      </section>

      {/* Label Filter Section */}
      {uniqueLabels.length > 0 && (
        <section className="py-4 bg-muted/20 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 justify-center flex-wrap">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Tags className="h-4 w-4" />
                Filter by label:
              </span>
              <LabelFilter
                labels={uniqueLabels}
                selectedLabels={selectedLabelFilters}
                onToggleLabel={toggleLabelFilter}
                onClearAll={clearLabelFilters}
              />
            </div>
          </div>
        </section>
      )}

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
                    {selectedLabelFilters.length > 0 && ` with selected labels`}
                  </p>
                )}
                {!isSearching && selectedLabs.size === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Click on cards to select labs for your training bundle
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
                      isSelected={selectedLabs.has(template.uniqueKey)}
                      onToggleSelect={() => toggleLabSelection(template.uniqueKey)}
                      animationIndex={index}
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
              <div className="text-3xl font-bold text-primary">{catalogEntries.length}</div>
              <div className="text-sm text-muted-foreground">Total Templates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{dbCategories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MakeMyLabs. All rights reserved.</p>
        </div>
      </footer>

      {/* Lab Bundle Bar */}
      <LabBundleBar
        selectedCount={selectedLabs.size}
        selectedLabs={selectedLabDetails}
        onClear={clearSelection}
        onRequestBundle={handleRequestBundle}
      />

      {/* Scroll to Top Button */}
      <ScrollToTopButton threshold={400} />
    </div>
  );
};

export default LabCatalog;
