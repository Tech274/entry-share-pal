import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, Layers, Server, Cloud, Database, Shield, GitBranch, Building2, Search,
  Code2, Globe, TestTube2, BarChart3, Smartphone, Terminal, Box, Network, HardDrive, Wrench,
  Link2, Boxes, Brain, Workflow, Building, FlaskConical
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import LabTemplateCard from '@/components/catalog/LabTemplateCard';
import LabBundleBar from '@/components/catalog/LabBundleBar';
import { cn } from '@/lib/utils';
import { useLabCatalog, groupByCategory } from '@/hooks/useLabCatalog';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const EXTERNAL_CATALOG_URL = 'https://mml-labs.com/catalog';

// Extended categories with icons and grouping
const categories = [
  // Technology Stacks & Combos
  { id: 'combo', label: 'Combo Lab Templates', icon: Boxes, featured: true, group: 'stacks', color: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  { id: 'devops', label: 'DevOps Stacks', icon: GitBranch, featured: true, group: 'stacks', color: 'bg-gradient-to-r from-orange-500 to-amber-500' },
  { id: 'certification', label: 'Certification Labs', icon: FlaskConical, featured: true, group: 'stacks', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { id: 'gen-ai', label: 'Gen AI & Agentic AI', icon: Brain, featured: true, group: 'stacks', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'multicloud', label: 'Multicloud & Hybrid', icon: Cloud, featured: true, group: 'stacks', color: 'bg-gradient-to-r from-sky-500 to-indigo-500' },
  
  // Cloud Platforms
  { id: 'aws', label: 'AWS', icon: Cloud, featured: true, group: 'cloud', color: 'bg-gradient-to-r from-amber-500 to-yellow-400' },
  { id: 'azure', label: 'Azure', icon: Cloud, featured: true, group: 'cloud', color: 'bg-gradient-to-r from-blue-500 to-cyan-400' },
  { id: 'gcp', label: 'GCP', icon: Cloud, featured: true, group: 'cloud', color: 'bg-gradient-to-r from-red-400 to-yellow-400' },
  
  // Enterprise OEM
  { id: 'sap', label: 'SAP Labs', icon: Building2, featured: true, group: 'enterprise', color: 'bg-gradient-to-r from-blue-600 to-blue-400' },
  { id: 'oracle', label: 'Oracle', icon: Database, featured: true, group: 'enterprise', color: 'bg-gradient-to-r from-red-600 to-red-400' },
  { id: 'enterprise', label: 'OEM & Enterprise', icon: Building, featured: true, group: 'enterprise', color: 'bg-gradient-to-r from-slate-600 to-slate-400' },
  
  // Infrastructure & Security
  { id: 'infrastructure', label: 'Infrastructure', icon: Server, featured: true, group: 'infra', color: 'bg-gradient-to-r from-cyan-600 to-teal-500' },
  { id: 'security', label: 'Security & Compliance', icon: Shield, featured: true, group: 'infra', color: 'bg-gradient-to-r from-red-500 to-orange-500' },
  { id: 'virtualization', label: 'Virtualization', icon: Box, featured: true, group: 'infra', color: 'bg-gradient-to-r from-indigo-500 to-purple-400' },
  { id: 'testing', label: 'Testing & QA', icon: TestTube2, featured: true, group: 'infra', color: 'bg-gradient-to-r from-lime-500 to-green-400' },
  
  // Data & AI
  { id: 'bigdata', label: 'Big Data & Analytics', icon: Database, featured: true, group: 'data', color: 'bg-gradient-to-r from-purple-500 to-indigo-500' },
  { id: 'datascience', label: 'Data Science & ML', icon: BarChart3, featured: true, group: 'data', color: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
  
  // Individual Technologies (not featured)
  { id: 'programming', label: 'Programming', icon: Code2 },
  { id: 'frontend', label: 'Frontend', icon: Globe },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'big-data', label: 'Big Data (Alt)', icon: Database },
  { id: 'database', label: 'Databases', icon: HardDrive },
  { id: 'data', label: 'ETL & Integration', icon: Link2 },
  { id: 'networking', label: 'Networking', icon: Network },
  { id: 'os', label: 'Operating Systems', icon: Terminal },
  { id: 'tools', label: 'IDEs & Tools', icon: Wrench },
  { id: 'bi', label: 'BI & Analytics', icon: BarChart3 },
  { id: 'cms', label: 'CMS & Low-Code', icon: Layers },
  { id: 'cloud', label: 'Cloud (General)', icon: Cloud },
  { id: 'agile', label: 'Agile & PM', icon: Workflow },
  { id: 'blockchain', label: 'Blockchain', icon: Link2 },
];

// Featured category groups for organized display
const featuredGroups = [
  { id: 'stacks', label: 'Technology Stacks' },
  { id: 'cloud', label: 'Cloud Platforms' },
  { id: 'enterprise', label: 'Enterprise OEM' },
  { id: 'infra', label: 'Infrastructure & QA' },
  { id: 'data', label: 'Data & AI' },
];

const LabCatalog = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>('combo');
  const [searchQuery, setSearchQuery] = useState('');
  // Removed showAllCategories state - no longer needed
  const [selectedLabs, setSelectedLabs] = useState<Set<string>>(new Set());
  const { data: catalogEntries = [], isLoading } = useLabCatalog();
  
  // Group database entries by category
  const dbTemplatesByCategory = useMemo(() => groupByCategory(catalogEntries), [catalogEntries]);
  
  // Get templates for a category
  const getTemplates = (categoryId: string) => {
    return dbTemplatesByCategory[categoryId] || [];
  };

  // Get all templates for search
  const allTemplates = useMemo(() => {
    return categories.flatMap(cat => {
      const templates = getTemplates(cat.id);
      return templates.map(t => ({ 
        ...t, 
        category: cat.id, 
        categoryLabel: cat.label, 
        icon: cat.icon,
        uniqueKey: `${cat.id}-${t.name}`
      }));
    });
  }, [catalogEntries]);

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
  const currentCategory = categories.find(c => c.id === activeCategory);
  
  // Current templates with unique keys
  const currentTemplates = useMemo(() => {
    if (isSearching) {
      return searchResults || [];
    }
    if (activeCategory) {
      const templates = getTemplates(activeCategory);
      return templates.map(t => ({
        ...t,
        category: activeCategory,
        categoryLabel: currentCategory?.label || '',
        icon: currentCategory?.icon,
        uniqueKey: `${activeCategory}-${t.name}`
      }));
    }
    return [];
  }, [isSearching, searchResults, activeCategory, catalogEntries]);
  
  // Featured (combo) vs regular categories
  const featuredCategories = categories.filter(c => c.featured);
  const regularCategories = categories.filter(c => !c.featured);

  // Category counts
  const getCategoryCount = (categoryId: string) => {
    return (dbTemplatesByCategory[categoryId] || []).length;
  };

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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setActiveCategory(null);
                  else setActiveCategory('combo');
                }}
                className="pl-10 bg-background text-foreground h-12"
              />
            </div>
            <Button 
              variant="secondary" 
              size="lg" 
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <a href={EXTERNAL_CATALOG_URL}>
                <ExternalLink className="h-5 w-5 mr-2" />
                View Landing Page
              </a>
            </Button>
          </div>
          {selectedLabs.size > 0 && (
            <p className="mt-4 text-sm text-primary-foreground/70">
              💡 Tip: Click on lab cards to add them to your bundle
            </p>
          )}
        </div>
      </section>

      {/* Featured Stacks - Horizontal Filter */}
      {!isSearching && (
        <section className="py-6 bg-gradient-to-b from-muted/40 to-background border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {featuredCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const count = getCategoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-200 text-sm",
                      isActive
                        ? `${category.color} text-white shadow-lg scale-105`
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
                  {currentCategory && (
                    <currentCategory.icon className={cn(
                      "h-8 w-8 transition-transform duration-300",
                      currentCategory.featured ? "text-primary" : "text-muted-foreground"
                    )} />
                  )}
                  <h2 className="text-2xl font-bold">
                    {isSearching 
                      ? `Search Results for "${searchQuery}"` 
                      : currentCategory?.label}
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
                    categoryIcon={currentCategory?.icon}
                    isFeatured={currentCategory?.featured}
                    featuredColor={currentCategory?.color}
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
              <div className="text-3xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{featuredCategories.length}</div>
              <div className="text-sm text-muted-foreground">Combo Stacks</div>
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
