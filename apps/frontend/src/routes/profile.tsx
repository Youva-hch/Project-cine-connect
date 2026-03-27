import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { updateMe } from '@/api/auth'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

async function resizeImageToDataUrl(
  file: File,
  opts?: { maxSize?: number; quality?: number }
): Promise<string> {
  const maxSize = opts?.maxSize ?? 256
  const quality = opts?.quality ?? 0.85

  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('Impossible de charger l’image'))
      i.src = objectUrl
    })

    const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
    const width = Math.max(1, Math.round(img.width * scale))
    const height = Math.max(1, Math.round(img.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas non supporté')
    ctx.drawImage(img, 0, 0, width, height)

    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function ProfilePage() {
  const { user, token, isLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarProcessing, setAvatarProcessing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: '/login' })
      return
    }
    if (user) {
      setName(user.name)
      setBio(user.bio ?? '')
      setAvatarUrl(user.avatarUrl ?? '')
    }
  }, [user, isLoading, navigate])

  const handlePickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset pour permettre de re-sélectionner le même fichier
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Veuillez choisir un fichier image.' })
      return
    }

    setAvatarProcessing(true)
    setMessage(null)
    try {
      const dataUrl = await resizeImageToDataUrl(file, { maxSize: 256, quality: 0.85 })
      setAvatarUrl(dataUrl)
      setMessage({ type: 'success', text: 'Photo sélectionnée. Cliquez sur “Enregistrer”.' })
    } catch {
      setMessage({ type: 'error', text: 'Impossible de traiter cette image.' })
    } finally {
      setAvatarProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await updateMe(token, {
        name: name.trim() || undefined,
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      })
      if (updated) {
        await refreshUser()
        setMessage({ type: 'success', text: 'Profil mis à jour.' })
      } else {
        setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-2 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon profil</h1>

        <div className="mb-8 flex items-center gap-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo de profil</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePickAvatar}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarProcessing}
                className="px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {avatarProcessing ? 'Traitement…' : 'Changer la photo'}
              </button>
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="px-4 py-2 bg-transparent text-muted-foreground border border-border rounded-lg hover:bg-accent"
              >
                Retirer
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Astuce: vous pouvez aussi coller une URL ci-dessous si vous préférez.
            </p>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'affichage
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL de l'avatar
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-card text-foreground border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {message && (
            <p
              className={
                message.type === 'success'
                  ? 'text-green-600 text-sm'
                  : 'text-red-600 text-sm'
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
