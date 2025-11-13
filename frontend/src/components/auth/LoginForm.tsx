// frontend/src/components/auth/LoginForm.tsx

"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const LoginSchema = z.object({
    identifier: z.string().min(3, "Email or username required"),
    password: z.string().min(6, "Password required"),
});

type LoginFields = z.infer<typeof LoginSchema>;

export default function LoginForm() {
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Email or Username" {...register("identifier")} />
            {errors.identifier && (
                <p className="text-red-600 text-sm">{errors.identifier.message}</p>
            )}

            <Input placeholder="Password" type="password" {...register("password")} />
            {errors.password && (
                <p className="text-red-600 text-sm">{errors.password.message}</p>
            )}

            <Button disabled={isSubmitting} type="submit">Login</Button>

            <div className="text-center text-sm text-gray-500">or</div>

            {/* ✅ Keep OAuth URLs pointing directly to backend */}
            <div className="flex gap-2">
                <a className="w-1/2 text-center border rounded-md py-2"
                   href={`${process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000"}/auth/google/login`}>
                    Continue with Google
                </a>
                <a className="w-1/2 text-center border rounded-md py-2"
                   href={`${process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000"}/auth/github/login`}>
                    Continue with GitHub
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
