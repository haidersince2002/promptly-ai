import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <div className="px-4 sm:px-20 xl:px-32 pt-32 pb-24">
      {/* Badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 dark:bg-primary/20 px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="w-4 h-4" /> Powered by Gemini 2.5 Flash
        </span>
      </div>

      {/* Headline */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
          Create content that
          <br />
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            actually matters
          </span>
        </h1>
        <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          6 AI tools in one platform. Write articles, generate images, remove backgrounds,
          review resumes — all powered by cutting-edge AI models.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <button
          onClick={() => navigate("/ai")}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl hover:bg-primary/90 transition cursor-pointer font-medium shadow-lg shadow-primary/20"
        >
          Start creating <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate("/pricing")}
          className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-8 py-3.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-primary/30 transition cursor-pointer font-medium"
        >
          View pricing
        </button>
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-14 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4.5 h-4.5 text-green-500" />
          <span>Secure authentication</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-4.5 h-4.5 text-amber-500" />
          <span>Instant AI responses</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-primary" />
          <span>Free to start</span>
        </div>
      </div>
    </div>
  );
};

export default Hero;
