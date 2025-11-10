// convex/payments.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { checkout } from "./dodo";
import { customerPortal } from "./dodo";

export const createCheckout = action({
  args: {
    product_cart: v.array(
      v.object({
        product_id: v.string(),
        quantity: v.number(),
      })
    ),
    returnUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await checkout(ctx, {
      payload: {
        product_cart: args.product_cart,
        return_url: args.returnUrl,
        billing_currency: "USD",
        feature_flags: {
          allow_discount_code: true,
        },
      },
    });
  },
});

export const getCustomerPortal = action({
  args: {
    send_email: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    try {
      const portal = await customerPortal(ctx, args);
      console.log("portal", portal);
      if (!portal?.portal_url) {
        throw new Error("Customer portal did not return a portal_url");
      }
      return portal;
    } catch (error) {
      console.error("Failed to generate customer portal link", error);
      throw new Error("Unable to generate customer portal link. Please try again.");
    }
  },
});
