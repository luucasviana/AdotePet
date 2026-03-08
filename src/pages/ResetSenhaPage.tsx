import { AuthLayout } from "@/components/auth/AuthLayout"
import { ResetPasswordForm } from "@/components/auth/forms/ResetPasswordForm"

export function ResetSenhaPage() {
    return (
        <AuthLayout skipSplash>
            <ResetPasswordForm />
        </AuthLayout>
    )
}
