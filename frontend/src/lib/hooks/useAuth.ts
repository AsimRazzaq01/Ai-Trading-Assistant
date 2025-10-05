"use client";
import { useEffect, useState } from "react";


export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        (async () => {
            const res = await fetch("/api/me", { credentials: "include", cache: "no-store" });
            if (res.ok) setUser(await res.json());
            setLoading(false);
        })();
    }, []);


    return { user, loading };
}