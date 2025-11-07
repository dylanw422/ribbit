import { query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await authComponent.getAuthUser(ctx as any);
    if (!currentUser) return null;
    return currentUser;
  },
});
