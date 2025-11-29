// frontend/src/components/auth/RegisterForm.tsx

"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@/context/ThemeContext";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Button from "@/components/ui/Button";

const RegisterSchema = z
    .object({
        name: z.string().min(1, "Name required"),
        emailOrUsername: z.string().min(3, "Email or username required"),
        password: z.string().min(6, "Min 6 chars"),
        confirm: z.string().min(6, "Confirm your password"),
    })
    .refine((vals) => vals.password === vals.confirm, {
        path: ["confirm"],
        message: "Passwords do not match",
    });

type RegisterFields = z.infer<typeof RegisterSchema>;

export default function RegisterForm() {
    const { theme } = useTheme();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFields>({
        resolver: zodResolver(RegisterSchema),
        mode: "onChange", // Enable real-time validation
    });

    // Watch password fields for real-time mismatch detection
    const password = watch("password");
    const confirmPassword = watch("confirm");
    const showMismatchError = confirmPassword && password && password !== confirmPassword;

    const onSubmit = async (data: RegisterFields) => {
        const isEmail = data.emailOrUsername.includes("@");
        const body: Record<string, string> = {
            name: data.name,
            password: data.password,
            ...(isEmail
                ? { email: data.emailOrUsername }
                : { username: data.emailOrUsername }),
        };

        try {
            // ✅ Use internal Vercel proxy route
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                credentials: "include",
            });

            if (res.ok) {
                alert("Registration successful! You can now log in.");
                window.location.href = "/login";
            } else {
                const j = await res.json().catch(() => ({}));
                alert(j.detail || j.message || "Registration failed");
            }
        } catch (err) {
            console.error("❌ Registration error:", err);
            alert("Network error — is the backend running?");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1">
                <Input placeholder="Full Name" {...register("name")} />
                {errors.name && (
                    <p className={`text-sm mt-1 ml-1 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        {errors.name.message}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <Input placeholder="Email or Username" {...register("emailOrUsername")} />
                {errors.emailOrUsername && (
                    <p className={`text-sm mt-1 ml-1 ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        {errors.emailOrUsername.message}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <PasswordInput 
                    placeholder="Password" 
                    {...register("password")}
                    className={errors.password || showMismatchError ? 
                        (theme === "dark" ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-red-500 focus:border-red-500 focus:ring-red-500/20") 
                        : ""
                    }
                />
                {errors.password && (
                    <p className={`text-sm mt-1 ml-1 font-medium ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        {errors.password.message}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <PasswordInput
                    placeholder="Confirm Password"
                    {...register("confirm")}
                    className={errors.confirm || showMismatchError ? 
                        (theme === "dark" ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "border-red-500 focus:border-red-500 focus:ring-red-500/20") 
                        : ""
                    }
                />
                {(errors.confirm || showMismatchError) && (
                    <p className={`text-sm mt-1 ml-1 font-medium ${theme === "dark" ? "text-red-400" : "text-red-600"}`}>
                        {errors.confirm?.message || "Passwords do not match"}
                    </p>
                )}
            </div>

            <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
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
//
// const RegisterSchema = z.object({
//     name: z.string().min(1, "Name required"),
//     emailOrUsername: z.string().min(3, "Email or username required"),
//     password: z.string().min(6, "Min 6 chars"),
//     confirm: z.string().min(6, "Confirm your password"),
// }).refine((vals) => vals.password === vals.confirm, {
//     path: ["confirm"],
//     message: "Passwords do not match",
// });
//
//
// type RegisterFields = z.infer<typeof RegisterSchema>;
//
//
// export default function RegisterForm() {
//     const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFields>({
//         resolver: zodResolver(RegisterSchema),
//     });
//
//
//     const onSubmit = async (data: RegisterFields) => {
//         const isEmail = data.emailOrUsername.includes("@");
//         const body: any = {
//             name: data.name,
//             password: data.password,
//         };
//         if (isEmail) body.email = data.emailOrUsername; else body.username = data.emailOrUsername;
//
//
//         const backend = process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
//         const res = await fetch(`${backend}/auth/register`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(body),
//         });
//
//         if (res.ok) {
// // auto-login not implemented; guide user to Login
//             window.location.href = "/login";
//         } else {
//             const j = await res.json();
//             alert(j.detail || "Registration failed");
//         }
//     };
//
//
//     return (
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <Input placeholder="Full Name" {...register("name")} />
//             {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
//
//
//             <Input placeholder="Email or Username" {...register("emailOrUsername")} />
//             {errors.emailOrUsername && <p className="text-red-600 text-sm">{errors.emailOrUsername.message}</p>}
//
//
//             <Input placeholder="Password" type="password" {...register("password")} />
//             {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}
//
//
//             <Input placeholder="Confirm Password" type="password" {...register("confirm")} />
//             {errors.confirm && <p className="text-red-600 text-sm">{errors.confirm.message}</p>}
//
//
//             <Button disabled={isSubmitting} type="submit">Create account</Button>
//         </form>
//     );
// }


