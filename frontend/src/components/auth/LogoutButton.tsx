// frontend/src/components/auth/LogoutButton.tsx

"use client";
export default function LogoutButton() {
    return (
        <form action="/api/logout" method="post">
            <button className="underline">Logout</button>
        </form>
    );
}