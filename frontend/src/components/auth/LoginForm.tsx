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


        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            window.location.href = "/(protected)/dashboard";
        } else {
            alert("Login failed");
        }
    };


    const backend = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input placeholder="Email or Username" {...register("identifier")} />
            {errors.identifier && <p className="text-red-600 text-sm">{errors.identifier.message}</p>}


            <Input placeholder="Password" type="password" {...register("password")} />
            {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}


            <Button disabled={isSubmitting} type="submit">Login</Button>


            <div className="text-center text-sm text-gray-500">or</div>


            <div className="flex gap-2">
                <a className="w-1/2 text-center border rounded-md py-2"
                   href={`${backend}/auth/google/login`}>
                    Continue with Google
                </a>
                <a className="w-1/2 text-center border rounded-md py-2"
                   href={`${backend}/auth/github/login`}>
                    Continue with GitHub
                </a>
            </div>
        </form>
    );
}