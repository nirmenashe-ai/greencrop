import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, UserCog, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StatusMessage from '../../components/common/StatusMessage'

function UserForm({ onSave, onCancel, saving, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  return (
    <div className="p-5 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          אימייל <span className="text-red-500">*</span>
        </label>
        <input
          autoFocus
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="user@example.com"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          סיסמה <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="לפחות 6 תווים"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">המשתמש יוכל לשנות סיסמה לאחר כניסה ראשונה</p>
      </div>
      {error && <StatusMessage type="error" message={error} />}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ביטול
        </button>
        <button
          onClick={() => email.trim() && password.length >= 6 && onSave({ email: email.trim(), password })}
          disabled={saving || !email.trim() || password.length < 6}
          className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          הוסף משתמש
        </button>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [confirm, setConfirm] = useState({ open: false, id: null, email: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSave = async ({ email, password }) => {
    setSaving(true)
    setFormError('')
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const body = await res.json()
      if (!res.ok) {
        throw new Error(body.msg || body.error_description || body.error || 'שגיאה ביצירת משתמש')
      }
      await load()
      setModal(false)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await supabase.from('profiles').delete().eq('id', confirm.id)
      await load()
      setConfirm({ open: false, id: null, email: '' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">ניהול משתמשים</h2>
          <span className="text-sm text-gray-400">({users.length})</span>
        </div>
        <button
          onClick={() => { setFormError(''); setModal(true) }}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> הוסף משתמש
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" size={24} /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <UserCog size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">אין משתמשים עדיין.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">אימייל</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">נוצר</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-700">
                          {u.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-800" dir="ltr">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-gray-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('he-IL') : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setConfirm({ open: true, id: u.id, email: u.email })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="מחק משתמש"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת משתמש חדש" maxWidth="max-w-sm">
        <UserForm
          onSave={handleSave}
          onCancel={() => setModal(false)}
          saving={saving}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null, email: '' })}
        onConfirm={handleDelete}
        title="מחיקת משתמש"
        message={`האם אתה בטוח שברצונך למחוק את המשתמש ${confirm.email}?`}
        loading={deleting}
      />
    </div>
  )
}
