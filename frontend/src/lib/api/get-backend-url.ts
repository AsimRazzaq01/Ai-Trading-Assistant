// frontend/src/lib/api/get-backend-url.ts
// Centralized backend URL resolution for all environments

/**
 * Get the correct backend URL based on the current environment:
 * 
 * 1. Production (Vercel): Uses NEXT_PUBLIC_API_URL_BROWSER (Railway URL)
 * 2. Docker: Uses API_URL_INTERNAL (ai_backend:8000 - Docker network)
 * 3. Local dev: Uses localhost:8000
 * 
 * Detection logic:
 * - If RUNNING_IN_DOCKER=true → use API_URL_INTERNAL
 * - If API_URL_INTERNAL contains Docker hostnames but we're not in Docker → skip it
 * - Otherwise prefer NEXT_PUBLIC_API_URL_BROWSER → fallback to localhost
 */
export function getBackendUrl(): string {
    const apiInternal = process.env.API_URL_INTERNAL?.trim();
    const apiBrowser = process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim();
    const runningInDocker = process.env.RUNNING_IN_DOCKER === "true";
    
    // Docker internal hostnames that only work inside Docker network
    const dockerHostnames = ['ai_backend', 'host.docker.internal'];
    const isDockerInternalUrl = dockerHostnames.some(host => apiInternal?.includes(host));
    
    // If we're explicitly running in Docker, use the internal URL
    if (runningInDocker && apiInternal) {
        return apiInternal;
    }
    
    // If the internal URL is a Docker hostname and we're NOT in Docker, don't use it
    if (isDockerInternalUrl && !runningInDocker) {
        // Use browser URL or localhost
        return apiBrowser || "http://localhost:8000";
    }
    
    // For production (Vercel), NEXT_PUBLIC_API_URL_BROWSER should be set to Railway URL
    // For local dev, it defaults to localhost
    return apiBrowser || apiInternal || "http://localhost:8000";
}

/**
 * Get backend URL with logging for debugging
 */
export function getBackendUrlWithLog(context?: string): string {
    const url = getBackendUrl();
    if (process.env.NODE_ENV !== 'production') {
        console.log(`🔗 [${context || 'API'}] Using backend: ${url}`);
    }
    return url;
}










