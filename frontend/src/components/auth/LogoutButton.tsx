// frontend/src/components/auth/LogoutButton.tsx

"use client";

export default function LogoutButton() {
    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();

        const backend = process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";

        try {
            const res = await fetch(`${backend}/auth/logout`, {
                method: "POST",
                credentials: "include", // ✅ ensures cookies/session get cleared
            });

            if (res.ok) {
                // optional: clear any stored token just in case
                localStorage.removeItem("access_token");
                window.location.href = "/"; // ✅ redirect home
            } else {
                const data = await res.json().catch(() => ({}));
                alert(data?.detail || "Logout failed");
            }
        } catch {
            alert("Network error — could not reach backend");
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
