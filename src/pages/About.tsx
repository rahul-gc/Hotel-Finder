import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Heart, Sparkles, Globe, Award, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import logoImg from "/logo.png";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="Nepal Hotels" className="h-8 w-8 rounded-lg" />
            <span className="font-semibold text-foreground">About Us</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="container relative py-20 text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
            <Sparkles className="mr-1 h-3.5 w-3.5" />
            Est. 2026
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Nepal Hotels Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connecting travelers with Nepal's finest verified hotels. 
            Your trusted companion for discovering authentic Nepali hospitality.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To make hotel discovery in Nepal seamless and trustworthy. 
                Every hotel on our platform is manually verified to ensure 
                quality, authenticity, and exceptional guest experiences.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To become Nepal's most trusted hotel booking platform, 
                promoting local hospitality while helping travelers find 
                their perfect stay across the Himalayas.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">15+</p>
              <p className="text-sm text-muted-foreground mt-1">Verified Hotels</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">4</p>
              <p className="text-sm text-muted-foreground mt-1">Cities Covered</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">12K+</p>
              <p className="text-sm text-muted-foreground mt-1">Happy Travelers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground mt-1">Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="container py-20">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1.5">
            Meet the Founder
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold">The Person Behind Nepal Hotels</h2>
        </div>

        <Card className="max-w-2xl mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 mx-auto rounded-full bg-primary flex items-center justify-center ring-4 ring-background shadow-2xl">
                  <span className="text-5xl font-bold text-primary-foreground">R</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mt-6">Rahul GC</h3>
              <p className="text-muted-foreground">Founder & Developer</p>
              
              <Separator className="my-6" />
              
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-background/80">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">+977 9805202556</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-lg bg-background/80">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">gcrahul561@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-lg bg-background/80">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-medium">Nepal</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/50 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Nepal Hotels Finder?</h2>
            <p className="text-muted-foreground mt-2">What makes us different</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Verified Hotels Only",
                desc: "Every hotel is manually verified for quality and authenticity before listing.",
                icon: Award
              },
              {
                title: "Best Price Guarantee",
                desc: "We ensure you get the best rates directly from hotel owners.",
                icon: Heart
              },
              {
                title: "24/7 Support",
                desc: "Our team is always available to help with your booking needs.",
                icon: Users
              }
            ].map((item, i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have questions or want to list your hotel? We'd love to hear from you!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:gcrahul561@gmail.com">
              <Button size="lg" className="gap-2">
                <Mail className="h-5 w-5" />
                Email Us
              </Button>
            </a>
            <a href="tel:+9779805202556">
              <Button size="lg" variant="outline" className="gap-2">
                <Phone className="h-5 w-5" />
                Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoImg} alt="Nepal Hotels" className="h-8 w-8 rounded-lg" />
            <span className="font-bold">Nepal Hotels Finder</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with <Heart className="h-4 w-4 inline text-red-500" /> by Rahul GC
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2026 Nepal Hotels Finder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
