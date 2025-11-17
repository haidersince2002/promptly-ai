import React from "react";
import { PricingTable } from "@clerk/clerk-react";

// Read toggle from Vite env (default false)
const billingEnabled =
  (import.meta.env.VITE_ENABLE_CLERK_BILLING || "").toString().toLowerCase() ===
  "true";

const plans = [
  {
    name: "Free",
    price: "$0",
    tagline: "Get started",
    features: [
      "Generate up to 10 articles/titles total",
      "Limited resume reviews",
      "Basic dashboard",
      "Community browsing",
    ],
    cta: "Included",
  },
  {
    name: "Premium",
    price: "$9/mo",
    tagline: "Unlock everything",
    features: [
      "Unlimited article & title generation",
      "AI Image generation",
      "Background/object removal",
      "Unlimited resume reviews",
      "Priority processing",
    ],
    cta: "Coming Soon",
  },
];

const FallbackPricing = () => (
  <div className="grid gap-6 sm:grid-cols-2">
    {plans.map((p) => (
      <div
        key={p.name}
        className="border rounded-xl p-6 bg-white/60 backdrop-blur shadow-sm flex flex-col"
      >
        <h3 className="text-xl font-semibold text-slate-700">{p.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{p.tagline}</p>
        <div className="mt-4 text-3xl font-bold text-slate-800">{p.price}</div>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 flex-1">
          {p.features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <span className="h-2 w-2 mt-2 rounded-full bg-indigo-500"></span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          disabled
          className="mt-6 py-2.5 rounded-lg bg-indigo-500/40 text-white text-sm font-medium cursor-not-allowed"
        >
          {p.cta}
        </button>
      </div>
    ))}
    <p className="sm:col-span-2 text-center text-xs text-gray-500">
      Billing is disabled in your Clerk dashboard. Enable it to show the live
      PricingTable.
    </p>
  </div>
);

const Plan = () => {
  return (
    <div className="max-w-5xl mx-auto z-20 my-30 px-4">
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Choose Your Plan
        </h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Start for free and scale up as you grow. Find the perfect plan for
          your content creation needs.
        </p>
      </div>

      <div className="mt-14">
        {billingEnabled ? <PricingTable /> : <FallbackPricing />}
      </div>
    </div>
  );
};

export default Plan;
