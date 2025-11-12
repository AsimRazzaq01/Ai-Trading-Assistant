// frontend/src/app/(protected)/deep-research/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DeepResearchPage() {
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
                    Deep Research 🔬
                </h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Comprehensive Market Analysis
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Access in-depth research reports, technical analysis, and fundamental data 
                        to make informed trading decisions.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Technical Analysis</h3>
                            <p className="text-sm text-gray-600">
                                Advanced chart patterns, indicators, and trend analysis
                            </p>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Fundamental Analysis</h3>
                            <p className="text-sm text-gray-600">
                                Company financials, earnings reports, and market sentiment
                            </p>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">AI-Powered Insights</h3>
                            <p className="text-sm text-gray-600">
                                Machine learning models analyzing market patterns and predictions
                            </p>
                        </div>
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-2">Research Reports</h3>
                            <p className="text-sm text-gray-600">
                                Detailed reports on stocks, sectors, and market trends
                            </p>
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
        console.error("❌ Deep Research page error:", err);
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

