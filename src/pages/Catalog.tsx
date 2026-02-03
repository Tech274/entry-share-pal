import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layers, Server, Cloud, Database, Shield, GitBranch, Cpu, Building2, Sparkles, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLabCatalog, groupByCategory } from '@/hooks/useLabCatalog';
import { Link } from 'react-router-dom';
import logoImage from '@/assets/makemylabs-logo.png';

const categories = [
  { id: 'cloud', label: 'Cloud Labs', icon: Cloud },
  { id: 'infrastructure', label: 'Infrastructure', icon: Server },
  { id: 'data-ai', label: 'Data & AI', icon: Database },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'devops', label: 'DevOps', icon: GitBranch },
  { id: 'gen-ai', label: 'Gen AI', icon: Sparkles },
  { id: 'sap', label: 'SAP Labs', icon: Building2 },
  { id: 'oracle', label: 'Oracle & OEM', icon: Cpu },
];

const categoryDetails: Record<string, { description: string; templates: { name: string; description: string }[] }> = {
  cloud: {
    description: 'AWS, Azure, GCP, and multi-cloud environments for hands-on cloud computing training.',
    templates: [
      { name: 'AWS Solutions Architect Lab', description: 'Complete AWS environment with VPC, EC2, S3, RDS, and IAM configurations.' },
      { name: 'Azure Fundamentals Lab', description: 'Azure portal, virtual machines, storage accounts, and networking basics.' },
      { name: 'GCP Cloud Engineer Lab', description: 'Google Cloud Platform with Compute Engine, Cloud Storage, and BigQuery.' },
    ],
  },
  infrastructure: {
    description: 'Virtualization, containerization, and infrastructure automation lab environments.',
    templates: [
      { name: 'Docker & Containers Lab', description: 'Container orchestration with Docker, Docker Compose, and registry setup.' },
      { name: 'VMware vSphere Lab', description: 'Enterprise virtualization with ESXi hosts and vCenter management.' },
      { name: 'Linux Administration Lab', description: 'Multi-distro Linux environments for system administration training.' },
    ],
  },
  'data-ai': {
    description: 'Database, analytics, machine learning, and AI/ML training environments.',
    templates: [
      { name: 'Azure Data Engineering Lab', description: 'Azure Synapse, Data Factory, Databricks, and Power BI integrated environment.' },
      { name: 'Machine Learning Lab', description: 'Python ML stack with Jupyter, TensorFlow, PyTorch, and sample datasets.' },
      { name: 'Data Analytics Lab', description: 'SQL databases, ETL pipelines, and visualization tools for data analysis.' },
    ],
  },
  security: {
    description: 'Cybersecurity, penetration testing, SOC training, and security compliance environments.',
    templates: [
      { name: 'Penetration Testing Lab', description: 'Isolated security lab with vulnerable systems, Kali Linux, and SIEM tools.' },
      { name: 'SOC Analyst Lab', description: 'Security operations center with log analysis, threat detection, and incident response.' },
      { name: 'Cloud Security Lab', description: 'Cloud security posture management and compliance training environment.' },
    ],
  },
  devops: {
    description: 'CI/CD pipelines, Terraform, Ansible, Jenkins, and automation training environments.',
    templates: [
      { name: 'Kubernetes DevOps Lab', description: 'Multi-node Kubernetes cluster with CI/CD pipelines, monitoring, and logging.' },
      { name: 'Terraform & IaC Lab', description: 'Infrastructure as Code with Terraform, Ansible, and cloud provider integrations.' },
      { name: 'Jenkins Pipeline Lab', description: 'Complete Jenkins setup with pipeline examples and integration with Git.' },
    ],
  },
  'gen-ai': {
    description: 'Generative AI, LLMs, prompt engineering, and AI application development labs.',
    templates: [
      { name: 'Gen AI Development Lab', description: 'LLM integration environment with API access, vector databases, and RAG pipelines.' },
      { name: 'Prompt Engineering Lab', description: 'Hands-on prompt design and optimization for various AI models.' },
      { name: 'AI Agents Lab', description: 'Build and deploy autonomous AI agents with tool integrations.' },
    ],
  },
  sap: {
    description: 'SAP S/4HANA, SAP BW, SAP ABAP, and enterprise resource planning training environments.',
    templates: [
      { name: 'SAP S/4HANA Sandbox', description: 'Full SAP S/4HANA environment with sample data for functional training.' },
      { name: 'SAP ABAP Development Lab', description: 'ABAP development environment with Eclipse ADT and debugging tools.' },
      { name: 'SAP BW/4HANA Lab', description: 'Business Warehouse environment for data modeling and reporting.' },
    ],
  },
  oracle: {
    description: 'Oracle Database, Oracle Cloud, OEM, and enterprise database management training.',
    templates: [
      { name: 'Oracle DBA Lab', description: 'Oracle Database administration with RAC, Data Guard, and OEM management.' },
      { name: 'Oracle Cloud Infrastructure Lab', description: 'OCI compute, networking, and database services training environment.' },
      { name: 'Oracle Fusion Lab', description: 'Oracle Fusion applications and middleware training environment.' },
    ],
  },
};

