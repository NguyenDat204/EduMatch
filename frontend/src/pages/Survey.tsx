import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/Button";
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Lightbulb,
    ExternalLink,
    Code,
    Palette,
    Stethoscope,
    CircleDollarSign,
    Cpu,
    Scale
} from "lucide-react";

const steps = ["BASIC INFO", "INTERESTS", "ACADEMIC", "PERSONAL"];
const currentStepIndex = 1; // Interests is step 2

const interests = [
    { id: "tech", label: "Technology", icon: <Code className="w-6 h-6" /> },
    { id: "arts", label: "Digital Arts", icon: <Palette className="w-6 h-6" /> },
    { id: "health", label: "Healthcare", icon: <Stethoscope className="w-6 h-6" /> },
    { id: "finance", label: "Finance", icon: <CircleDollarSign className="w-6 h-6" /> },
    { id: "eng", label: "Engineering", icon: <Cpu className="w-6 h-6" /> },
    { id: "law", label: "Law & Justice", icon: <Scale className="w-6 h-6" /> },
];

export function Survey() {
    const [selectedInterests, setSelectedInterests] = useState<string[]>(["tech", "finance"]);

    const toggleInterest = (id: string) => {
        setSelectedInterests(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-display">
            {/* Minimal Header for Survey */}
            <header className="bg-white border-b border-slate-100 py-4 px-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="bg-primary text-white p-2 rounded-xl">
                            <Scale className="w-5 h-5 rotate-12" />
                        </div>
                        <span className="text-xl font-black tracking-tighter">EduMatch</span>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        {["Home", "Pathways", "Mentors"].map((item) => (
                            <a key={item} href="#" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                                {item}
                            </a>
                        ))}
                    </nav>

                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full object-cover" />
                    </div>
                </div>
            </header>

            <main className="flex-grow py-12 px-4 md:px-6">
                <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

                    {/* Left: Survey Content */}
                    <div className="w-full lg:flex-grow flex flex-col gap-8">
                        {/* Progress Indicator */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Step 2 of 4</p>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Interests & Passions</h2>
                                </div>
                                <p className="text-xs font-bold text-slate-400">50% Completed</p>
                            </div>
                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "50%" }}
                                    className="h-full bg-primary"
                                />
                            </div>
                            <div className="flex justify-between">
                                {steps.map((step, i) => (
                                    <p key={step} className={`text-[10px] font-black tracking-widest ${i === currentStepIndex ? 'text-primary' : 'text-slate-300'}`}>
                                        {step}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.03)] text-center">
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">What sparks your curiosity?</h3>
                            <p className="text-slate-500 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
                                Select at least 3 fields that interest you. This helps our AI narrow down your perfect career match.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16">
                                {interests.map((item) => {
                                    const isSelected = selectedInterests.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleInterest(item.id)}
                                            className={`relative group p-8 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-4 ${isSelected
                                                ? 'border-primary bg-blue-50/30'
                                                : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'
                                                }`}
                                        >
                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        className="absolute top-3 right-3 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg"
                                                    >
                                                        <Check className="w-3.5 h-3.5" strokeWidth={4} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                                                }`}>
                                                {item.icon}
                                            </div>
                                            <span className={`text-sm font-black transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                                                {item.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-slate-50">
                                <button className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition-colors py-2 px-4">
                                    <ChevronLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <Button
                                    className="h-14 px-10 rounded-2xl gap-2 font-black shadow-xl shadow-primary/20"
                                    disabled={selectedInterests.length < 3}
                                    onClick={() => window.location.href = '/result'}
                                >
                                    Continue
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right: AI Eddie Sidebar */}
                    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
                        {/* Eddie Card */}
                        <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 group-hover:scale-110 transition-transform">
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Eddie" alt="Eddie" />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm">Eddie</p>
                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Career Guide AI</p>
                                    </div>
                                </div>
                                <blockquote className="italic font-medium leading-relaxed text-blue-50/90 mb-6">
                                    "Great start! Understanding your interests is the first step to your dream career. Did you know most Gen Z pros change paths 3 times before 30? It's okay to be curious!"
                                </blockquote>
                            </div>
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <Scale className="w-32 h-32 -mr-8 -mt-8 rotate-12" />
                            </div>
                        </div>

                        {/* Pro Tip Card */}
                        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                            <div className="flex items-center gap-3 text-primary mb-4">
                                <div className="bg-primary/10 p-2 rounded-xl">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <h4 className="font-black text-slate-900">Pro Tip</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                Don't limit yourself! You can select multiple fields. Our algorithm finds the intersection where your skills meet your passions.
                            </p>
                        </div>

                        {/* Help Link */}
                        <div className="bg-blue-50/30 rounded-[1.5rem] border border-blue-50 border-dashed p-6 text-center">
                            <p className="text-xs font-bold text-slate-400 mb-3">Need help?</p>
                            <a href="#" className="flex items-center justify-center gap-2 text-primary font-black text-sm hover:underline group">
                                Chat with a mentor
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-12 border-t border-slate-100 bg-white text-center">
                <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">
                    © 2024 EDUMATCH CAREER ORIENTATION
                </p>
            </footer>
        </div>
    );
}
