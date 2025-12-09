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

    let stats = null
    if (user) {
        const { data: statsData } = await supabase
            .from('estatisticas')
            .select('streak_atual')
            .eq('user_id', user.id)
            .single()
        stats = statsData
    }

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            <Header streak={stats?.streak_atual || 0} />
            <main className="flex-1 container mx-auto py-6 px-4 md:px-6 max-w-7xl relative z-10">
                {children}
            </main>

            {/* Background SVG Waves */}
            <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
                <svg fill="none" preserveAspectRatio="none" viewBox="0 0 1440 320" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,202.7C672,192,768,128,864,112C960,96,1056,128,1152,149.3C1248,171,1344,181,1392,186.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#B2EBF2" fillOpacity="0.2"></path>
                    <path d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,229.3C672,245,768,267,864,250.7C960,235,1056,181,1152,170.7C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#B2EBF2" fillOpacity="0.3"></path>
                </svg>
            </div>
        </div>
    )
}