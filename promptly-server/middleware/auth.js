import { clerkClient } from "@clerk/express";

// Middleware to check userID and hasPremiumPlan
export const auth = async (req, res, next) => {
  try {
    const { userId, has } = await req.auth();

    const user = await clerkClient.users.getUser(userId);

    // Check premium via Clerk billing plan OR via privateMetadata (Razorpay)
    const hasPremiumPlan =
      (await has({ plan: "premium" })) ||
      user.privateMetadata?.premium === true;

    if (!hasPremiumPlan && user.privateMetadata.free_usage) {
      req.free_usage = user.privateMetadata.free_usage;
    } else if (!hasPremiumPlan) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: 0,
        },
      });
      req.free_usage = 0;
    }

    req.plan = hasPremiumPlan ? "premium" : "free";
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
