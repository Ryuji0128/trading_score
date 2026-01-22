import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    distDir: ".next",
    experimental: {
        serverActions: { bodySizeLimit: "2mb" },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "setaseisakusyo.com",
            },
        ],
    },
};

export default nextConfig;
