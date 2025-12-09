'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
    className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleLogout} className={className}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
        </Button>
    )
}
