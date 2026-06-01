import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Github, Zap, Mail, ChevronRight, CheckCircle2 } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Security Analysis',
    description: 'Detect vulnerabilities, SQL injection, XSS, and OWASP Top 10 issues automatically.',
  },
  {
    icon: Zap,
    title: 'Performance Insights',
    description: 'Catch N+1 queries, memory leaks, and inefficient algorithms before they ship.',
  },
  {
    icon: Mail,
    title: 'Email Reports',
    description: 'Get detailed analysis reports sent directly to your inbox after every push.',
  },
];

const tiers = [
  { name: 'Free', price: '$0', repos: '3 repos', analyses: '100/month' },
  { name: 'Pro', price: '$19', repos: 'Unlimited', analyses: 'Unlimited' },
  { name: 'Team', price: '$49', repos: 'Unlimited', analyses: 'Unlimited + Orgs' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Bad Code Police</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-white text-black hover:bg-zinc-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm mb-6">
            <Zap className="h-4 w-4" />
            Powered by Gemini 2.0 Flash
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Your AI
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Code Reviewer</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Catch security vulnerabilities, performance issues, and code smells before they hit production. 
            Powered by AI, integrated with GitHub.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                <Github className="h-5 w-5" />
                Connect GitHub
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Catch Issues Before They Ship
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-b from-white/5 to-transparent p-6 rounded-xl border border-white/10"
              >
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 border-t border-white/10 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            {[
              { step: '1', title: 'Connect Your Repo', desc: 'Link your GitHub repository with one click' },
              { step: '2', title: 'Push Code', desc: 'Every push or PR triggers an AI analysis' },
              { step: '3', title: 'Get Insights', desc: 'Receive detailed reports with actionable fixes' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-6 rounded-xl border ${
                  tier.name === 'Pro'
                    ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-transparent'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">{tier.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== '$0' && <span className="text-zinc-400">/month</span>}
                </div>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    {tier.repos}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    {tier.analyses}
                  </li>
                </ul>
                <Button
                  className={`w-full mt-6 ${
                    tier.name === 'Pro'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-zinc-500 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Bad Code Police</span>
          </div>
          <div>© 2024 All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
