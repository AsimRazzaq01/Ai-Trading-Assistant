// frontend/src/app/(protected)/watchlist/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
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
                    My Watchlist 👀
                </h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Tracked Securities
                        </h2>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            + Add Symbol
                        </button>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                        Monitor your favorite stocks, cryptocurrencies, and other securities 
                        in one convenient location.
                    </p>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-3 text-left text-sm font-semibold text-gray-700">Symbol</th>
                                    <th className="border p-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="border p-3 text-right text-sm font-semibold text-gray-700">Price</th>
                                    <th className="border p-3 text-right text-sm font-semibold text-gray-700">Change</th>
                                    <th className="border p-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="hover:bg-gray-50">
                                    <td className="border p-3 font-mono font-semibold">AAPL</td>
                                    <td className="border p-3 text-gray-700">Apple Inc.</td>
                                    <td className="border p-3 text-right font-semibold">$175.43</td>
                                    <td className="border p-3 text-right text-green-600">+2.34%</td>
                                    <td className="border p-3 text-center">
                                        <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border p-3 font-mono font-semibold">TSLA</td>
                                    <td className="border p-3 text-gray-700">Tesla, Inc.</td>
                                    <td className="border p-3 text-right font-semibold">$248.50</td>
                                    <td className="border p-3 text-right text-red-600">-1.25%</td>
                                    <td className="border p-3 text-center">
                                        <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50">
                                    <td className="border p-3 font-mono font-semibold">MSFT</td>
                                    <td className="border p-3 text-gray-700">Microsoft Corporation</td>
                                    <td className="border p-3 text-right font-semibold">$378.85</td>
                                    <td className="border p-3 text-right text-green-600">+0.87%</td>
                                    <td className="border p-3 text-center">
                                        <button className="text-red-600 hover:text-red-800 text-sm">Remove</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                        <p>💡 Tip: Add symbols to your watchlist to track price movements and receive alerts.</p>
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
        console.error("❌ Watchlist page error:", err);
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

