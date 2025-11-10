import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { api, internal } from "./_generated/api";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    // Handle successful payments
    // onPaymentSucceeded: async (ctx, payload) => {
    //   console.log("🎉 Payment Succeeded!");
    //   // Use Convex context to persist payment data
    //   await ctx.runMutation(internal.webhooks.createPayment, {
    //     paymentId: payload.data.payment_id,
    //     businessId: payload.business_id,
    //     customerEmail: payload.data.customer.email,
    //     amount: payload.data.total_amount,
    //     currency: payload.data.currency,
    //     status: payload.data.status,
    //     webhookPayload: JSON.stringify(payload),
    //   });
    // },

    // Handle subscription activation
    onSubscriptionActive: async (ctx, payload) => {
      console.log("🎉 Subscription Activated!");
      // Use Convex context to persist subscription data
      await ctx.runMutation(internal.webhooks.createSubscription, {
        userId: payload.data.metadata?.userId,
        dodoId: payload.data.customer.customer_id,
        subscriptionId: payload.data.subscription_id,
        customerEmail: payload.data.customer.email,
        status: payload.data.status,
        webhookPayload: JSON.stringify(payload),
      });
    },
    onSubscriptionCancelled: async (ctx, payload) => {
      console.log("🎉 Subscription Cancelled!");
      // Use Convex context to persist subscription data
      await ctx.runMutation(internal.webhooks.cancelSubscription, {
        dodoId: payload.data.customer.customer_id,
      });
    },
  }),
});

export default http;
