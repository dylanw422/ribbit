import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { corsRouter } from "convex-helpers/server/cors";
import { internal } from "./_generated/api";
import { rag } from "./rag";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const cors = corsRouter(httpRouter());

cors.route({
  path: "/upload",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const storageId = await ctx.storage.store(await request.blob());
    await rag.addAsync(ctx, {
      namespace: "all-files",
      chunkerAction: internal.http.chunkerAction,
      metadata: { storageId },
    });
    return new Response();
  }),
});

export const chunkerAction = rag.defineChunkerAction(async (ctx, args) => {
  const storageId = args.entry.metadata!.storageId;
  const file = await ctx.storage.get(storageId as Id<"_storage">);
  const text = await new TextDecoder().decode(await file!.arrayBuffer());
  return { chunks: text.split("\n\n") };
});

authComponent.registerRoutes(cors.http, createAuth);

export default cors.http;
