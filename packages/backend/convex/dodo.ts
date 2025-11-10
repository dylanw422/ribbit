// convex/dodo.ts
import { DodoPayments } from "@dodopayments/convex";
import { api, components } from "./_generated/api";
import { internal } from "./_generated/api";

export const dodo = new DodoPayments(components.dodopayments, {
  // This function maps your Convex user to a Dodo Payments customer
  // Customize it based on your authentication provider and user database

  identify: async (ctx) => {
    const identity = await ctx.runQuery(api.auth.getCurrentUser);
    if (!identity) {
      return null;
    }

    const user: any = await ctx.runQuery(api.payments.getUserSubscriptions, {
      userId: identity._id,
    });
    if (!user) {
      return null;
    }

    return {
      dodoCustomerId: user.dodoId,
    };
  },
  apiKey: process.env.DODO_PAYMENTS_API_KEY!,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
});

// Export the API methods for use in your app
export const { checkout, customerPortal } = dodo.api();
