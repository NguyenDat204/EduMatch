import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Download, 
  Share2, 
  Zap,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../layouts';
import { CareerCard } from '../components/ui';
import axios from 'axios';

interface IndustryResult {
  archetype: string;
  description: string;
  suitabilityScore: number;
  careers: any[];
  insights: string;
}

export const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<IndustryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const surveyData = location.state;
        if (!surveyData) {
          // If no data, maybe they didn't complete the survey
          setError("No survey data found. Please complete the assessment first.");
          setLoading(false);
          return;
        }

        const response = await axios.post('http://localhost:5000/api/recommendations', surveyData);
        setResult(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("AI analysis failed. Please make sure the backend is running and API key is set.");
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [location.state]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-16 h-16 text-primary-600 animate-spin mb-6" />
          <h2 className="text-2xl font-bold animate-pulse">AI is analyzing your profile...</h2>
          <p className="text-slate-500 mt-2">Mapping your personality against millions of career data points.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto text-center py-20">
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl mb-8">
            <h2 className="text-2xl font-bold mb-4">Analysis Interrupted</h2>
            <p className="mb-6">{error}</p>
            <button 
              onClick={() => navigate('/survey')}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!result) return null;

  return (
    <DashboardLayout>
      <div className="space-y-12 pb-20">
        {/* Result Hero */}
        <header className="relative py-16 px-10 glass rounded-[3rem] border-none shadow-premium overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                <Zap size={14} fill="currentColor" />
                Analysis Complete
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-6 leading-tight">
                Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">Career Archetype</span> is {result.archetype}.
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
                {result.description} Based on your profile, we've identified {result.careers.length} high-suitability career paths.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button className="px-8 py-4 premium-gradient text-white rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                  <Download size={18} />
                  Download Report
                </button>
                <button className="px-8 py-4 glass rounded-2xl font-bold flex items-center gap-2 border-none transition-all hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 premium-gradient rounded-full blur-3xl opacity-20 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              <div className="glass w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center border-none shadow-premium relative">
                <div className="text-center">
                  <div className="text-5xl md:text-7xl font-display font-black text-primary-600">{result.suitabilityScore}%</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">Match Score</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Top Recommendations</h2>
              <button 
                onClick={() => navigate('/survey')}
                className="flex items-center gap-2 text-primary-600 font-bold hover:underline"
              >
                Recalculate
                <Sparkles size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {result.careers.map((career, idx) => (
                <CareerCard key={idx} career={{...career, id: String(idx)}} />
              ))}
            </div>
          </div>

          {/* Side Analysis */}
          <div className="space-y-10">
            <h2 className="text-3xl font-bold">AI Prediction</h2>
            <div className="glass p-8 rounded-[2.5rem] border-none shadow-premium space-y-8">
              <div className="pt-2">
                <h4 className="font-bold mb-4">Deep Insight</h4>
                <p className="text-sm text-slate-500 italic leading-relaxed">
                  "{result.insights}"
                </p>
              </div>
              
              <div className="p-6 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                <h4 className="font-bold mb-2 text-primary-700">Next Steps</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Review university programs
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Connect with industry mentors
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                    Take specialized skill tests
                  </li>
                </ul>
              </div>
            </div>

            <div className="premium-gradient p-1 rounded-[2.5rem] shadow-xl group">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.4rem] h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-4">Want more insights?</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    Unlock deep-dive skill analysis and unlimited AI advisor interaction with EduMatch Pro.
                  </p>
                </div>
                <button className="w-full py-4 premium-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:scale-105 transition-all">
                  Go Pro
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
