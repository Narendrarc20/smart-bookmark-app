'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // AUTH
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchBookmarks(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        if (session) fetchBookmarks(session.user.id)
        else setBookmarks([])
      })

    return () => subscription.unsubscribe()
  }, [])

  // FETCH BOOKMARKS
  const fetchBookmarks = async (userId: string) => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) setBookmarks(data)
  }

  // REALTIME SUBSCRIPTION
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev) => [payload.new, ...prev])
          }

          if (payload.eventType === 'DELETE') {
            setBookmarks((prev) =>
              prev.filter((b) => b.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  // LOGIN
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  // LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  // ADD BOOKMARK
  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle || !newUrl || !session) return

    setIsSubmitting(true)

    let formattedUrl = newUrl
    if (!/^https?:\/\//i.test(newUrl)) {
      formattedUrl = 'https://' + newUrl
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        title: newTitle,
        url: formattedUrl,
        user_id: session.user.id,
      })
      .select()
      .single()

    setIsSubmitting(false)

    if (error) {
      alert(error.message)
      return
    }

    if (data) {
      setBookmarks((prev) => [data, ...prev])
      setNewTitle('')
      setNewUrl('')
    }
  }

  // DELETE BOOKMARK
  const deleteBookmark = async (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))

    await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">
        Loading...
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl p-8 text-center">
          <h1 className="text-3xl font-semibold mb-2">
            Smart Bookmarks
          </h1>

          <p className="text-neutral-400 mb-6">
            Save and organize your links securely.
          </p>

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg font-medium"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 bg-neutral-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Smart Bookmarks
          </h1>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 rounded-md"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

          <section className="lg:col-span-1 bg-neutral-900 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Add Bookmark
            </h2>

            <form onSubmit={addBookmark} className="space-y-6">
              <div className="space-y-4">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Bookmark title"
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />

                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mx-auto block w-64 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold py-3"
              >
                {isSubmitting ? 'Adding…' : 'Add Bookmark'}
              </button>
            </form>
          </section>

          <section className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-6">
              Your Collection
            </h2>

            {bookmarks.length === 0 ? (
              <div className="text-neutral-400">
                No bookmarks yet.
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {bookmarks.map((b) => (
                  <div
                    key={b.id}
                    className="bg-neutral-900 border border-white/10 rounded-xl p-6 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-semibold truncate mb-1">
                        {b.title}
                      </h3>

                      <p className="text-sm text-neutral-400 truncate">
                        {b.url.replace(/^https?:\/\//, '')}
                      </p>
                    </div>

                    <div className="mt-6 flex justify-between items-center">
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline text-sm font-medium"
                      >
                        Visit
                      </a>

                      <button
                        onClick={() => deleteBookmark(b.id)}
                        className="text-sm text-red-400 hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  )
}
