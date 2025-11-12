// frontend/src/app/(protected)/pattern-trends/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function PatternTrendsPage() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) {
            redirect("/login");
        }

        // ✅ Determine backend URL: use internal URL if available, otherwise public URL
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        // ✅ Call backend directly from server component
        const res = await fetch(`${backend}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Cookie: `access_token=${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error(`❌ Backend returned ${res.status}`);
            return (
                <div className="p-6 text-center">
                    <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
                    <p className="text-gray-600 mt-2">
                        Could not load user data. Please try again later.
                    </p>
                </div>
            );
        }

        const user = await res.json();

        return (
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-blue-600 mb-6">
                    Pattern Trends 📈
                </h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Market Pattern Recognition & Trend Analysis
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Identify trading patterns, trends, and opportunities using advanced AI-powered 
                        pattern recognition algorithms.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                            <h3 className="font-semibold text-gray-800 mb-2">Chart Patterns</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Head & Shoulders, Triangles, Flags, and more
                            </p>
                            <div className="text-xs text-gray-500">
                                AI-detected patterns with confidence scores
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-gradient-to-br from-green-50 to-green-100">
                            <h3 className="font-semibold text-gray-800 mb-2">Trend Analysis</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Uptrends, downtrends, and sideways movements
                            </p>
                            <div className="text-xs text-gray-500">
                                Real-time trend identification and strength metrics
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
                            <h3 className="font-semibold text-gray-800 mb-2">Support & Resistance</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Key price levels and breakout opportunities
                            </p>
                            <div className="text-xs text-gray-500">
                                Automated level detection and validation
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Pattern Alerts</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">Bullish Pattern Detected</span>
                                <span className="text-xs text-green-600 font-semibold">High Confidence</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">Trend Reversal Signal</span>
                                <span className="text-xs text-yellow-600 font-semibold">Medium Confidence</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-sm text-gray-500">
                        Logged in as: <span className="font-semibold text-gray-700">{user.email}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Backend connection verified ✅
                    </p>
                </div>
            </div>
        );
    } catch (err) {
        console.error("❌ Pattern Trends page error:", err);
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
                <p className="text-gray-600 mt-2">
                    Could not load page. Please try again later.
                </p>
            </div>
        );
    }
}

