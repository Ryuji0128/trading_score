import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
