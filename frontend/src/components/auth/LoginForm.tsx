// frontend/src/components/auth/LoginForm.tsx

"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/context/ThemeContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const LoginSchema = z.object({
    identifier: z.string().min(3, "Email or username required"),
    password: z.string().min(6, "Password required"),
});

type LoginFields = z.infer<typeof LoginSchema>;

export default function LoginForm() {
    const { theme } = useTheme();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data: LoginFields) => {
        const body = data.identifier.includes("@")
            ? { email: data.identifier, password: data.password }
            : { username: data.identifier, password: data.password };

        try {
            // ✅ Use Vercel proxy route instead of backend directly
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include", // send/receive cookies properly
            });

            const result = await res.json().catch(() => ({} as any));

            if (res.status === 422) {
                alert("Invalid input format (check your email/password)");
                return;
            }

            if (res.ok) {
                // ✅ Optional: store token locally for client-only requests
                if (result?.access_token) {
                    localStorage.setItem("access_token", result.access_token);
                }
                window.location.href = "/dashboard"; // redirect to dashboard
            } else {
                // Show detailed error message from backend
                const errorMsg = result?.detail || result?.message || "Login failed";
                alert(errorMsg);
            }
        } catch (err) {
            console.error("❌ Login network error:", err);
            const backendUrl = process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
            alert(`Network error — cannot connect to backend at ${backendUrl}.\n\nPlease ensure:\n1. FastAPI backend is running\n2. Backend is accessible at ${backendUrl}\n3. Check your environment variables`);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
                <Input placeholder="Email or Username" {...register("identifier")} />
                {errors.identifier && (
                    <p className={`text-sm mt-1 ml-1 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        {errors.identifier.message}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <Input placeholder="Password" type="password" {...register("password")} />
                {errors.password && (
                    <p className={`text-sm mt-1 ml-1 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        {errors.password.message}
                    </p>
                )}
            </div>

            <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${
                        theme === "dark" ? "border-gray-700" : "border-gray-300"
                    }`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className={`px-4 ${
                        theme === "dark" ? "bg-gray-900/90 text-gray-400" : "bg-white/90 text-gray-500"
                    }`}>
                        Or continue with
                    </span>
                </div>
            </div>

            {/* ✅ Keep OAuth URLs pointing directly to backend */}
            <div className="flex gap-3">
                <a 
                    className={`flex-1 flex items-center justify-center gap-2.5 border-2 rounded-lg py-3 px-4 font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                        theme === "dark"
                            ? "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600 text-gray-200"
                            : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700 shadow-sm"
                    }`}
                    href={`${process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000"}/auth/google/login`}
                >
                    {/* Google Logo */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span className="text-sm">Google</span>
                </a>
                <a 
                    className={`flex-1 flex items-center justify-center gap-2.5 border-2 rounded-lg py-3 px-4 font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${
                        theme === "dark"
                            ? "border-gray-700/50 bg-gray-800/30 hover:bg-gray-800/50 hover:border-gray-600 text-gray-200"
                            : "border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-700 shadow-sm"
                    }`}
                    href={`${process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000"}/auth/github/login`}
                >
                    {/* GitHub Logo */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-sm">GitHub</span>
                </a>
            </div>
        </form>
    );
}




















// "use client";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Input from "@/components/ui/Input";
// import Button from "@/components/ui/Button";
//
// const LoginSchema = z.object({
//     identifier: z.string().min(3, "Email or username required"),
//     password: z.string().min(6, "Password required"),
// });
//
// type LoginFields = z.infer<typeof LoginSchema>;
//
// export default function LoginForm() {
//     // const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//     const backend = process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
//         resolver: zodResolver(LoginSchema),
//     });
//
//     const onSubmit = async (data: LoginFields) => {
//         const body = data.identifier.includes("@")
//             ? { email: data.identifier, password: data.password }
//             : { username: data.identifier, password: data.password };
//
//         try {
//             const res = await fetch(`${backend}/auth/login`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify(body),
//                 credentials: "include", // keep to allow backend cookie
//             });
//
//             const result = await res.json().catch(() => ({} as any));
//
//             if (res.status === 422) {
//                 alert("Invalid input format (check your email/password)");
//             }
//
//
//             if (res.ok) {
//                 // Save token for client-side API calls (avoids SameSite dev issues)
//                 if (result?.access_token) {
//                     localStorage.setItem("access_token", result.access_token);
//                 }
//                 // ✅ Correct redirect path
//                 window.location.href = "/dashboard";
//             } else {
//                 alert(result?.detail || result?.message || "Login failed");
//             }
//         } catch {
//             alert("Network error — is the backend running?");
//         }
//     };
//
//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <Input placeholder="Email or Username" {...register("identifier")} />
//             {errors.identifier && <p className="text-red-600 text-sm">{errors.identifier.message}</p>}
//
//             <Input placeholder="Password" type="password" {...register("password")} />
//             {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
//
//             <Button disabled={isSubmitting} type="submit">Login</Button>
//
//             <div className="text-center text-sm text-gray-500">or</div>
//
//             <div className="flex gap-2">
//                 <a className="w-1/2 text-center border rounded-md py-2" href={`${backend}/auth/google/login`}>
//                     Continue with Google
//                 </a>
//                 <a className="w-1/2 text-center border rounded-md py-2" href={`${backend}/auth/github/login`}>
//                     Continue with GitHub
//                 </a>
//             </div>
//         </form>
//     );
// }
















// "use client";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Input from "@/components/ui/Input";
// import Button from "@/components/ui/Button";
//
// const LoginSchema = z.object({
//     identifier: z.string().min(3, "Email or username required"),
//     password: z.string().min(6, "Password required"),
// });
//
// type LoginFields = z.infer<typeof LoginSchema>;
//
// export default function LoginForm() {
//     const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFields>({
//         resolver: zodResolver(LoginSchema),
//     });
//
//     const onSubmit = async (data: LoginFields) => {
//         const body = data.identifier.includes("@")
//             ? { email: data.identifier, password: data.password }
//             : { username: data.identifier, password: data.password };
//
//         const res = await fetch(`${backend}/auth/login`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//             credentials: "include", // ✅ Important for HttpOnly cookies
//         });
//
//         if (res.ok) {
//             window.location.href = "/(protected)/dashboard";
//         } else {
//             alert("Login failed");
//         }
//     };
//
//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <Input placeholder="Email or Username" {...register("identifier")} />
//             {errors.identifier && <p className="text-red-600 text-sm">{errors.identifier.message}</p>}
//
//             <Input placeholder="Password" type="password" {...register("password")} />
//             {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
//
//             <Button disabled={isSubmitting} type="submit">Login</Button>
//
//             <div className="text-center text-sm text-gray-500">or</div>
//
//             <div className="flex gap-2">
//                 <a className="w-1/2 text-center border rounded-md py-2"
//                    href={`${backend}/auth/google/login`}>
//                     Continue with Google
//                 </a>
//                 <a className="w-1/2 text-center border rounded-md py-2"
//                    href={`${backend}/auth/github/login`}>
//                     Continue with GitHub
//                 </a>
//             </div>
//         </form>
//     );
// }
