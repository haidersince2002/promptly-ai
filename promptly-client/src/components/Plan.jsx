import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["10 AI generations", "Basic dashboard", "Community access"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Premium",
    price: "₹399",
    period: "/month",
    features: [
      "Unlimited generations",
      "Image generation",
      "Background/object removal",
      "Resume review",
      "Prompt improvement",
      "All templates",
    ],
    cta: "View Pricing",
    highlight: true,
  },
];

const Plan = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto my-24 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-white">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-md mx-auto">
          Start free. Upgrade when you're ready for more.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-7 flex flex-col ${
              plan.highlight
                ? "border-primary/30 dark:border-primary/40 bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 shadow-lg"
                : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            }`}
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{plan.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{plan.price}</span>
              <span className="text-gray-400 text-sm">{plan.period}</span>
            </div>
            <ul className="mt-6 space-y-2.5 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate(plan.highlight ? "/pricing" : "/ai")}
              className={`mt-7 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer transition ${
                plan.highlight
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
              }`}
            >
              {plan.cta} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Plan;
