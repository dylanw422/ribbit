import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";
import polar from "@convex-dev/polar/convex.config";

const app = defineApp();
app.use(polar);
app.use(betterAuth);
app.use(rag);
app.use(agent);
export default app;
