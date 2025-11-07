import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polarClient } from "./polar";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
polarClient.registerRoutes(http as any);

export default http;
