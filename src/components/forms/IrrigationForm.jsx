import { useState, useEffect } from 'react'
import { Droplets, Loader2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import StatusMessage from '../common/StatusMessage'

function LastValue({ data }) {
  if (!data) return <p className="text-xs text-gray-400 italic">לא נמצאה רשומה קודמת.</p>
  return (
    <div className="space-y-1 text-sm">
      <Row label="נפח" value={`${data.m3_per_dunam} מ"ק/דונם`} />
      <Row label="מחזורים" value={data.cycles} />
      <Row label="תאריך התחלה" value={data.start_date} />
      <Row label="תאריך סיום" value={data.end_date} />
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value ?? '—'}</span>
    </div>
  )
}

const DEFAULT_FORM = { m3_per_dunam: '', cycles: '', start_date: '', end_date: '' }

export default function IrrigationForm({ greenhouse, seasonSetup }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [lastValue, setLastValue] = useState(null)
  const [loadingLast, setLoadingLast] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    setStatus(null)
    setForm(DEFAULT_FORM)
    if (!isConfigured) { setLoadingLast(false); return }
    supabase
      .from('irrigation_logs')
      .select('*')
      .eq('season_setup_id', seasonSetup.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { setLastValue(data); setLoadingLast(false) })
  }, [seasonSetup.id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setStatus(null)
    try {
      if (!isConfigured) {
        await new Promise((r) => setTimeout(r, 600))
        setLastValue({ ...form })
        setForm(DEFAULT_FORM)
        setStatus({ type: 'success', message: 'רשומה נרשמה (מצב הדגמה).' })
        return
      }
      const { error } = await supabase.from('irrigation_logs').insert({
        greenhouse_id: greenhouse.id,
        season_setup_id: seasonSetup.id,
        m3_per_dunam: parseFloat(form.m3_per_dunam),
        cycles: parseInt(form.cycles),
        start_date: form.start_date,
        end_date: form.end_date,
      })
      if (error) throw error
      setLastValue({ ...form })
      setForm(DEFAULT_FORM)
      setStatus({ type: 'success', message: 'רשומת ההשקיה נשמרה.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'שגיאה בשמירה.' })
    } finally {
      setSubmitting(false)
    }
  }

  const dunamArea = ((seasonSetup.end_opening - seasonSetup.start_opening + 1) * 8 * 48) / 1000

  return (
    <div className="p-5 space-y-5">
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2.5">רשומה אחרונה</p>
        {loadingLast ? <p className="text-xs text-gray-400">טוען...</p> : <LastValue data={lastValue} />}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">רשומה חדשה</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              נפח (מ"ק/דונם) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              required
              value={form.m3_per_dunam}
              onChange={(e) => set('m3_per_dunam', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="לדוגמה 15.5"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              מחזורים <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.cycles}
              onChange={(e) => set('cycles', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="לדוגמה 3"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              תאריך התחלה <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              תאריך סיום <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.end_date}
              min={form.start_date}
              onChange={(e) => set('end_date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {form.m3_per_dunam && (
          <p className="text-xs text-gray-400">
            כמות משוערת: {(parseFloat(form.m3_per_dunam) * dunamArea).toFixed(1)} מ"ק עבור {dunamArea.toFixed(2)} דונם
          </p>
        )}

        {status && <StatusMessage type={status.type} message={status.message} />}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Droplets size={16} />}
          {submitting ? 'שומר...' : 'רשום השקיה'}
        </button>
      </form>
    </div>
  )
}
