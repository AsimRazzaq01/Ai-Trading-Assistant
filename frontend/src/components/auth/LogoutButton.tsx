"use client";
export default function LogoutButton() {
    return (
        <form action="/api/logout" method="post">
            <button className="underline">Logout</button>
        </form>
    );
}