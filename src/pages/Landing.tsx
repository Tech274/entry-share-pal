import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, PlusCircle, BookOpen, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicHeader from '@/components/PublicHeader';

const Landing = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Hi, how can we help you?
          </h1>
          
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Enter the search term here...."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-14 pl-5 pr-14 text-lg bg-background text-foreground rounded-lg border-0 shadow-lg"
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Action Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* View All Requests Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/my-requests">
                <CardHeader className="pb-2">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">View all requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Track all your request's progress and your interaction with the support team.
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>

            {/* Submit a Request Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/submit-request">
                <CardHeader className="pb-2">
                  <div className="w-16 h-16 rounded-lg bg-accent/50 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                    <PlusCircle className="h-8 w-8 text-accent-foreground" />
                  </div>
                  <CardTitle className="text-xl">Submit a request</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Describe your requirement by filling out the request form.
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>

            {/* MML Docs Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/docs">
                <CardHeader className="pb-2">
                  <div className="w-16 h-16 rounded-lg bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                    <BookOpen className="h-8 w-8 text-secondary-foreground" />
                  </div>
                  <CardTitle className="text-xl">MML Docs</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Access documentation, guides, and resources for MakeMyLabs platform.
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>

            {/* Lab Catalog Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <Link to="/lab-catalog">
                <CardHeader className="pb-2">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Layers className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Lab Catalog</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Browse pre-built lab environments and templates for your training needs.
                  </CardDescription>
                </CardContent>
              </Link>
            </Card>
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

export default Landing;
