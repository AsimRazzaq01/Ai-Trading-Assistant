//frontend/src/app/(auth)/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";


export const runtime = "nodejs"; // ensure Node runtime for headers manipulation in route handlers


export default function LoginPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Login</h1>
            <LoginForm />
        </div>
    );
}

