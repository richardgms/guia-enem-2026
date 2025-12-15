"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Perfil {
    nome: string
    avatar_emoji: string
}

const EMOJIS = ['🐳', '🍒', '💙', '🐠', '🪸', '🌊', '🦀', '🐈', '🐈‍⬛', '👩‍🎓', '⭐', '📖']

export default function PerfilPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [perfil, setPerfil] = useState<Perfil>({
        nome: '',
        avatar_emoji: '👨‍🎓'
    })
    const [email, setEmail] = useState('')

    useEffect(() => {
        async function loadPerfil() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setEmail(user.email || '')

            // Buscar perfil existente
            const { data } = await supabase
                .from('perfil')
                .select('nome, avatar_emoji')
                .eq('user_id', user.id)
                .single()

            if (data) {
                setPerfil({
                    nome: data.nome || '',
                    avatar_emoji: data.avatar_emoji || '👨‍🎓'
                })
            }

            setLoading(false)
        }
        loadPerfil()
    }, [router])

    async function handleSalvar() {
        setSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error('Não autenticado')

            const { error } = await supabase
                .from('perfil')
                .upsert({
                    user_id: user.id,
                    nome: perfil.nome.trim(),
                    avatar_emoji: perfil.avatar_emoji,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                })

            if (error) throw error

            toast({
                title: "Perfil salvo!",
                description: "Suas alterações foram salvas com sucesso.",
                className: "bg-green-600 text-white"
            })

            // Redireciona para dashboard
            router.push('/dashboard')
            router.refresh()

        } catch (error) {
            console.error('Erro ao salvar perfil:', error)
            toast({
                title: "Erro ao salvar",
                description: "Tente novamente.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex justify-center text-text-secondary">
                Carregando perfil...
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 min-h-screen">
            <div className="max-w-lg mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary">👤 Meu Perfil</h1>
                    <p className="text-text-secondary mt-2">
                        Personalize como você aparece no app
                    </p>
                </div>

                {/* Avatar Selection */}
                <div className="bg-white rounded-xl p-6 border shadow-sm">
                    <Label className="text-base font-semibold">Escolha seu avatar</Label>
                    <div className="flex flex-wrap gap-3 mt-4">
                        {EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => setPerfil(p => ({ ...p, avatar_emoji: emoji }))}
                                className={`text-4xl p-2 rounded-xl transition-all ${perfil.avatar_emoji === emoji
                                    ? 'bg-primary/10 ring-2 ring-primary scale-110'
                                    : 'hover:bg-slate-100'
                                    }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name Input */}
                <div className="bg-white rounded-xl p-6 border shadow-sm space-y-4">
                    <div>
                        <Label htmlFor="nome" className="text-base font-semibold">
                            Como você quer ser chamado(a)?
                        </Label>
                        <Input
                            id="nome"
                            type="text"
                            placeholder="Ex: Mayanne"
                            value={perfil.nome}
                            onChange={(e) => setPerfil(p => ({ ...p, nome: e.target.value }))}
                            className="mt-2 text-lg h-12"
                            maxLength={30}
                        />
                        <p className="text-xs text-text-secondary mt-1">
                            Esse nome aparecerá na saudação do dashboard
                        </p>
                    </div>

                    <div className="pt-2">
                        <Label className="text-sm text-text-secondary">Email</Label>
                        <p className="text-sm font-medium text-primary mt-1">{email}</p>
                    </div>
                </div>

                {/* Preview */}
                <div className="bg-slate-50 rounded-xl p-6 border">
                    <p className="text-sm text-text-secondary mb-2">Preview</p>
                    <div className="flex items-center gap-3">
                        <span className="text-4xl">{perfil.avatar_emoji}</span>
                        <p className="text-2xl font-normal text-primary">
                            Olá, <span className="font-bold">{perfil.nome || 'Estudante'}!</span> 👋
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSalvar}
                        disabled={saving || !perfil.nome.trim()}
                        className="flex-1 bg-primary"
                    >
                        {saving ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
