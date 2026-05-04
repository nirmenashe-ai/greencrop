import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Eye, EyeOff, Loader2, FlaskConical } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, isDemo } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: err } = await login(email, password)
      if (err) throw err
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  if (isDemo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-green-600 px-8 py-10 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sprout size={32} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">GreenCrop</h1>
              <p className="text-green-100 text-sm mt-1">מערכת ניהול חממות</p>
            </div>
            <div className="p-8 space-y-5">
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <FlaskConical size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">מצב הדגמה פעיל</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Supabase לא מוגדר. האפליקציה פועלת עם נתוני הדגמה.
                    אין צורך בהתחברות.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                כניסה ללוח בקרה
              </button>
              <p className="text-center text-xs text-gray-400">
                חבר Supabase לפעילות מלאה
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-green-600 px-8 py-10 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sprout size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">GreenCrop</h1>
            <p className="text-green-100 text-sm mt-1">מערכת ניהול חממות</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">אימייל</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">סיסמה</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pl-11 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'מתחבר...' : 'כניסה'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          GreenCrop v1.0 · גישה מורשית בלבד
        </p>
      </div>
    </div>
  )
}
