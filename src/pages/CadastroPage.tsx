import { AuthLayout } from "@/components/auth/AuthLayout"
import { RegisterForm } from "@/components/auth/forms/RegisterForm"

export function CadastroPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    )
}
