import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, MessageSquare, FileText, Bookmark, CheckCircle2, Shield, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation user={user} />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Bridging the Justice Gap</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Your Guide to Legal Clarity
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant answers to your legal questions, understand complex processes in simple language, 
            and take control of your legal journey with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/chat" : "/auth"}>
              <Button size="lg" className="gap-2 shadow-primary text-lg px-8">
                Start Free Consultation
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How JUSTICE PATH Helps You</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Simple, accessible tools designed for everyday people navigating the legal system
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI Legal Assistant</CardTitle>
              <CardDescription>
                Get instant answers to your legal questions in plain language, 24/7
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Legal Forms & Templates</CardTitle>
              <CardDescription>
                Access free legal forms and document templates for common needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Step-by-Step Guidance</CardTitle>
              <CardDescription>
                Follow clear, actionable steps for filing complaints, writing letters, and more
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Bookmark className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Save Your Progress</CardTitle>
              <CardDescription>
                Bookmark important information and track your legal journey over time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Multilingual Support</CardTitle>
              <CardDescription>
                Access legal help in English, Hindi, and other regional languages
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Scale className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>100% Free</CardTitle>
              <CardDescription>
                All features are completely free - making justice accessible to everyone
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-hero text-white shadow-primary">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of people who are taking control of their legal matters with confidence
            </p>
            <Link to={user ? "/chat" : "/auth"}>
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8">
                Start Your Legal Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">
              <strong>Disclaimer:</strong> JUSTICE PATH provides general legal information, not legal advice. 
              For specific legal issues, please consult a qualified lawyer.
            </p>
            <p className="text-sm">© 2025 JUSTICE PATH. Bridging the Justice Gap.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
