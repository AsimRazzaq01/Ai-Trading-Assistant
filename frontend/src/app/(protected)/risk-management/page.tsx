// frontend/src/app/(protected)/risk-management/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RiskManagementPage() {
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
                    Risk Management 🛡️
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Portfolio Risk Metrics
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-700">Total Portfolio Value</span>
                                <span className="font-semibold text-gray-800">$125,430.00</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-700">Risk Score</span>
                                <span className="font-semibold text-yellow-600">Medium</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-700">Max Drawdown</span>
                                <span className="font-semibold text-red-600">-8.5%</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="text-gray-700">Sharpe Ratio</span>
                                <span className="font-semibold text-green-600">1.42</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Position Limits
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Position Size (%)
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue="10" 
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stop Loss (%)
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue="5" 
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Take Profit (%)
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue="15" 
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Risk Alerts & Warnings
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-start p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                            <div className="flex-1">
                                <h3 className="font-semibold text-yellow-800 mb-1">Portfolio Concentration Warning</h3>
                                <p className="text-sm text-yellow-700">
                                    Your portfolio is heavily weighted in technology stocks. Consider diversifying.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <div className="flex-1">
                                <h3 className="font-semibold text-green-800 mb-1">Risk Level: Acceptable</h3>
                                <p className="text-sm text-green-700">
                                    Your current risk management settings are within recommended parameters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mt-6">
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
        console.error("❌ Risk Management page error:", err);
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

