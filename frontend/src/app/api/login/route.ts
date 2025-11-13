// ============================================================
// 💻 frontend/src/app/api/login/route.ts
// ============================================================


import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // ✅ Choose backend (Docker, local, or production)
        const backend =
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";

        console.log(`🔗 Attempting to connect to backend: ${backend}/auth/login`);

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        let response: Response;
        try {
            response = await fetch(`${backend}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
        } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
                console.error("❌ Request timeout - backend not responding");
                return NextResponse.json(
                    { 
                        detail: `Backend connection timeout. The backend at ${backend} is not responding. Please ensure FastAPI is running.`
                    },
                    { status: 504 }
                );
            }
            
            // Check if it's a network error
            if (fetchError.code === 'ECONNREFUSED' || fetchError.message?.includes('fetch failed')) {
                console.error(`❌ Connection refused to ${backend}`);
                return NextResponse.json(
                    { 
                        detail: `Cannot connect to backend at ${backend}. Please ensure FastAPI is running on port 8000.`
                    },
                    { status: 503 }
                );
            }
            
            throw fetchError; // Re-throw if it's a different error
        }

        const data = await response.json().catch(async () => {
            const text = await response.text();
            console.error("❌ Invalid JSON response from backend:", text);
            return { message: text || "Invalid response from backend" };
        });

        if (!response.ok) {
            console.error(`❌ Backend returned error status ${response.status}:`, data);
            return NextResponse.json(
                { detail: data.detail || data.message || "Login failed" },
                { status: response.status }
            );
        }

        // ✅ Forward cookies in all environments
        const nextRes = NextResponse.json(data, { status: 200 });
        const setCookie = response.headers.get("set-cookie");

        if (setCookie) {
            // ✅ Forward cookie in all environments (local and production)
            // The backend sets the correct domain/secure flags based on environment
            nextRes.headers.set("set-cookie", setCookie);
            console.log("🍪 Forwarded cookie:", setCookie.split(";")[0]);
        } else {
            console.warn("⚠️ No Set-Cookie header from backend");
        }

        return nextRes;
    } catch (err: any) {
        console.error("❌ Login proxy error:", err);
        
        // Provide more specific error messages
        const errorMessage = err.message || "Unknown error";
        const backend = 
            process.env.API_URL_INTERNAL?.trim() ||
            process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
            "http://localhost:8000";
        
        return NextResponse.json(
            { 
                detail: `Backend connection failed. Error: ${errorMessage}. Please ensure FastAPI is running at ${backend}.`
            },
            { status: 500 }
        );
    }
}

















// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs";
//
// export async function POST(req: NextRequest) {
//     try {
//         const body = await req.json();
//
//         // ✅ Dynamically select backend target
//         const backend =
//             process.env.API_URL_INTERNAL?.trim() ||
//             process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() ||
//             "http://localhost:8000";
//
//         const response = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include",
//         });
//
//         let data;
//         try {
//             data = await response.json();
//         } catch {
//             data = { message: await response.text() };
//         }
//
//         if (!response.ok) {
//             return NextResponse.json(
//                 { detail: data.detail || "Login failed" },
//                 { status: response.status }
//             );
//         }
//
//         const res = NextResponse.json(data, { status: 200 });
//         const setCookie = response.headers.get("set-cookie");
//         if (setCookie) res.headers.set("set-cookie", setCookie);
//
//         return res;
//     } catch (err) {
//         console.error("❌ Login proxy error:", err);
//         return NextResponse.json(
//             { detail: "Backend connection failed. Is FastAPI running?" },
//             { status: 500 }
//         );
//     }
// }























// // frontend/src/app/api/login/route.ts
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs";
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Dynamically choose backend depending on environment
//         const backend =
//             process.env.API_URL_INTERNAL?.trim() || // inside Docker/Next.js
//             process.env.NEXT_PUBLIC_API_URL_BROWSER?.trim() || // from browser
//             "http://localhost:8000"; // fallback for local dev
//
//         const body = await req.json();
//
//         const response = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include",
//         });
//
//         let data;
//         try {
//             data = await response.json();
//         } catch {
//             data = { message: await response.text() };
//         }
//
//         const next = NextResponse.json(data, { status: response.status });
//
//         const setCookie = response.headers.get("set-cookie");
//         if (setCookie) next.headers.set("set-cookie", setCookie);
//
//         return next;
//     } catch (err) {
//         console.error("❌ Login API error:", err);
//         return NextResponse.json(
//             { error: "Login failed. Backend may be unreachable." },
//             { status: 500 }
//         );
//     }
// }
//










// frontend/src/app/api/login/route.ts
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs"; // ensure runs on server
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Use same environment logic as register route
//         const backend =
//             process.env.NEXT_PUBLIC_API_URL ||
//             "http://127.0.0.1:8000"; // fallback only for local dev
//
//         const body = await req.json();
//
//         // ✅ Send login request to FastAPI backend
//         const response = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include", // keep cookies if backend sets session
//         });
//
//         // ✅ Try to parse JSON safely
//         let data;
//         try {
//             data = await response.json();
//         } catch {
//             data = { message: await response.text() };
//         }
//
//         // ✅ Create NextResponse with same status as backend
//         const next = NextResponse.json(data, { status: response.status });
//
//         // ✅ Forward backend cookies (for JWT/session login)
//         const setCookie = response.headers.get("set-cookie");
//         if (setCookie) {
//             next.headers.set("set-cookie", setCookie);
//         }
//
//         return next;
//     } catch (err) {
//         console.error("❌ Login API error:", err);
//         return NextResponse.json(
//             { error: "Login failed. Backend may be unreachable." },
//             { status: 500 }
//         );
//     }
// }









// //frontend/src/app/api/login/route.ts
//
// import { NextRequest, NextResponse } from "next/server";
//
// export const runtime = "nodejs"; // ✅ Ensures it runs on the server
//
// export async function POST(req: NextRequest) {
//     try {
//         // ✅ Use the right backend URL (internal when in Docker)
//         const backend =
//             process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//
//         const body = await req.json();
//
//         // ✅ Send login request to FastAPI
//         const res = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include", // Important for cookie auth
//         });
//
//         // ✅ Try parsing backend response safely
//         let data;
//         try {
//             data = await res.json();
//         } catch {
//             data = { message: "Invalid JSON response from backend" };
//         }
//
//         // ✅ Forward backend JSON + status
//         const next = NextResponse.json(data, { status: res.status });
//
//         // ✅ Mirror backend Set-Cookie header so SSR components see auth state
//         const setCookie = res.headers.get("set-cookie");
//         if (setCookie) {
//             next.headers.set("set-cookie", setCookie);
//         }
//
//         return next;
//     } catch (err: any) {
//         console.error("❌ Login API error:", err);
//         return NextResponse.json(
//             { error: "Login failed. Backend may be unreachable." },
//             { status: 500 }
//         );
//     }
// }
