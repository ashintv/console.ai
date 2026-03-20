'use client';

import Link from 'next/link';
import { ArrowRight, Code2, Shield, Zap, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Zap,
      title: 'Real-time Tracking',
      description: 'Monitor errors as they happen with instant notifications and detailed stack traces.',
    },
    {
      icon: Code2,
      title: 'AI Analysis',
      description: 'Get intelligent insights and suggested fixes powered by advanced AI models.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and secure. Full control over your error logs.',
    },
  ];

  const plans = [
    {
      name: 'Startup',
      price: '$29',
      description: 'Perfect for small projects',
      features: ['Up to 50K events/month', 'Basic analytics', 'Email support', '1 project'],
    },
    {
      name: 'Professional',
      price: '$99',
      description: 'For growing teams',
      features: [
        'Up to 500K events/month',
        'Advanced analytics',
        'Priority support',
        '10 projects',
        'Custom alerts',
      ],
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited events',
        'Advanced analytics',
        '24/7 support',
        'Unlimited projects',
        'Custom integrations',
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col w-full">
      {/* Hero Section Header */}
      <header className="border-b border-border sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-screen-2xl px-4 flex h-14 items-center">
            <div className="mr-4 flex">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <span className="font-bold text-xl">Console AI</span>
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Link href="/login">
                <Button size="sm">
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="w-full flex justify-center">
          <div className="w-full max-w-screen-2xl px-4 flex flex-col items-center gap-4 py-24 md:py-32">
            <Badge>🚀 Now in Beta</Badge>
            <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
              <h1 className="text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-7xl lg:leading-[1.1]">
                Error Tracking with
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent">
                  {' '}
                  AI-Powered Analysis
                </span>
              </h1>
              <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                Track, analyze, and resolve errors faster with AI-powered insights. Professional
                error monitoring for modern applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg">Start Tracking</Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full flex justify-center">
          <div className="w-full max-w-screen-2xl px-4 py-24 md:py-32">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              Powerful Features
            </h2>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border bg-muted/50 w-full flex justify-center">
          <div className="w-full max-w-screen-2xl px-4 py-24 md:py-32">
            <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
              Simple, Transparent Pricing
            </h2>
            <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <Card key={plan.name} className={plan.popular ? 'border-primary relative' : ''}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.price !== 'Custom' && <span className="text-muted-foreground">/month</span>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/login">
                      <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border w-full flex justify-center">
          <div className="w-full max-w-screen-2xl px-4 flex flex-col items-center gap-4 py-24 text-center md:py-32">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to get started?
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-lg">
              Start tracking errors and get AI-powered insights in minutes.
            </p>
            <Link href="/login">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 md:py-0 bg-muted/30 w-full">
        <div className="w-full flex justify-center">
          <div className="w-full max-w-screen-2xl px-4 flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2024 Console AI. Built with Next.js and shadcn/ui
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
