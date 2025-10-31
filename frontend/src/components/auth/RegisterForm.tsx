// frontend/src/components/auth/RegisterForm.tsx

"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";


const RegisterSchema = z.object({
    name: z.string().min(1, "Name required"),
    emailOrUsername: z.string().min(3, "Email or username required"),
    password: z.string().min(6, "Min 6 chars"),
    confirm: z.string().min(6, "Confirm your password"),
}).refine((vals) => vals.password === vals.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
});


type RegisterFields = z.infer<typeof RegisterSchema>;


export default function RegisterForm() {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFields>({
        resolver: zodResolver(RegisterSchema),
    });


    const onSubmit = async (data: RegisterFields) => {
        const isEmail = data.emailOrUsername.includes("@");
        const body: any = {
            name: data.name,
            password: data.password,
        };
        if (isEmail) body.email = data.emailOrUsername; else body.username = data.emailOrUsername;


        const backend = process.env.NEXT_PUBLIC_API_URL_BROWSER || "http://localhost:8000";
        const res = await fetch(`${backend}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (res.ok) {
// auto-login not implemented; guide user to Login
            window.location.href = "/login";
        } else {
            const j = await res.json();
            alert(j.detail || "Registration failed");
        }
    };


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Full Name" {...register("name")} />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}


            <Input placeholder="Email or Username" {...register("emailOrUsername")} />
            {errors.emailOrUsername && <p className="text-red-600 text-sm">{errors.emailOrUsername.message}</p>}


            <Input placeholder="Password" type="password" {...register("password")} />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}


            <Input placeholder="Confirm Password" type="password" {...register("confirm")} />
            {errors.confirm && <p className="text-red-600 text-sm">{errors.confirm.message}</p>}


            <Button disabled={isSubmitting} type="submit">Create account</Button>
        </form>
    );
}


