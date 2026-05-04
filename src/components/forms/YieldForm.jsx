import { useState, useEffect } from 'react'
import { Package, Loader2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import StatusMessage from '../common/StatusMessage'

function LastValue({ data }) {
  if (!data) return <p className="text-xs text-gray-400 italic">לא נמצאה רשומה קודמת.</p>
  return (
    <div className="space-y-1 text-sm">
      <Row label="תאריך קטיף" value={data.harvest_date} />
      <Row label="תאריך ייצור" value={data.production_date} />
      <Row label='משקל (ק"ג)' value={data.weight_kg ? `${data.weight_kg} ק"ג` : null} />
      <Row label="חיטוי" value={data.disinfection_boolean ? `כן — ${data.disinfection_type || 'לא צוין'}` : 'לא'} />
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

const today = () => new Date().toISOString().split('T')[0]
const DEFAULT_FORM = {
  harvest_date: today(),
  production_date: '',
  disinfection_boolean: false,
  disinfection_type: '',
  weight_kg: '',
}

export default function YieldForm({ greenhouse, seasonSetup }) {
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
      .from('yield_logs')
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
      const { error } = await supabase.from('yield_logs').insert({
        greenhouse_id: greenhouse.id,
        season_setup_id: seasonSetup.id,
        harvest_date: form.harvest_date,
        production_date: form.production_date || null,
        disinfection_boolean: form.disinfection_boolean,
        disinfection_type: form.disinfection_boolean ? form.disinfection_type : null,
        weight_kg: parseFloat(form.weight_kg),
      })
      if (error) throw error
      setLastValue({ ...form })
      setForm(DEFAULT_FORM)
      setStatus({ type: 'success', message: 'רשומת היבול נשמרה.' })
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'שגיאה בשמירה.' })
    } finally {
      setSubmitting(false)
    }
  }

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
              תאריך קטיף <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.harvest_date}
              onChange={(e) => set('harvest_date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">תאריך ייצור</label>
            <input
              type="date"
              value={form.production_date}
              onChange={(e) => set('production_date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            משקל (ק"ג) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            required
            value={form.weight_kg}
            onChange={(e) => set('weight_kg', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="לדוגמה 250.5"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.disinfection_boolean}
              onChange={(e) => set('disinfection_boolean', e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">בוצע חיטוי</span>
          </label>
          {form.disinfection_boolean && (
            <input
              type="text"
              value={form.disinfection_type}
              onChange={(e) => set('disinfection_type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="סוג/מוצר חיטוי..."
            />
          )}
        </div>

        {status && <StatusMessage type={status.type} message={status.message} />}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
          {submitting ? 'שומר...' : 'רשום יבול'}
        </button>
      </form>
    </div>
  )
}
