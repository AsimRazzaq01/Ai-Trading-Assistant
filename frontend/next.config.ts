import type { NextConfig } from "next";

// ⚠️ Vercel doesn't support standalone output mode
// Only use standalone when building for Docker
const isDockerBuild = process.env.BUILD_FOR_DOCKER === "true";

const nextConfig: NextConfig = {
    // Enable React strict mode for catching issues
    reactStrictMode: true,

    // Standalone output is best for Docker (smaller image)
    // But Vercel doesn't support it, so we conditionally enable it
    ...(isDockerBuild ? { output: "standalone" as const } : {}),

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
