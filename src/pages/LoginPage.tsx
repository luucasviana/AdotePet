import { AuthLayout } from "@/components/auth/AuthLayout"
import { LoginForm } from "@/components/auth/forms/LoginForm"

export function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    )
}
