import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/Header"

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: stats } = await supabase
        .from('estatisticas')
        .select('streak_atual')
        .eq('user_id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header streak={stats?.streak_atual || 0} />
            <main className="flex-1 container mx-auto py-6 px-4 md:px-6 max-w-7xl">
                {children}
            </main>
        </div>
    )
}