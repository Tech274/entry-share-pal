import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Layers, Server, Cloud, Database, Shield, GitBranch, Cpu, Building2, Sparkles } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';

const EXTERNAL_CATALOG_URL = 'https://catalog.makemylabs.com';

const LabCatalog = () => {
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

      {/* Lab Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Lab Categories</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Cloud Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  AWS, Azure, GCP, and multi-cloud environments for hands-on cloud computing training.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center mb-4">
                  <Server className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">Infrastructure Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Virtualization, containerization, and infrastructure automation lab environments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg">Data & AI Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Database, analytics, machine learning, and AI/ML training environments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-lg">Security Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Cybersecurity, penetration testing, SOC training, and security compliance environments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <GitBranch className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">DevOps Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  CI/CD pipelines, Terraform, Ansible, Jenkins, and automation training environments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">Gen AI Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Generative AI, LLMs, prompt engineering, and AI application development labs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                  <Building2 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg">SAP Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  SAP S/4HANA, SAP BW, SAP ABAP, and enterprise resource planning training environments.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Oracle & OEM Labs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Oracle Database, Oracle Cloud, OEM, and enterprise database management training.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Labs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Lab Templates</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AWS Solutions Architect Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Complete AWS environment with VPC, EC2, S3, RDS, and IAM configurations for solutions architect training.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Kubernetes DevOps Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Multi-node Kubernetes cluster with CI/CD pipelines, monitoring, and logging stack pre-configured.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Azure Data Engineering Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Azure Synapse, Data Factory, Databricks, and Power BI integrated environment for data engineering courses.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Penetration Testing Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Isolated security lab with vulnerable systems, Kali Linux, and SIEM tools for ethical hacking training.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SAP S/4HANA Sandbox</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Full SAP S/4HANA environment with sample data for functional and technical training modules.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gen AI Development Lab</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  LLM integration environment with API access, vector databases, and RAG pipeline templates.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <a href={EXTERNAL_CATALOG_URL} target="_blank" rel="noopener noreferrer">
                Browse All Templates
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
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
