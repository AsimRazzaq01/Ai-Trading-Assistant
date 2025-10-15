// frontend/src/app/(protected)/settings/page.tsx

"use client"; // allows interactivity on this page

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [user, setUser] = useState<{ email: string; username?: string } | null>(null);
  const [status, setStatus] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  
useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/me", {
        headers: {
          "Content-Type": "application/json",
          // Later, once login works:
          // Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include", // includes cookies if backend sets them
      });

      if (!res.ok) throw new Error("Failed to load user data");

      const data = await res.json();
      setUser(data); // ✅ fill the UI with real user info
    } catch (err) {
      console.error("❌ Error fetching user:", err);
    }
  };

  fetchUser();
}, []);


  const handleSaveChanges = () => {
    setStatus("Saving...");
    setTimeout(() => {
      setStatus("✅ Saved!");
      setTimeout(() => setStatus(""), 2500);
    }, 800);
  };

  const handleSavePreferences = () => {
    setStatus("Saving preferences...");
    setTimeout(() => {
      setStatus("✅ Preferences saved!");
      setTimeout(() => setStatus(""), 2500);
    }, 800);
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-semibold mb-6">Profit Path</h2>
        <nav className="flex flex-col space-y-3">
          <a href="/dashboard" className="hover:bg-gray-700 p-2 rounded">
            Overview
          </a>
          <a href="/ai" className="hover:bg-gray-700 p-2 rounded">
            AI Insights
          </a>
          <a href="/portfolio" className="hover:bg-gray-700 p-2 rounded">
            Portfolio
          </a>
          <a href="/settings" className="bg-gray-700 p-2 rounded">
            Settings
          </a>
        </nav>
        <div className="mt-auto text-sm text-gray-400">
          Logged in as <br />
          <span className="font-semibold text-gray-200">{user.email}</span>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Account Settings ⚙️
        </h1>

        {/* --- Account Information --- */}
        <div className="bg-white p-6 rounded-lg shadow max-w-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Account Information
          </h2>

          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Username</span>
            <input
              type="text"
              defaultValue={user.username}
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Email</span>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="block mb-6">
            <span className="text-gray-700 font-medium">Password</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <button
            onClick={handleSaveChanges}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>

        {/* --- Preferences --- */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow max-w-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Preferences
          </h2>

          <div className="flex items-center mb-4">
            <input
              id="darkMode"
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="darkMode" className="ml-2 text-gray-700">
              Enable Dark Mode
            </label>
          </div>

          <div className="flex items-center mb-4">
            <input
              id="notifications"
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="notifications" className="ml-2 text-gray-700">
              Enable Email Notifications
            </label>
          </div>

          <button
            onClick={handleSavePreferences}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save Preferences
          </button>
        </div>

        {/* --- Status Message --- */}
        {status && (
          <p className="mt-6 text-center text-green-600 font-medium">{status}</p>
        )}
      </main>
    </div>
  );
}




// // frontend/src/app/(protected)/settings/page.tsx

// import { cookies } from "next/headers";
// import React from "react";

// export default async function SettingsPage() {
//     try {
//         const backend =
//             process.env.NODE_ENV === "production"
//                 ? process.env.API_URL_INTERNAL || "http://ai_backend:8000"
//                 : process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";

//         const cookieStore = await cookies();
//         const token = cookieStore.get("access_token")?.value;

//         if (!token) {
//             return (
//                 <div className="p-6 text-center">
//                     <h1 className="text-2xl font-bold text-red-600">Unauthorized</h1>
//                     <p className="text-gray-600 mt-2">Please log in to continue.</p>
//                 </div>
//             );
//         }

//         const res = await fetch(`${backend}/auth/me`, {
//             headers: { Authorization: `Bearer ${token}` },
//             cache: "no-store",
//         });

//         if (!res.ok) {
//             console.error(`❌ Backend returned ${res.status}`);
//             return (
//                 <div className="p-6 text-center">
//                     <h1 className="text-2xl font-bold text-red-600">Server Error</h1>
//                     <p className="text-gray-600 mt-2">
//                         Could not load user data. Please try again later.
//                     </p>
//                 </div>
//             );
//         }

//         const user = await res.json();

//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-3xl font-bold text-blue-600">
//                     Account Settings ⚙️
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
//         console.error("❌ Settings page error:", err);
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








// import { cookies } from "next/headers";
// import React from "react";
//
// export default async function SettingsPage() {
//     try {
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
//         if (!res.ok) throw new Error(`Backend returned ${res.status}`);
//         const user = await res.json();
//
//         return (
//             <div className="p-6 text-center">
//                 <h1 className="text-3xl font-bold text-blue-600">
//                     Account Settings ⚙️
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
//         console.error("❌ Settings page error:", err);
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
