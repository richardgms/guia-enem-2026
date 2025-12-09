'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // Check active session
        const getSession = async () => {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(
                (_event, session) => {
                    setUser(session?.user ?? null)
                    setLoading(false)
                }
            )

            return () => {
                subscription.unsubscribe()
            }
        }

        getSession()
    }, [supabase])

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return {
        user,
        loading,
        signOut
    }
}
