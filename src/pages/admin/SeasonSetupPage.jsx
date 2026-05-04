import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, CalendarDays, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { DEMO_GREENHOUSES, DEMO_SEASON_SETUPS } from '../../data/demoData'
import { getCropColor } from '../../utils/cropColors'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StatusMessage from '../../components/common/StatusMessage'

let demoId = 10

function SetupForm({ initial, greenhouses, onSave, onCancel, saving, error }) {
  const [form, setForm] = useState({
    greenhouse_id: initial?.greenhouse_id || '',
    crop_name: initial?.crop_name || '',
    start_opening: initial?.start_opening || '',
    end_opening: initial?.end_opening || '',
    is_active: initial?.is_active ?? true,
  })
  const [rangeError, setRangeError] = useState('')

  const selectedGh = greenhouses.find((g) => g.id === form.greenhouse_id)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    if (!selectedGh) return true
    const start = parseInt(form.start_opening)
    const end = parseInt(form.end_opening)
    if (isNaN(start) || isNaN(end)) { setRangeError('נא להזין מספרי פתחים תקפים.'); return false }
    if (start < 1 || end > selectedGh.total_openings) {
      setRangeError(`הטווח חייב להיות בין 1 ל-${selectedGh.total_openings}.`)
      return false
    }
    if (start > end) { setRangeError('הפתח ההתחלתי חייב להיות קטן מהסיום.'); return false }
    setRangeError('')
    return true
  }

  const handleSave = () => {
    if (!validate()) return
    onSave({
      greenhouse_id: form.greenhouse_id,
      crop_name: form.crop_name.trim(),
      start_opening: parseInt(form.start_opening),
      end_opening: parseInt(form.end_opening),
      is_active: form.is_active,
    })
  }

  return (
    <div className="p-5 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          חממה <span className="text-red-500">*</span>
        </label>
        <select
          value={form.greenhouse_id}
          onChange={(e) => set('greenhouse_id', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">בחר חממה...</option>
          {greenhouses.map((g) => (
            <option key={g.id} value={g.id}>{g.name} ({g.total_openings} פתחים)</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          שם גידול <span className="text-red-500">*</span>
        </label>
        <input
          value={form.crop_name}
          onChange={(e) => set('crop_name', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="לדוגמה: מלפפונים, פלפלים, עגבניות"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            פתח התחלה <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={selectedGh?.total_openings || 999}
            value={form.start_opening}
            onChange={(e) => { set('start_opening', e.target.value); setRangeError('') }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            פתח סיום <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={selectedGh?.total_openings || 999}
            value={form.end_opening}
            onChange={(e) => { set('end_opening', e.target.value); setRangeError('') }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={selectedGh?.total_openings || '…'}
          />
        </div>
      </div>
      {selectedGh && (
        <p className="text-xs text-gray-400">טווח תקף: 1 – {selectedGh.total_openings}</p>
      )}
      {rangeError && <p className="text-xs text-red-500">{rangeError}</p>}

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set('is_active', e.target.checked)}
          className="w-4 h-4 text-green-600 border-gray-300 rounded"
        />
        <span className="text-sm text-gray-700">עונה פעילה</span>
      </label>

      {error && <StatusMessage type="error" message={error} />}

      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          ביטול
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !form.greenhouse_id || !form.crop_name || !form.start_opening || !form.end_opening}
          className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'עדכן' : 'הוסף הגדרה'}
        </button>
      </div>
    </div>
  )
}

export default function SeasonSetupPage() {
  const [setups, setSetups] = useState([])
  const [greenhouses, setGreenhouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState({ open: false, setup: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    if (!isConfigured) {
      setGreenhouses(DEMO_GREENHOUSES.slice())
      setSetups(DEMO_SEASON_SETUPS.slice())
      setLoading(false)
      return
    }
    const [ghRes, ssRes] = await Promise.all([
      supabase.from('greenhouses').select('*').order('name'),
      supabase.from('season_setup').select('*, greenhouses(name)').order('created_at', { ascending: false }),
    ])
    setGreenhouses(ghRes.data || [])
    setSetups(ssRes.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setFormError(''); setModal({ open: true, setup: null }) }
  const openEdit = (s) => { setFormError(''); setModal({ open: true, setup: s }) }
  const closeModal = () => setModal({ open: false, setup: null })

  const handleSave = async (data) => {
    setSaving(true)
    setFormError('')
    try {
      if (!isConfigured) {
        if (modal.setup) {
          setSetups((prev) => prev.map((s) => s.id === modal.setup.id ? { ...s, ...data } : s))
        } else {
          setSetups((prev) => [...prev, { id: `demo-ss-${++demoId}`, ...data }])
        }
        closeModal()
        return
      }
      if (modal.setup) {
        const { error } = await supabase.from('season_setup').update(data).eq('id', modal.setup.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('season_setup').insert(data)
        if (error) throw error
      }
      await load()
      closeModal()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      if (!isConfigured) {
        setSetups((prev) => prev.filter((s) => s.id !== confirm.id))
        setConfirm({ open: false, id: null })
        return
      }
      await supabase.from('season_setup').delete().eq('id', confirm.id)
      await load()
      setConfirm({ open: false, id: null })
    } finally {
      setDeleting(false)
    }
  }

  const toggleActive = async (setup) => {
    if (!isConfigured) {
      setSetups((prev) => prev.map((s) => s.id === setup.id ? { ...s, is_active: !s.is_active } : s))
      return
    }
    await supabase.from('season_setup').update({ is_active: !setup.is_active }).eq('id', setup.id)
    setSetups((prev) => prev.map((s) => s.id === setup.id ? { ...s, is_active: !s.is_active } : s))
  }

  const ghName = (id) => greenhouses.find((g) => g.id === id)?.name || id

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">הגדרת עונה</h2>
          <span className="text-sm text-gray-400">({setups.length})</span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> הוסף הגדרה
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" size={24} /></div>
        ) : setups.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">אין הגדרות עונה עדיין. הוסף הגדרה לשיוך גידולים לפתחי החממה.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">גידול</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">חממה</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">פתחים</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">פעיל</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {setups.map((s) => {
                const color = getCropColor(s.crop_name)
                const openings = s.end_opening - s.start_opening + 1
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.border }} />
                        {s.crop_name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{s.greenhouses?.name || ghName(s.greenhouse_id)}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {s.start_opening} – {s.end_opening}
                        <span className="text-gray-400 ml-1.5">({openings} × 384 m²)</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button onClick={() => toggleActive(s)} className="transition-colors">
                        {s.is_active
                          ? <ToggleRight size={24} className="text-green-600" />
                          : <ToggleLeft size={24} className="text-gray-400" />
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setConfirm({ open: true, id: s.id })} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.setup ? 'עריכת הגדרת עונה' : 'הוספת הגדרת עונה'} maxWidth="max-w-md">
        <SetupForm initial={modal.setup} greenhouses={greenhouses} onSave={handleSave} onCancel={closeModal} saving={saving} error={formError} />
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="מחיקת הגדרת עונה"
        message="האם אתה בטוח? כל הרשומות המשויכות (השקיה, ריסוס, האבקה, יבול) לשיוך גידול זה יאבדו את הקישור שלהן."
        loading={deleting}
      />
    </div>
  )
}
