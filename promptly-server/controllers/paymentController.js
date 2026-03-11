import Razorpay from "razorpay";
import crypto from "crypto";
import { clerkClient } from "@clerk/express";

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.warn("[Razorpay] Not configured:", err.message);
}

// Create a Razorpay order for Premium upgrade
export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.json({ success: false, message: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env" });
    }

    const { userId } = req.auth();

    const options = {
      amount: 39900, // ₹399 in paise
      currency: "INR",
      receipt: `prem_${userId.slice(-8)}_${Date.now()}`,
      notes: { userId },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.log("[Razorpay] Order creation error:", error?.error?.description || error?.message || error);
    res.json({ success: false, message: error?.error?.description || error?.message || "Failed to create order" });
  }
};

// Verify payment after Razorpay checkout
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const { userId } = req.auth();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, message: "Payment verification failed" });
    }

    // Payment is valid — upgrade user to premium via Clerk metadata
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        razorpay_customer_id: razorpay_payment_id,
        premium: true,
      },
    });

    console.log(`[Razorpay] User ${userId} upgraded to premium`);
    res.json({ success: true, message: "Payment verified. You are now Premium!" });
  } catch (error) {
    console.log("[Razorpay] Verification error:", error?.message || error);
    res.json({ success: false, message: error?.message || "Verification failed" });
  }
};
