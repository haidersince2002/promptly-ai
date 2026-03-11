import { ArrowRight, Edit, Hash, Image, Eraser, Scissors, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

const steps = [
  { num: "01", title: "Sign up for free", desc: "Create your account in seconds with Google or email." },
  { num: "02", title: "Choose an AI tool", desc: "Pick from 6 tools — articles, titles, images, and more." },
  { num: "03", title: "Get instant results", desc: "AI generates content in seconds. Export, copy, or regenerate." },
];

const tools = [
  { icon: Edit, label: "Write Article", color: "#4A7AFF" },
  { icon: Hash, label: "Blog Titles", color: "#8e37eb" },
  { icon: Image, label: "Generate Images", color: "#00ad25" },
  { icon: Eraser, label: "Remove BG", color: "#ff4938" },
  { icon: Scissors, label: "Remove Object", color: "#4a7aff" },
  { icon: FileText, label: "Resume Review", color: "#00da83" },
];

const HowItWorks = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="px-4 sm:px-20 xl:px-32 py-24">
      {/* How it works */}
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
          How it works
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-md mx-auto">
          Three simple steps to AI-powered content.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-24">
        {steps.map((s) => (
          <div key={s.num} className="text-center">
            <span className="text-4xl font-black text-primary/20 dark:text-primary/30">{s.num}</span>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mt-2">{s.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* All tools strip */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
          All tools at a glance
        </h2>
      </div>
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        {tools.map((t) => (
          <div key={t.label}
            className="flex items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-sm hover:-translate-y-0.5 transition cursor-pointer"
            onClick={() => user && navigate("/ai")}
          >
            <t.icon className="w-5 h-5" style={{ color: t.color }} />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <button
          onClick={() => navigate(user ? "/ai" : "/pricing")}
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl hover:bg-primary/90 transition cursor-pointer font-medium shadow-lg shadow-primary/20"
        >
          {user ? "Go to Dashboard" : "Get started for free"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default HowItWorks;