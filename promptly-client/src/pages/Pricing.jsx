import { useAuth } from "@clerk/clerk-react";
import { Check, Sparkles } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started with AI content creation.",
    features: [
      "10 AI generations (articles + titles)",
      "Basic dashboard",
      "Community gallery access",
      "Prompt templates (limited)",
    ],
    notIncluded: [
      "AI Image generation",
      "Background & object removal",
      "Resume review",
      "Prompt improvement",
      "Priority support",
    ],
    cta: "Get Started Free",
    highlight: false,
    gradient: "from-slate-50 to-white dark:from-slate-800 dark:to-slate-800",
  },
  {
    name: "Premium",
    price: "₹399",
    period: "/month",
    description: "Unlock the full power of AI for unlimited content creation.",
    features: [
      "Unlimited article & title generation",
      "AI Image generation (ClipDrop)",
      "Background removal (Cloudinary AI)",
      "Object removal (Cloudinary AI)",
      "Unlimited resume reviews",
      "All prompt templates",
      "Prompt improvement (AI-enhanced)",
      "Export to PDF",
      "Priority processing",
    ],
    notIncluded: [],
    cta: "Upgrade to Premium",
    highlight: true,
    gradient: "from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10",
  },
];

const Pricing = () => {
  const { getToken } = useAuth();

  const handleUpgrade = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      toast.error("Failed to load payment gateway.");
      return;
    }
    try {
      const { data } = await axios.post(
        "/api/payments/create-order",
        {},
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );
      if (!data.success) {
        toast.error(data.message || "Failed to create order.");
        return;
      }
      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Promptly AI",
        description: "Premium Plan — Monthly",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              "/api/payments/verify-payment",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${await getToken()}` } }
            );
            if (verifyRes.data.success) {
              toast.success("🎉 You are now Premium!");
              setTimeout(() => window.location.reload(), 1500);
            } else {
              toast.error(verifyRes.data.message);
            }
          } catch (err) {
            toast.error("Payment verification failed.");
          }
        },
        theme: { color: "#5044E5" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment not available.");
    }
  };

  return (
    <div className="dark:bg-slate-900 min-h-screen">
      <Navbar />
      <div className="pt-28 pb-20 px-4 sm:px-20 xl:px-32">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" /> Simple Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Choose the right plan for you
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Start free and scale when you need more. No hidden fees.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 flex flex-col bg-gradient-to-br ${plan.gradient} ${
                plan.highlight
                  ? "border-primary/40 shadow-xl shadow-primary/5"
                  : "border-gray-200 dark:border-slate-700 shadow-sm"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold px-4 py-1 bg-primary text-white rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {plan.description}
              </p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-800 dark:text-white">
                  {plan.price}
                </span>
                <span className="text-gray-400 text-sm">{plan.period}</span>
              </div>

              {/* Included Features */}
              <ul className="mt-8 space-y-3 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <Check className="w-4 h-4 mt-0.5 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-400 dark:text-gray-500 line-through">
                    <Check className="w-4 h-4 mt-0.5 text-gray-300 dark:text-gray-600 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={plan.highlight ? handleUpgrade : () => (window.location.href = "/ai")}
                className={`mt-8 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto mt-24">
          <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I switch between plans?",
                a: "Yes! You can upgrade to Premium anytime. Your free-tier usage carries over.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We use Razorpay which supports UPI, credit/debit cards, net banking, and wallets.",
              },
              {
                q: "Is there a free trial for Premium?",
                a: "The Free plan itself works as a trial — you get 10 full AI generations to test the platform.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Yes, you can cancel your Premium subscription at any time. Your access continues until the end of the billing period.",
              },
            ].map((faq) => (
              <div key={faq.q} className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-slate-700 dark:text-slate-200">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;
