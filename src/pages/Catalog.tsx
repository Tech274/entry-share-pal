import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, Server, Cloud, Database, Shield, GitBranch, Cpu, Building2, Sparkles, Search, ArrowRight, CheckCircle2,
  Code2, Globe, TestTube2, BarChart3, Smartphone, Terminal, Box, Network, HardDrive, Wrench,
  Link2, Boxes, Brain, Workflow, Building, FlaskConical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLabCatalog, groupByCategory } from '@/hooks/useLabCatalog';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/mml-logo.png';
import { ScrollAnimation } from '@/components/ScrollAnimation';

// Extended categories with icons and colors
const categories = [
  // Featured combo categories
  { id: 'fullstack', label: 'Full Stack Combos', icon: Boxes, featured: true, color: 'from-violet-500 to-purple-500', description: 'Complete development stacks combining frontend, backend, and database technologies.' },
  { id: 'devops-combo', label: 'DevOps Stacks', icon: Workflow, featured: true, color: 'from-orange-500 to-red-500', description: 'CI/CD pipelines, container orchestration, and infrastructure automation.' },
  { id: 'data-combo', label: 'Data Engineering', icon: Database, featured: true, color: 'from-cyan-500 to-blue-500', description: 'Big data processing, ETL pipelines, and analytics platforms.' },
  { id: 'cloud-combo', label: 'Cloud Stacks', icon: Cloud, featured: true, color: 'from-sky-500 to-indigo-500', description: 'Complete cloud platform environments for AWS, Azure, and GCP.' },
  { id: 'testing-combo', label: 'Testing Suites', icon: FlaskConical, featured: true, color: 'from-green-500 to-emerald-500', description: 'Comprehensive testing frameworks for API, UI, and performance.' },
  { id: 'ai-combo', label: 'AI/ML Platforms', icon: Brain, featured: true, color: 'from-pink-500 to-rose-500', description: 'Machine learning, deep learning, and AI application development.' },
  { id: 'enterprise', label: 'Enterprise', icon: Building, featured: true, color: 'from-amber-500 to-orange-500', description: 'SAP, Oracle, Salesforce, and enterprise application platforms.' },
  
  // Individual categories
  { id: 'cloud', label: 'Cloud', icon: Cloud, description: 'AWS, Azure, GCP cloud services and infrastructure.' },
  { id: 'devops', label: 'DevOps', icon: GitBranch, description: 'CI/CD tools, version control, and automation.' },
  { id: 'bigdata', label: 'Big Data', icon: Database, description: 'Hadoop, Spark, Kafka, and data processing.' },
  { id: 'programming', label: 'Programming', icon: Code2, description: 'Languages: Java, Python, JavaScript, Go, and more.' },
  { id: 'frontend', label: 'Frontend', icon: Globe, description: 'React, Angular, Vue.js, and web frameworks.' },
  { id: 'backend', label: 'Backend', icon: Server, description: 'Node.js, Spring Boot, Django, and APIs.' },
  { id: 'database', label: 'Databases', icon: HardDrive, description: 'SQL, NoSQL, and database administration.' },
  { id: 'testing', label: 'Testing & QA', icon: TestTube2, description: 'Selenium, JMeter, Postman, and automation.' },
  { id: 'datascience', label: 'Data Science', icon: BarChart3, description: 'Python, TensorFlow, PyTorch, and ML tools.' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Security testing and compliance tools.' },
  { id: 'sap', label: 'SAP Labs', icon: Building2, description: 'SAP S/4HANA, ABAP, and Fiori development.' },
];

const features = [
  { icon: CheckCircle2, title: 'Pre-configured Environments', description: 'Ready-to-use lab setups with all tools pre-installed' },
  { icon: CheckCircle2, title: 'Technology Combos', description: 'Full stack and integrated platform combinations' },
  { icon: CheckCircle2, title: 'Enterprise Security', description: 'Isolated environments with data protection' },
  { icon: CheckCircle2, title: '24/7 Support', description: 'Round-the-clock technical assistance' },
];

const Catalog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>('fullstack');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: catalogEntries = [], isLoading } = useLabCatalog();
  
  const dbTemplatesByCategory = useMemo(() => groupByCategory(catalogEntries), [catalogEntries]);
  
  const getTemplates = (categoryId: string) => {
    return dbTemplatesByCategory[categoryId] || [];
  };

  const allTemplates = useMemo(() => {
    return categories.flatMap(cat => {
      const templates = getTemplates(cat.id);
      return templates.map(t => ({ ...t, category: cat.id, categoryLabel: cat.label, icon: cat.icon, color: cat.color }));
    });
  }, [catalogEntries]);

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

  const featuredCategories = categories.filter(c => c.featured);
  const regularCategories = categories.filter(c => !c.featured);

  const getCategoryCount = (categoryId: string) => {
    return (dbTemplatesByCategory[categoryId] || []).length;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover-scale">
            <img src={logoImage} alt="MakeMyLabs" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-foreground">MML Labs</span>
              <span className="text-xs text-muted-foreground block">Lab Catalog</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/lab-catalog">
              <Button variant="ghost" size="sm" className="transition-all duration-200 hover:scale-105">Browse All Labs</Button>
            </Link>
            <Link to="/submit-request">
              <Button size="sm" className="transition-all duration-200 hover:scale-105 hover:shadow-md">Request a Lab</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-20 overflow-hidden relative">
        {/* Floating particles background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-foreground/5 to-transparent rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6 animate-fade-in opacity-0 [animation-delay:100ms] [animation-fill-mode:forwards]">
              <Layers className="h-5 w-5 animate-pulse" />
              <span className="text-sm font-medium">Enterprise Lab Solutions</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
              MML Labs Catalog
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10 animate-fade-in opacity-0 [animation-delay:300ms] [animation-fill-mode:forwards]">
              Discover our comprehensive collection of pre-built lab environments and technology stack combinations for enterprise training.
            </p>
            <div className="relative max-w-xl mx-auto animate-scale-in opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search labs by name, technology, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setActiveCategory(null);
                  else setActiveCategory('fullstack');
                }}
                className="pl-12 h-14 text-lg bg-background text-foreground rounded-full shadow-lg transition-shadow duration-300 focus:shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <ScrollAnimation 
                key={idx} 
                animation="fade-up"
                delay={idx * 100}
                className="flex items-start gap-3 hover-scale"
              >
                <feature.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Combo Categories */}
      {!isSearching && (
        <section className="py-8 bg-background border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-lg font-semibold mb-6 text-center">Featured Technology Stacks</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {featuredCategories.map((category, idx) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const count = getCategoryCount(category.id);
                return (
                  <ScrollAnimation
                    key={category.id}
                    animation="fade-up"
                    delay={idx * 50}
                  >
                    <button
                      onClick={() => setActiveCategory(category.id)}
                      className={cn(
                        "w-full flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
                        isActive
                          ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105`
                          : "bg-muted hover:bg-muted/80 hover:scale-102"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-lg",
                        isActive ? "bg-white/20" : "bg-background"
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">{category.label}</span>
                      {count > 0 && (
                        <Badge variant="secondary" className={cn(
                          "text-[10px] h-4 px-1.5",
                          isActive ? "bg-white/20 text-white" : ""
                        )}>
                          {count}
                        </Badge>
                      )}
                    </button>
                  </ScrollAnimation>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Individual Categories */}
      {!isSearching && (
        <section className="py-4 bg-muted/20 border-b sticky top-[73px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {regularCategories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                const count = getCategoryCount(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-full font-medium text-xs",
                      "transition-all duration-300 ease-out transform",
                      "hover:scale-105 active:scale-95",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{category.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        "text-[10px] px-1 rounded",
                        isActive ? "bg-primary-foreground/20" : "bg-muted"
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

      {/* Lab Templates */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollAnimation animation="fade-up" className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-3">
                {currentCategory && (
                  <div className={cn(
                    "p-2 rounded-lg",
                    currentCategory.featured
                      ? `bg-gradient-to-br ${currentCategory.color} text-white`
                      : "bg-primary/10 text-primary"
                  )}>
                    <currentCategory.icon className="h-6 w-6" />
                  </div>
                )}
                <h2 className="text-3xl font-bold">
                  {isSearching 
                    ? `Search Results for "${searchQuery}"` 
                    : currentCategory?.label}
                </h2>
              </div>
              {!isSearching && currentCategory && (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {currentCategory.description}
                </p>
              )}
              {isSearching && (
                <p className="text-muted-foreground">
                  Found {currentTemplates.length} matching template{currentTemplates.length !== 1 ? 's' : ''}
                </p>
              )}
            </ScrollAnimation>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="inline-block animate-pulse">Loading templates...</div>
              </div>
            ) : currentTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No templates found. Try a different search term or category.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTemplates.map((template: any, index) => {
                  const TemplateIcon = template.icon || currentCategory?.icon || Layers;
                  const templateColor = template.color || currentCategory?.color;
                  return (
                    <ScrollAnimation
                      key={`${activeCategory}-${index}`}
                      animation="fade-up"
                      delay={index * 50}
                    >
                      <Card 
                        className={cn(
                          "group border-2 hover:border-primary/20 h-full",
                          "transition-all duration-300 ease-out",
                          "hover:shadow-xl hover:-translate-y-2"
                        )}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg transition-all group-hover:scale-110",
                              templateColor
                                ? `bg-gradient-to-br ${templateColor} text-white`
                                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                            )}>
                              <TemplateIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors duration-300">
                                {template.name}
                              </CardTitle>
                              {isSearching && template.categoryLabel && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {template.categoryLabel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-sm leading-relaxed mb-4">
                            {template.description}
                          </CardDescription>
                          <Link to="/submit-request">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                            >
                              Request This Lab
                              <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </ScrollAnimation>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <ScrollAnimation animation="fade-up" delay={0}>
              <div className="text-4xl font-bold text-primary">{catalogEntries.length}+</div>
              <div className="text-sm text-muted-foreground">Lab Templates</div>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={100}>
              <div className="text-4xl font-bold text-primary">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </ScrollAnimation>
            <ScrollAnimation animation="fade-up" delay={200}>
              <div className="text-4xl font-bold text-primary">{featuredCategories.length}</div>
              <div className="text-sm text-muted-foreground">Technology Stacks</div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-foreground/10 to-transparent rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary-foreground/10 to-transparent rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite_3s]" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <ScrollAnimation animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a Custom Lab Environment?</h2>
            <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Our team can create custom lab configurations tailored to your specific training requirements.
            </p>
            <Link to="/submit-request">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Request a Custom Lab
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </ScrollAnimation>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="MakeMyLabs" className="h-8 w-auto" />
              <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} MakeMyLabs. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/lab-catalog" className="text-muted-foreground hover:text-foreground transition-colors">
                Full Catalog
              </Link>
              <Link to="/submit-request" className="text-muted-foreground hover:text-foreground transition-colors">
                Request Lab
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Catalog;
