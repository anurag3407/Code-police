'use client';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  CheckCircle2, 
  Users, 
  FolderGit2,
  Activity
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For individual developers',
    features: [
      '3 repositories',
      '100 analyses per month',
      'Basic email reports',
      'Community support',
    ],
    current: true,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'For serious developers',
    features: [
      'Unlimited repositories',
      'Unlimited analyses',
      'Priority email reports',
      'Advanced rule profiles',
      'Slack integration',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Team',
    price: '$49',
    period: 'per month',
    description: 'For development teams',
    features: [
      'Everything in Pro',
      'Team organizations',
      'Role-based access',
      'Audit logs',
      'Custom integrations',
      'Dedicated support',
    ],
  },
];

export default function BillingPage() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-zinc-400">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current Plan */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-400" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Free Plan</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-zinc-400 mt-1">
                Perfect for getting started with code analysis
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
              Upgrade
            </Button>
          </div>

          <Separator className="bg-white/10" />

          {/* Usage Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <FolderGit2 className="h-4 w-4" />
                <span className="text-sm">Repositories</span>
              </div>
              <div className="text-2xl font-bold text-white">2 / 3</div>
              <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full w-2/3 bg-blue-500 rounded-full" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Analyses</span>
              </div>
              <div className="text-2xl font-bold text-white">47 / 100</div>
              <div className="h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                <div className="h-full w-1/2 bg-blue-500 rounded-full" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Team Members</span>
              </div>
              <div className="text-2xl font-bold text-white">1</div>
              <p className="text-xs text-zinc-500 mt-2">Upgrade for more</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`bg-[#0a0a0a] ${
                plan.popular
                  ? 'border-blue-500 ring-1 ring-blue-500/20'
                  : 'border-white/10'
              }`}
            >
              <CardHeader>
                {plan.popular && (
                  <Badge className="w-fit bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
                    Most Popular
                  </Badge>
                )}
                <CardTitle className="text-white">{plan.name}</CardTitle>
                <CardDescription className="text-zinc-500">
                  {plan.description}
                </CardDescription>
                <div className="pt-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.current
                      ? 'bg-white/10 text-zinc-400'
                      : plan.popular
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <Card className="bg-[#0a0a0a] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Payment Method</CardTitle>
          <CardDescription className="text-zinc-500">
            Add a payment method to upgrade your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10">
            <CreditCard className="h-4 w-4" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
