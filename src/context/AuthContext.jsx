import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [trainer, setTrainer] = useState(null)
  const [loading, setLoading] = useState(true)

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
        .insert({
          id:    authUser.id,
          email: authUser.email,
          full_name:  authUser.user_metadata?.full_name  ?? null,
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
        })
        .select()
        .single()
      trainerData = data
    }
    return trainerData
  }

  useEffect(() => {
    // Restore session on first load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        const t = await fetchTrainer(session.user.id)
        setTrainer(t)
      }
      setLoading(false)
    })

    // Keep state in sync with Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const t = await ensureTrainerRow(session.user)
          setTrainer(t)
        } else {
          setUser(null)
          setTrainer(null)
        }
        if (event === 'INITIAL_SESSION') setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
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
      user, trainer, loading,
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
