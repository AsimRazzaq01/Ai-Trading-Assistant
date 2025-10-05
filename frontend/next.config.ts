import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Enable React strict mode for catching issues
    reactStrictMode: true,

    // Standalone output is best for Docker (smaller image)
    output: "standalone",

    // Add headers (CORS helpers)
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Access-Control-Allow-Origin",
                        // 👇 fallback to localhost:8000 if env var is undefined
                        value: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
                    },
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                ],
            },
        ];
    },
};

export default nextConfig;
