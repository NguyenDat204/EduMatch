// Enhanced Dashboard Component with Analytics
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui';
import { 
  TrendingUp, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';

export const EnhancedDashboard = () => {
  const [metrics, setMetrics] = useState({
    assessmentProgress: 65,
    recommendationsGenerated: 3,
    favoriteCount: 5,
    streakDays: 12
  });

  const cards = [
    {
      icon: Brain,
      title: "Personality Score",
      value: "INTJ",
      subtitle: "Based on your assessment",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Target,
      title: "Career Matches",
      value: "8+",
      subtitle: "Recommended for you",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Skill Readiness",
      value: "72%",
      subtitle: "For target career",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Daily Streak",
      value: `${metrics.streakDays}d`,
      subtitle: "Keep it going!",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Progress Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20"
      >
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Assessment Progress
          </h3>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metrics.assessmentProgress}%` }}
              transition={{ duration: 1, type: "spring" }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {metrics.assessmentProgress}% Complete • Only {100 - metrics.assessmentProgress}% left to unlock full recommendations
          </p>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">{card.subtitle}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/50 p-6 text-center cursor-pointer hover:shadow-lg transition-all">
          <h4 className="font-semibold text-primary mb-2">View Recommendations</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            See 8 career paths recommended by AI based on your profile
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-accent/20 to-green-500/20 border-accent/50 p-6 text-center cursor-pointer hover:shadow-lg transition-all">
          <h4 className="font-semibold text-accent mb-2">Analyze Skill Gaps</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            See what skills you need to master your target career
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedDashboard;