const features = [
  { icon: CheckCircle2, title: 'Pre-configured Environments', description: 'Ready-to-use lab setups with all tools pre-installed' },
  { icon: CheckCircle2, title: 'Scalable Infrastructure', description: 'From single user to thousands of concurrent learners' },
  { icon: CheckCircle2, title: 'Enterprise Security', description: 'Isolated environments with data protection' },
  { icon: CheckCircle2, title: '24/7 Support', description: 'Round-the-clock technical assistance' },
];

const Catalog = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>('cloud');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: catalogEntries = [], isLoading } = useLabCatalog();
  
  const dbTemplatesByCategory = groupByCategory(catalogEntries);
  
  const getMergedTemplates = (categoryId: string) => {
    const dbTemplates = dbTemplatesByCategory[categoryId] || [];
    const staticTemplates = categoryDetails[categoryId]?.templates || [];
    return dbTemplates.length > 0 ? dbTemplates : staticTemplates;
  };

  const allTemplates = useMemo(() => {
    return categories.flatMap(cat => {
      const templates = getMergedTemplates(cat.id);
      return templates.map(t => ({ ...t, category: cat.id, categoryLabel: cat.label }));
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
  const currentDescription = !isSearching && activeCategory ? categoryDetails[activeCategory]?.description || '' : '';
  const currentTemplates = isSearching ? (searchResults || []) : (activeCategory ? getMergedTemplates(activeCategory) : []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImage} alt="MakeMyLabs" className="h-8 w-auto" />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-foreground">MML Labs</span>
              <span className="text-xs text-muted-foreground block">Lab Catalog</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/lab-catalog">
              <Button variant="ghost" size="sm">Browse All Labs</Button>
            </Link>
            <Link to="/submit-request">
              <Button size="sm">Request a Lab</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full mb-6">
              <Layers className="h-5 w-5" />
              <span className="text-sm font-medium">Enterprise Lab Solutions</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              MML Labs Catalog
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
              Discover our comprehensive collection of pre-built, enterprise-ready lab environments for training, development, and certification preparation.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search labs by name, technology, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) setActiveCategory(null);
                  else setActiveCategory('cloud');
                }}
                className="pl-12 h-14 text-lg bg-background text-foreground rounded-full shadow-lg"
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
              <div key={idx} className="flex items-start gap-3">
                <feature.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      {!isSearching && (
        <section className="py-6 bg-background border-b sticky top-[73px] z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all text-sm",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
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
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">
                {isSearching 
                  ? `Search Results for "${searchQuery}"` 
                  : categories.find(c => c.id === activeCategory)?.label}
              </h2>
              {!isSearching && (
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  {currentDescription}
                </p>
              )}
              {isSearching && (
                <p className="text-muted-foreground">
                  Found {currentTemplates.length} matching template{currentTemplates.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading templates...</div>
            ) : currentTemplates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No templates found. Try a different search term.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentTemplates.map((template: any, index) => (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                      </div>
                      {isSearching && template.categoryLabel && (
                        <span className="text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-full w-fit font-medium">
                          {template.categoryLabel}
                        </span>
                      )}
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed mb-4">
                        {template.description}
                      </CardDescription>
                      <Link to="/submit-request">
                        <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Request This Lab
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need a Custom Lab Environment?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8">
            Can't find what you're looking for? Our team can create custom lab environments tailored to your specific training requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit-request">
              <Button size="lg" variant="secondary" className="min-w-[200px]">
                Submit a Request
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button size="lg" variant="outline" className="min-w-[200px] border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="MakeMyLabs" className="h-6 w-auto" />
              <span className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} MakeMyLabs. All rights reserved.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/lab-catalog" className="hover:text-foreground transition-colors">Full Catalog</Link>
              <Link to="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
              <Link to="/submit-request" className="hover:text-foreground transition-colors">Request Lab</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Catalog;
