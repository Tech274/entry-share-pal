import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Layers, Server, Cloud, Database, Shield, GitBranch, Cpu, Building2, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import { cn } from '@/lib/utils';

const EXTERNAL_CATALOG_URL = 'https://catalog.makemylabs.com';

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

const LabCatalog = () => {
  const [activeCategory, setActiveCategory] = useState('cloud');
  const currentCategory = categoryDetails[activeCategory];

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
            Browse our comprehensive catalog of pre-built lab environments, templates, and configurations for your training needs.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href={EXTERNAL_CATALOG_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5 mr-2" />
              View Full Catalog
            </a>
          </Button>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-8 bg-primary">
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
                    "flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all text-sm",
                    isActive
                      ? "bg-background text-foreground shadow-md"
                      : "bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Category Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-3">
                {categories.find(c => c.id === activeCategory)?.label}
              </h2>
              <p className="text-muted-foreground text-lg">
                {currentCategory.description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {currentCategory.templates.map((template, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {template.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-10">
              <Button variant="outline" asChild>
                <a href={EXTERNAL_CATALOG_URL} target="_blank" rel="noopener noreferrer">
                  View All {categories.find(c => c.id === activeCategory)?.label} Templates
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
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
