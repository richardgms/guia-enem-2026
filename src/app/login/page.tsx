import { Suspense } from 'react'
import { LoginForm } from '@/components/LoginForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Carregando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}