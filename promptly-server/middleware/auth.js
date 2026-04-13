import { clerkClient } from "@clerk/express";

// ─── Daily free-tier limits per feature ──────────────────────────────────
export const FREE_LIMITS = {
  article: 5,
  "blog-title": 5,
  image: 5,
  "remove-bg": 2,
  "remove-object": 2,
};

/**
 * Get today's date string in YYYY-MM-DD format (UTC).
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Auth middleware ─────────────────────────────────────────────────────
// Attaches req.plan, req.freeUsage, and helper methods to req
export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();

    const user = await clerkClient.users.getUser(userId);

    // Check premium via Clerk billing plan OR via privateMetadata (Razorpay)
    const hasPremiumPlan =
      (await has({ plan: "premium" })) ||
      user.privateMetadata?.premium === true;

    req.plan = hasPremiumPlan ? "premium" : "free";

    // For free users, load or initialise daily usage tracking
    if (!hasPremiumPlan) {
      const stored = user.privateMetadata?.free_usage || {};
      const todayStr = today();

      // Reset counters if the stored date is not today
      req.freeUsage = {};
      for (const key of Object.keys(FREE_LIMITS)) {
        if (stored[key]?.date === todayStr) {
          req.freeUsage[key] = { count: stored[key].count || 0, date: todayStr };
        } else {
          req.freeUsage[key] = { count: 0, date: todayStr };
        }
      }
    }

    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── Helper: check & increment free usage for a feature ─────────────────
// Call from controllers: const allowed = await checkFreeLimit(req, res, "article");
// Returns true if allowed, false if limit hit (and sends response).
export async function checkFreeLimit(req, res, feature) {
  if (req.plan === "premium") return true;

  const limit = FREE_LIMITS[feature];
  if (limit === undefined) {
    // Feature has no free tier at all
    res.json({ success: false, message: "This feature is only available for premium subscriptions." });
    return false;
  }

  const usage = req.freeUsage[feature];
  if (usage.count >= limit) {
    res.json({
      success: false,
      message: `Daily free limit reached (${limit}/${limit}). Upgrade to Premium for unlimited access.`,
    });
    return false;
  }

  return true;
}

// ─── Helper: increment usage after successful generation ────────────────
export async function incrementFreeUsage(req, feature) {
  if (req.plan === "premium") return;

  const { userId } = await req.auth();
  req.freeUsage[feature].count += 1;

  await clerkClient.users.updateUserMetadata(userId, {
    privateMetadata: {
      free_usage: req.freeUsage,
    },
  });
}
