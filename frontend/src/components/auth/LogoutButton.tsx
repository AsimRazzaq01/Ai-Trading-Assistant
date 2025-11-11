// frontend/src/components/auth/LogoutButton.tsx

"use client";

export default function LogoutButton() {
    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // ✅ Use Next.js proxy route (keeps cookies first-party)
            const res = await fetch("/api/logout", {
                method: "POST",
                credentials: "include", // ensures backend cookie deletion is sent
            });

            if (res.ok) {
                // ✅ Clean up client storage (if any)
                localStorage.removeItem("access_token");
                window.location.href = "/"; // redirect home after logout
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data?.detail || "Logout failed");
            }
        } catch (err) {
            console.error("❌ Logout network error:", err);
            alert("Network error — could not reach logout API.");
        }
    };

    return (
        <form onSubmit={handleLogout}>
            <button
                type="submit"
                className="underline text-blue-600 hover:text-blue-800 transition"
            >
                Logout
            </button>
        </form>
    );
}






















// "use client";
//
// export default function LogoutButton() {
//     const handleLogout = async (e: React.FormEvent) => {
//         e.preventDefault();
//
//         const backend = process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         try {
//             const res = await fetch(`${backend}/auth/logout`, {
//                 method: "POST",
//                 credentials: "include", // ✅ ensures cookies/session get cleared
//             });
//
//             if (res.ok) {
//                 // optional: clear any stored token just in case
//                 localStorage.removeItem("access_token");
//                 window.location.href = "/"; // ✅ redirect home
//             } else {
//                 const data = await res.json().catch(() => ({}));
//                 alert(data?.detail || "Logout failed");
//             }
//         } catch {
//             alert("Network error — could not reach backend");
//         }
//     };
//
//     return (
//         <form onSubmit={handleLogout}>
//             <button
//                 type="submit"
//                 className="underline text-blue-600 hover:text-blue-800 transition"
//             >
//                 Logout
//             </button>
//         </form>
//     );
// }
