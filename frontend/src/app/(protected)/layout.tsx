import { cookies } from "next/headers";


export const dynamic = "force-dynamic";


async function fetchMe() {
// Call our own proxy so cookies apply to same origin
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace("8000","3000")}/api/me`, {
        method: "GET",
        credentials: "include",
        headers: { Cookie: cookies().toString() },
        cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
}


export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const me = await fetchMe();
    if (!me) {
// Redirect client-side to login (simple fallback link here)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <a className="underline" href="/login">Session expired. Go to Login</a>
            </div>
        );
    }
    return (
        <div className="min-h-screen">
            <header className="border-b p-4 flex items-center justify-between">
                <div className="font-semibold">AI Trading Assistant</div>
                <nav className="flex gap-4">
                    <a className="underline" href="/">Home</a>
                    <a className="underline" href="/settings">Settings</a>
                    <form action="/api/logout" method="post">
                        <button className="underline">Logout</button>
                    </form>
                </nav>
            </header>
            <main className="p-6">{children}</main>
        </div>
    );
}