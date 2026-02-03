import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ExternalLink, BookOpen, FileText, HelpCircle, Zap } from 'lucide-react';
import logo from '@/assets/makemylabs-logo.png';

const EXTERNAL_DOCS_URL = 'https://docs.makemylabs.com'; // Update this with actual external docs URL

const Docs = () => {
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
          <BookOpen className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            MakeMyLabs Documentation
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Everything you need to know about using the MakeMyLabs platform, from submitting requests to tracking your labs.
          </p>
          <Button 
            variant="secondary" 
            size="lg" 
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href={EXTERNAL_DOCS_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-5 w-5 mr-2" />
              View Full Documentation
            </a>
          </Button>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Start Guide</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">1. Submit a Request</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Fill out the request form with your lab requirements including client details, dates, and specifications.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-lg">2. Track Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Use your email to look up and track the status of all your submitted requests in real-time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-lg">3. Get Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Contact our support team for any questions or issues with your lab environment setup.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How long does it take to set up a lab?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Lab setup times vary depending on complexity. Standard labs are typically ready within 24-48 hours, while custom environments may take 3-5 business days.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I extend my lab duration?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Yes, you can request an extension by submitting a new request referencing your original Potential ID. Extensions are subject to availability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What cloud platforms are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  MakeMyLabs supports AWS, Azure, GCP, and other major cloud platforms. Specify your preferred cloud provider in your request.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <a href={EXTERNAL_DOCS_URL} target="_blank" rel="noopener noreferrer">
                View More FAQs
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

export default Docs;
