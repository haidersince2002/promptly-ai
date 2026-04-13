import { useAuth } from "@clerk/clerk-react";
import { Zap } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

/**
 * Usage counter badge for free-tier users.
 * Shows "X left today" for a specific feature.
 *
 * @param {string} feature - Feature key: "article", "blog-title", "image", "remove-bg", "remove-object"
 * @param {string} accentColor - Tailwind-compatible hex color for the badge (e.g. "#8e37eb")
 */
const UsageCounter = ({ feature, accentColor = "#8e37eb" }) => {
  const { getToken } = useAuth();
  const [usage, setUsage] = useState(null); // { used, limit, left }
  const [plan, setPlan] = useState(null);

  const fetchUsage = async () => {
    try {
      const { data } = await axios.get("/api/user/get-free-usage", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      if (data.success) {
        setPlan(data.plan);
        if (data.usage && data.usage[feature]) {
          setUsage(data.usage[feature]);
        }
      }
    } catch (err) {
      // Silently fail — counter just won't show
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  // Premium users or loading — don't show anything
  if (plan === "premium" || plan === null) return null;
  if (!usage) return null;

  return (
    <div
      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
      style={{
        backgroundColor: `${accentColor}15`,
        color: accentColor,
        border: `1px solid ${accentColor}30`,
      }}
    >
      <Zap className="w-3.5 h-3.5" />
      <span>
        {usage.left} / {usage.limit} left today
      </span>
    </div>
  );
};

export default UsageCounter;
