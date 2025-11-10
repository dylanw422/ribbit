import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";
import dodopayments from "@dodopayments/convex/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(rag);
app.use(agent);
app.use(dodopayments);
export default app;
