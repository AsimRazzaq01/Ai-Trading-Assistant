// frontend/src/app/(protected)/news-brief/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NewsBriefPage() {
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
                    News Brief 📰
                </h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Latest Market News & Updates
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Stay informed with real-time financial news, market updates, and breaking stories 
                        that impact your trading decisions.
                    </p>
                    
                    <div className="space-y-4">
                        <div className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded">
                            <h3 className="font-semibold text-gray-800 mb-2">Breaking News</h3>
                            <p className="text-sm text-gray-600">
                                Real-time breaking news alerts and market-moving events
                            </p>
                        </div>
                        <div className="border-l-4 border-green-500 p-4 bg-green-50 rounded">
                            <h3 className="font-semibold text-gray-800 mb-2">Market Analysis</h3>
                            <p className="text-sm text-gray-600">
                                Expert analysis and commentary on market trends and movements
                            </p>
                        </div>
                        <div className="border-l-4 border-yellow-500 p-4 bg-yellow-50 rounded">
                            <h3 className="font-semibold text-gray-800 mb-2">Earnings Reports</h3>
                            <p className="text-sm text-gray-600">
                                Company earnings announcements and financial results
                            </p>
                        </div>
                        <div className="border-l-4 border-purple-500 p-4 bg-purple-50 rounded">
                            <h3 className="font-semibold text-gray-800 mb-2">Economic Indicators</h3>
                            <p className="text-sm text-gray-600">
                                Key economic data releases and their market impact
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
        console.error("❌ News Brief page error:", err);
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

