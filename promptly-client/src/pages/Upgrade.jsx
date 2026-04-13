import { useAuth } from "@clerk/clerk-react";
import { Check, X, Crown, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const comparisonRows = [
  { feature: "Write Articles",          free: "5 / day",     premium: "Unlimited" },
  { feature: "Blog Title Generation",   free: "5 / day",     premium: "Unlimited" },
  { feature: "AI Image Generation",     free: "5 / day",     premium: "Unlimited" },
  { feature: "Background Removal",      free: "2 / day",     premium: "Unlimited" },
  { feature: "Object Removal",          free: "2 / day",     premium: "Unlimited" },
  { feature: "Resume Review",           free: false,         premium: "Unlimited" },
  { feature: "Improve My Prompt (AI)",   free: true,          premium: true },
  { feature: "Dashboard & History",     free: true,          premium: true },
  { feature: "Community Gallery",       free: true,          premium: true },
  { feature: "Prompt Templates",        free: "Limited",     premium: "All Templates" },
  { feature: "Priority Processing",     free: false,         premium: true },
  { feature: "Priority Support",        free: false,         premium: true },
];

const Upgrade = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    const loaded = await loadRazorpayScript();
    if (!loaded) { toast.error("Failed to load payment gateway."); return; }

    try {
      const { data } = await axios.post("/api/payments/create-order", {}, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (!data.success) { toast.error(data.message || "Failed to create order."); return; }

      const options = {
        key: data.key_id,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Promptly AI",
        description: "Premium Plan — Monthly",
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post("/api/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, { headers: { Authorization: `Bearer ${await getToken()}` } });
            if (verifyRes.data.success) {
              toast.success("🎉 You are now Premium!");
              setTimeout(() => navigate("/ai"), 1500);
            } else {
              toast.error(verifyRes.data.message);
            }
          } catch { toast.error("Payment verification failed."); }
        },
        theme: { color: "#7c3aed" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch { toast.error("Payment not available. Please try later."); }
  };

  const renderCell = (value) => {
    if (value === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-red-400 mx-auto" />;
    return <span>{value}</span>;
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Back button */}
      <button
        onClick={() => navigate("/ai")}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 cursor-pointer transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-4 py-1.5 rounded-full mb-4">
          <Crown className="w-4 h-4" /> Compare Plans
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          Free vs Premium
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
          See exactly what you get with each plan. Upgrade anytime — no commitment.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
        {/* Table Header */}
        <div className="grid grid-cols-3 text-sm font-semibold">
          <div className="p-4 px-6 text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/80">
            Feature
          </div>
          <div className="p-4 text-center text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/80">
            Free
          </div>
          <div className="p-4 text-center bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-700 dark:text-purple-300">
            <div className="flex items-center justify-center gap-1.5">
              <Crown className="w-4 h-4" /> Premium
            </div>
          </div>
        </div>

        {/* Table Rows */}
        {comparisonRows.map((row, i) => (
          <div
            key={row.feature}
            className={`grid grid-cols-3 text-sm border-t border-gray-100 dark:border-slate-700 ${
              i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-slate-800/40"
            }`}
          >
            <div className="p-4 px-6 text-slate-700 dark:text-slate-200 font-medium">
              {row.feature}
            </div>
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              {renderCell(row.free)}
            </div>
            <div className="p-4 text-center text-slate-700 dark:text-slate-200 font-medium bg-purple-500/[0.03] dark:bg-purple-500/[0.05]">
              {renderCell(row.premium)}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-3xl mx-auto mt-8 p-6 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Ready to go Premium?</h3>
          <p className="text-purple-100 text-sm mt-1">
            Unlimited access to all features. Cancel anytime.
          </p>
        </div>
        <button
          onClick={handleUpgrade}
          className="px-8 py-3 bg-white text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition cursor-pointer shadow-lg whitespace-nowrap"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Upgrade — ₹399/mo
          </span>
        </button>
      </div>
    </div>
  );
};

export default Upgrade;
