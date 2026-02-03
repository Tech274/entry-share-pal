import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ExternalLink, Layers, Server, Cloud, Database } from 'lucide-react';
import logo from '@/assets/makemylabs-logo.png';

const EXTERNAL_CATALOG_URL = 'https://catalog.makemylabs.com'; // Update this with actual external catalog URL

const LabCatalog = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MakeMyLabs" className="h-8 object-contain" />
              <span className="font-semibold text-lg hidden sm:inline">MakeMyLabs</span>
            </div>

            <nav className="flex items-center gap-1">
              <Button variant="ghost" asChild className="font-medium">
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild className="font-medium">
                <Link to="/my-requests">My Requests</Link>
              </Button>
              <Button variant="ghost" asChild className="font-medium">
                <Link to="/docs">Docs</Link>
              </Button>
              <Button variant="ghost" asChild className="font-medium">
                <Link to="/lab-catalog">Lab Catalog</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/submit-request">Submit a Request</Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="ml-2">
                <Link to="/auth">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

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
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
          </div>
        </div>
      </section>

      {/* Popular Labs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Lab Templates</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
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
