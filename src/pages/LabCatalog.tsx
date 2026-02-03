import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, Layers, Server, Cloud, Database, Shield, GitBranch, Cpu, Building2, Sparkles, Search,
  Code2, Globe, TestTube2, BarChart3, Smartphone, Terminal, Box, Network, HardDrive, Wrench,
  Link2, Boxes, Brain, Workflow, Building, FlaskConical
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import { cn } from '@/lib/utils';
import { useLabCatalog, groupByCategory } from '@/hooks/useLabCatalog';

const EXTERNAL_CATALOG_URL = '/catalog';

// Extended categories with icons
const categories = [
  // Combo categories (featured)
  { id: 'fullstack', label: 'Full Stack Combos', icon: Boxes, featured: true, color: 'bg-gradient-to-r from-violet-500 to-purple-500' },
  { id: 'devops-combo', label: 'DevOps Stacks', icon: Workflow, featured: true, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
  { id: 'data-combo', label: 'Data Engineering', icon: Database, featured: true, color: 'bg-gradient-to-r from-cyan-500 to-blue-500' },
  { id: 'cloud-combo', label: 'Cloud Stacks', icon: Cloud, featured: true, color: 'bg-gradient-to-r from-sky-500 to-indigo-500' },
  { id: 'testing-combo', label: 'Testing Suites', icon: FlaskConical, featured: true, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
  { id: 'ai-combo', label: 'AI/ML Platforms', icon: Brain, featured: true, color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
  { id: 'enterprise', label: 'Enterprise', icon: Building, featured: true, color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
  
  // Individual technology categories
  { id: 'cloud', label: 'Cloud', icon: Cloud },
  { id: 'devops', label: 'DevOps', icon: GitBranch },
  { id: 'bigdata', label: 'Big Data', icon: Database },
  { id: 'programming', label: 'Programming', icon: Code2 },
  { id: 'frontend', label: 'Frontend', icon: Globe },
  { id: 'backend', label: 'Backend', icon: Server },
  { id: 'database', label: 'Databases', icon: HardDrive },
  { id: 'testing', label: 'Testing & QA', icon: TestTube2 },
  { id: 'datascience', label: 'Data Science', icon: BarChart3 },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'virtualization', label: 'Virtualization', icon: Box },
  { id: 'networking', label: 'Networking', icon: Network },
  { id: 'os', label: 'Operating Systems', icon: Terminal },
  { id: 'tools', label: 'IDEs & Tools', icon: Wrench },
  { id: 'data', label: 'ETL & Integration', icon: Link2 },
  { id: 'bi', label: 'BI & Analytics', icon: BarChart3 },
  { id: 'sap', label: 'SAP Labs', icon: Building2 },
  { id: 'cms', label: 'CMS & Low-Code', icon: Layers },
];

const LabCatalog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>('fullstack');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
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
      return templates.map(t => ({ ...t, category: cat.id, categoryLabel: cat.label, icon: cat.icon }));
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
  const currentTemplates = isSearching ? (searchResults || []) : (activeCategory ? getTemplates(activeCategory) : []);
  
  // Featured (combo) vs regular categories
  const featuredCategories = categories.filter(c => c.featured);
  const regularCategories = categories.filter(c => !c.featured);

  // Category counts
  const getCategoryCount = (categoryId: string) => {
    return (dbTemplatesByCategory[categoryId] || []).length;
  };

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
            Browse our comprehensive catalog of pre-built lab environments, templates, and technology combinations for your training needs.
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
                  else setActiveCategory('fullstack');
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
        </div>
      </section>

      {/* Featured Combo Categories */}
      {!isSearching && (
        <section className="py-8 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-semibold mb-4 text-center">Featured Technology Stacks</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {featuredCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const count = getCategoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all text-sm",
                      isActive
                        ? `${category.color} text-white shadow-lg`
                        : "bg-background text-foreground hover:bg-muted border"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className={cn(
                        "text-xs h-5 px-1.5",
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

      {/* Individual Technology Categories */}
      {!isSearching && (
        <section className="py-4 border-b bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">Individual Technologies</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories ? 'Show Less' : 'Show All'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(showAllCategories ? regularCategories : regularCategories.slice(0, 10)).map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const count = getCategoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{category.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] px-1 rounded",
                        isActive ? "bg-primary-foreground/20" : "bg-background"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Category Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-3">
                {currentCategory && (
                  <currentCategory.icon className={cn(
                    "h-8 w-8",
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
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading templates...</div>
            ) : currentTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No templates available for this category yet.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentTemplates.map((template: any, index) => {
                  const TemplateIcon = template.icon || currentCategory?.icon || Layers;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1 group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            currentCategory?.featured 
                              ? currentCategory.color + " text-white"
                              : "bg-primary/10 text-primary"
                          )}>
                            <TemplateIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base leading-tight group-hover:text-primary transition-colors">
                              {template.name}
                            </CardTitle>
                            {isSearching && template.categoryLabel && (
                              <Badge variant="outline" className="mt-1 text-[10px]">
                                {template.categoryLabel}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm line-clamp-2">
                          {template.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
    </div>
  );
};

export default LabCatalog;
