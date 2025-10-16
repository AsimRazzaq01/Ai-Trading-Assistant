"use client";

import React, { useState, useEffect, useCallback } from "react";

// Define the types for the portfolio item and user
interface PortfolioItem {
    id: number;
    ticker: string;
    quantity: number;
    price?: number;
}

interface User {
    id: number;
    email: string;
}

export default function DashboardPage() {
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [ticker, setTicker] = useState("");
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState<string | null>(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchPortfolioPrices = useCallback(async (portfolioItems: PortfolioItem[]) => {
        try {
            const updatedPortfolio = await Promise.all(
                portfolioItems.map(async (item) => {
                    const res = await fetch(`${apiBaseUrl}/market-data/price/${item.ticker}`);
                    if (!res.ok) {
                        return { ...item, price: undefined };
                    }
                    const data = await res.json();
                    return { ...item, price: data.price };
                })
            );
            setPortfolio(updatedPortfolio);
        } catch (err) {
            console.error("Could not fetch prices:", err);
            // Don't block the UI for price errors, just log it
        }
    }, [apiBaseUrl]);


    // Fetch user and portfolio data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userRes = await fetch(`${apiBaseUrl}/auth/me`, { cache: 'no-store' });
                if (!userRes.ok) throw new Error("Failed to fetch user data. Please log in.");
                const userData = await userRes.json();
                setUser(userData);

                // Fetch portfolio data
                const portfolioRes = await fetch(`${apiBaseUrl}/portfolio/`);
                if (!portfolioRes.ok) throw new Error("Failed to fetch portfolio");
                const portfolioData = await portfolioRes.json();
                setPortfolio(portfolioData);

                if (portfolioData.length > 0) {
                    fetchPortfolioPrices(portfolioData);
                }

            } catch (err) {
                setError(err.message);
            }
        };
        fetchData();
    }, [apiBaseUrl, fetchPortfolioPrices]);


    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${apiBaseUrl}/portfolio/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker: ticker.toUpperCase(), quantity: parseInt(quantity) }),
            });
            if (!res.ok) throw new Error("Failed to add item. Check ticker symbol.");
            const newItem = await res.json();

            // Refetch portfolio to get the new item and its price
            const portfolioRes = await fetch(`${apiBaseUrl}/portfolio/`);
            const portfolioData = await portfolioRes.json();
            setPortfolio(portfolioData);
            fetchPortfolioPrices(portfolioData);

            setTicker("");
            setQuantity("");
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle item deletion
    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`${apiBaseUrl}/portfolio/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete item");
            const updatedPortfolio = portfolio.filter((item) => item.id !== id);
            setPortfolio(updatedPortfolio);
        } catch (err) {
            setError(err.message);
        }
    };

    if (error) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error</h1>
                <p className="text-gray-600 mt-2">{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-2xl font-bold">Loading...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-blue-600 text-center mb-4">
                Welcome to Your Dashboard, {user.email}
            </h1>

            {/* Add Portfolio Item Form */}
            <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-bold mb-4">Add to Portfolio</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="ticker" className="block text-gray-700 font-bold mb-2">
                            Stock Ticker
                        </label>
                        <input
                            type="text"
                            id="ticker"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="e.g., AAPL"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="quantity" className="block text-gray-700 font-bold mb-2">
                            Quantity
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="e.g., 10"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                        Add Item
                    </button>
                </form>
            </div>

            {/* Portfolio Display Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Your Portfolio</h2>
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="px-4 py-2">Ticker</th>
                            <th className="px-4 py-2">Quantity</th>
                            <th className="px-4 py-2">Current Price</th>
                            <th className="px-4 py-2">Total Value</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {portfolio.map((item) => (
                            <tr key={item.id} className="border-t">
                                <td className="px-4 py-2 text-center">{item.ticker}</td>
                                <td className="px-4 py-2 text-center">{item.quantity}</td>
                                <td className="px-4 py-2 text-center">
                                    {item.price ? `$${item.price.toFixed(2)}` : "Loading..."}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    {item.price ? `$${(item.price * item.quantity).toFixed(2)}` : "N/A"}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}








// import { cookies } from "next/headers";
// import React from "react";
//
// export default async function DashboardPage() {
//     try {
//         // ✅ Choose backend:
//         // - Docker/Production SSR → internal FastAPI container
//         // - Local dev / Vercel → public URL
//         const backend =
//             process.env.NODE_ENV === "production"
//                 ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
//                 : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         const cookieStore = await cookies();
//         const token = cookieStore.get("access_token")?.value;
//
//         if (!token) {
//             return (
//                 <div className="p-6 text-center">
//                     <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
//                     <p className="text-gray-600 mt-2">Please log in to continue.</p>
//                 </div>
//             );
//         }
//
//         const res = await fetch(`${backend}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//             cache: "no-store",
//         });
//
//         if (!res.ok) throw new Error(`Backend responded ${res.status}`);
//         const user = await res.json();
//
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-3xl font-bold text-blue-600">
//                     Welcome to Profit Path 🚀
//                 </h1>
//                 <p className="text-gray-600 mt-2">
//                     Logged in as:{" "}
//                     <span className="font-semibold text-gray-800">{user.email}</span>
//                 </p>
//                 <p className="text-gray-500 mt-1 text-sm">
//                     Backend connection verified ✅
//                 </p>
//             </div>
//         );
//     } catch (err) {
//         console.error("❌ Dashboard SSR error:", err);
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
//                 <p className="text-gray-600 mt-2">
//                     Could not load user data. Please try again later.
//                 </p>
//             </div>
//         );
//     }
// }
