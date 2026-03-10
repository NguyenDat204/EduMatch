import { Check, Star, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../layouts';

export const Upgrade = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for initial discovery.",
      features: [
        "Basic Career Assessment",
        "Top 3 Career Matches",
        "Limited AI Chat (5 msgs/day)",
        "Public University Info"
      ],
      current: true
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "Complete career mastery.",
      features: [
        "Full Skill Gap Analysis",
        "Unlimited AI Advisor Chat",
        "Custom Career Roadmaps",
        "Priority University Support",
        "Exclusive Webinars",
        "Ad-free Experience"
      ],
      featured: true
    },
    {
      name: "School",
      price: "Custom",
      description: "For institutions and groups.",
      features: [
        "Everything in Pro",
        "Student Progress Tracking",
        "Group Analytics",
        "Bulk Licensing",
        "Dedicated Support"
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-16 pb-20">
        <header className="text-center max-w-2xl mx-auto py-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-amber-100 dark:border-amber-900/30">
            <Sparkles size={14} fill="currentColor" />
            Unlock Your Full Potential
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black mb-6">Choose the path that <span className="text-primary-600">fits you best</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
            Upgrade to Pro to get deep-dive insights and unlimited access to your personal AI career consultant.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 ${plan.featured ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl scale-105 z-10' : 'glass border-none shadow-premium hover:shadow-premium-hover'}`}
            >
              {plan.featured && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 premium-gradient text-white rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  {plan.period && <span className="text-sm opacity-60 font-medium">{plan.period}</span>}
                </div>
                <p className={`text-sm mt-4 leading-relaxed ${plan.featured ? 'opacity-80' : 'text-slate-500'}`}>{plan.description}</p>
              </div>

              <ul className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`mt-1 p-0.5 rounded-full ${plan.featured ? 'bg-primary-500 text-white' : 'bg-primary-50 text-primary-600'}`}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${plan.featured ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30 hover:bg-primary-500' : plan.current ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white'}`}>
                {plan.current ? 'Current Plan' : plan.name === 'School' ? 'Talk to Sales' : 'Get Started'}
                {!plan.current && <ArrowRight size={18} />}
              </button>
            </div>
          ))}
        </div>

        {/* Security & Support */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
          <div className="flex items-center gap-6 p-8 glass rounded-3xl border-none shadow-premium">
            <div className="w-14 h-14 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-600 shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-lg">Secure Payments</h4>
              <p className="text-sm text-slate-500">We use top-tier encryption to process your payments safely via Stripe or PayOS.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 p-8 glass rounded-3xl border-none shadow-premium">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 shrink-0">
              <Star size={28} />
            </div>
            <div>
              <h4 className="font-bold mb-1 text-lg">Money-back Guarantee</h4>
              <p className="text-sm text-slate-500">Not satisfied? Get a full refund within 14 days of your purchase, no questions asked.</p>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};
