import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mode klasik: halaman dinamis (login, dashboard, DB) tanpa Cache Components.
  cacheComponents: false,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
