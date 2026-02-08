import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/types/database'
import { User } from '@supabase/supabase-js'

export type { Profile }

// Hook personalizado para gestionar la autenticación y el perfil del usuario
export function useAuth() {
    const [user, setUser] = useState<User | null>(null) // Usuario de Supabase Auth
    const [profile, setProfile] = useState<Profile | null>(null) // Perfil extendido de la base de datos
    const [loading, setLoading] = useState(true) // Estado de carga

    useEffect(() => {
        // Obtener la sesión inicial al cargar el hook
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setLoading(false)
            }
        })

        // Escuchar cambios en el estado de autenticación (Login, Logout, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
            } else {
                setProfile(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    // Función para obtener los datos del perfil desde la tabla 'perfiles'
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    // Función para cerrar sesión
    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
    }

    return {
        user,
        profile,
        loading,
        logout,
    }
}
