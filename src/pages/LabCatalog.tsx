import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Layers, Search } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import LabTemplateCard from '@/components/catalog/LabTemplateCard';
import LabBundleBar from '@/components/catalog/LabBundleBar';
import { cn } from '@/lib/utils';
import { useLabCatalog, useLabCatalogCategories, useLabCatalogEntryLabels, groupByCategory } from '@/hooks/useLabCatalog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getIconComponent } from '@/lib/categoryIcons';

const EXTERNAL_CATALOG_URL = 'https://mml-labs.com/catalog';

const LabCatalog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabs, setSelectedLabs] = useState<Set<string>>(new Set());
  
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
    const query = searchQuery.toLowerCase();
    return allTemplates.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.categoryLabel.toLowerCase().includes(query)
    );
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
    if (value.trim()) {
      setActiveCategory(null);
    } else if (dbCategories.length > 0) {
      setActiveCategory(dbCategories[0].category_id);
    }
  }, [dbCategories]);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Layers className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Lab Catalog
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Browse our comprehensive catalog of pre-built lab environments. Select multiple labs to request as a training bundle.
          </p>
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

      {/* Dynamic Categories - Horizontal Filter */}
      {!isSearching && (
        <section className="py-6 bg-gradient-to-b from-muted/40 to-background border-b">
          <div className="container mx-auto px-4">
            {categoriesLoading ? (
              <div className="text-center py-4 text-muted-foreground">Loading categories...</div>
            ) : (
              <div className="flex flex-wrap gap-2 justify-center">
                {dbCategories
                  .filter(c => c.is_featured)
                  .map((category) => {
                    const Icon = getIconComponent(category.icon_name || 'Layers');
                    const isActive = activeCategory === category.category_id;
                    const count = getCategoryCount(category.category_id);
                    const gradientColor = category.gradient_color || 'bg-gradient-to-r from-primary to-primary/80';
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.category_id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 text-sm",
                          isActive
                            ? `${gradientColor} text-white shadow-lg scale-105`
                            : "bg-background text-foreground hover:bg-muted border hover:shadow-md hover:scale-[1.02]"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{category.label}</span>
                        {count > 0 && (
                          <Badge variant="secondary" className={cn(
                            "text-xs h-5 px-1.5 transition-colors",
                            isActive ? "bg-white/20 text-white" : ""
                          )}>
                            {count}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
            {/* Show non-featured categories in a secondary row if any exist */}
            {dbCategories.filter(c => !c.is_featured).length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3 pt-3 border-t border-muted/50">
                {dbCategories
                  .filter(c => !c.is_featured)
                  .map((category) => {
                    const Icon = getIconComponent(category.icon_name || 'Layers');
                    const isActive = activeCategory === category.category_id;
                    const count = getCategoryCount(category.category_id);
                    const gradientColor = category.gradient_color || 'bg-gradient-to-r from-primary to-primary/80';
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.category_id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full font-medium transition-all duration-200 text-xs",
                          isActive
                            ? `${gradientColor} text-white shadow-lg scale-105`
                            : "bg-muted/50 text-muted-foreground hover:bg-muted border border-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        <span>{category.label}</span>
                        {count > 0 && (
                          <Badge variant="outline" className={cn(
                            "text-[10px] h-4 px-1 transition-colors",
                            isActive ? "bg-white/20 text-white border-white/30" : ""
                          )}>
                            {count}
                          </Badge>
                        )}
                      </button>
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
                {!isSearching && selectedLabs.size === 0 && (
                  <p className="text-muted-foreground text-sm">
                    Click on cards to select labs for your training bundle
                  </p>
                )}
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
              ) : currentTemplates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates available for this category yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentTemplates.map((template: any) => (
                    <LabTemplateCard
                      key={template.uniqueKey}
                      template={template}
                      categoryIcon={template.icon}
                      isFeatured={true}
                      isSearching={isSearching}
                      isSelected={selectedLabs.has(template.uniqueKey)}
                      onToggleSelect={() => toggleLabSelection(template.uniqueKey)}
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
    </div>
  );
};

export default LabCatalog;
