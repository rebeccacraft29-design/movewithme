import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,           setUser]           = useState(null)
  const [trainer,        setTrainer]        = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [trainerLoading, setTrainerLoading] = useState(false)

  async function fetchTrainer(userId) {
    const { data } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    return data
  }

  async function ensureTrainerRow(authUser) {
    let trainerData = await fetchTrainer(authUser.id)
    if (!trainerData) {
      const { data } = await supabase
        .from('trainers')
        .upsert({
          id:    authUser.id,
          email: authUser.email,
          full_name:  authUser.user_metadata?.full_name  ?? null,
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
          onboarding_completed: false,
        })
        .select()
        .single()
      trainerData = data
    }
    return trainerData
  }

  useEffect(() => {
    // Fallback: if Supabase doesn't respond within 5 seconds, show login screen
    const timeoutId = setTimeout(() => setLoading(false), 5000)

    // Single source of truth for session state.
    // INITIAL_SESSION fires immediately on registration with the current session
    // (or null if logged out), so we never need a separate getSession() call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          setTrainerLoading(true)
          const t = await ensureTrainerRow(session.user)
          setTrainer(t)
          setTrainerLoading(false)
        } else {
          setUser(null)
          setTrainer(null)
          setTrainerLoading(false)
        }
        // Only unblock the loading screen once — after the initial session
        // check completes and the trainer row is guaranteed to be set.
        if (event === 'INITIAL_SESSION') {
          clearTimeout(timeoutId)
          setLoading(false)
        }
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshTrainer() {
    if (!user) return
    const t = await fetchTrainer(user.id)
    setTrainer(t)
  }

  return (
    <AuthContext.Provider value={{
      user, trainer, loading, trainerLoading,
      signUp, signIn, signInWithGoogle, signOut, refreshTrainer,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
