'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Recuperação de fluxo: Se cair aqui com CODE, manda para o callback certo
    useEffect(() => {
        const code = searchParams.get('code')
        if (code) {
            router.push(`/auth/callback?code=${code}`)
        }
    }, [searchParams, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Força o redirecionamento sempre para a URL oficial de produção ou env configurada
            // Isso evita problemas com Deploy Previews ou localhost enviando links quebrados
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://guiaenem2026.netlify.app'

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${siteUrl}/auth/callback`,
                },
            })

            if (error) throw error

            setEnviado(true)
        } catch (error) {
            console.error('Erro ao fazer login:', error)
            alert("Erro ao enviar link. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    if (enviado) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-primary">Verifique seu email</CardTitle>
                    <CardDescription className="text-center">
                        Enviamos um link de acesso para <strong>{email}</strong>
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-center text-muted-foreground">
                        Não recebeu? Verifique a caixa de spam ou tente novamente.
                    </p>
                    <Button variant="outline" onClick={() => setEnviado(false)} className="w-full">
                        Tentar outro email
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardHeader className="space-y-1">
                <div className="flex justify-center mb-4">
                    {/* Placeholder logo */}
                    <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
                        GE
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-primary">Guia ENEM 2026</CardTitle>
                <CardDescription className="text-center">
                    Entre para começar a estudar
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar link de acesso'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
