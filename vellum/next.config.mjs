import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root to this app dir. The repo has sibling lockfiles
  // (vellum/ and repolens/), so Next/Turbopack would otherwise infer the wrong
  // root and fail to resolve the Next.js package ("Next.js package not found").
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
