import { useState, useEffect } from 'react'
import { Flower, Loader2 } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { DEMO_EMPLOYEES } from '../../data/demoData'
import StatusMessage from '../common/StatusMessage'

function LastValue({ data, employees }) {
  if (!data) return <p className="text-xs text-gray-400 italic">לא נמצאה רשומה קודמת.</p>
  const emp = employees.find((e) => e.id === data.employee_id)
  return (
    <div className="space-y-1 text-sm">
      <Row label="פתח #" value={data.opening_num} />
      <Row label="תאריך" value={data.date} />
      <Row label="סוג אבקה" value={data.pollen_type} />
      <Row label="עובד" value={emp ? `${emp.first_name} ${emp.last_name}` : null} />
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
const DEFAULT_FORM = { opening_num: '', date: today(), pollen_type: '', employee_id: '' }

export default function FertilizationForm({ greenhouse, seasonSetup }) {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [lastValue, setLastValue] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loadingLast, setLoadingLast] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [openingError, setOpeningError] = useState('')

  const { start_opening, end_opening } = seasonSetup

  useEffect(() => {
    setStatus(null)
    setForm(DEFAULT_FORM)
    setOpeningError('')

    if (!isConfigured) {
      setEmployees(DEMO_EMPLOYEES)
      setLoadingLast(false)
      return
    }

    Promise.all([
      supabase.from('employees').select('*').order('first_name'),
      supabase
        .from('fertilization_logs')
        .select('*')
        .eq('season_setup_id', seasonSetup.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]).then(([empRes, lastRes]) => {
      setEmployees(empRes.data || [])
      setLastValue(lastRes.data)
      setLoadingLast(false)
    })
  }, [seasonSetup.id])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const validateOpening = (val) => {
    const n = parseInt(val)
    if (isNaN(n)) { setOpeningError('חייב להיות מספר.'); return false }
    if (n < start_opening || n > end_opening) {
      setOpeningError(`חייב להיות בין ${start_opening} ל-${end_opening}.`)
      return false
    }
    setOpeningError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateOpening(form.opening_num)) return
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
      const { error } = await supabase.from('fertilization_logs').insert({
        greenhouse_id: greenhouse.id,
        season_setup_id: seasonSetup.id,
        opening_num: parseInt(form.opening_num),
        date: form.date,
        pollen_type: form.pollen_type,
        employee_id: form.employee_id,
      })
      if (error) throw error
      setLastValue({ ...form })
      setForm(DEFAULT_FORM)
      setStatus({ type: 'success', message: 'רשומת ההאבקה נשמרה.' })
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
        {loadingLast ? <p className="text-xs text-gray-400">טוען...</p> : <LastValue data={lastValue} employees={employees} />}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">רשומה חדשה</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              פתח # <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={start_opening}
              max={end_opening}
              required
              value={form.opening_num}
              onChange={(e) => { set('opening_num', e.target.value); validateOpening(e.target.value) }}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${openingError ? 'border-red-400' : 'border-gray-300'}`}
              placeholder={`${start_opening}–${end_opening}`}
            />
            {openingError
              ? <p className="text-xs text-red-500 mt-1">{openingError}</p>
              : <p className="text-xs text-gray-400 mt-1">תקף: {start_opening} – {end_opening}</p>
            }
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              תאריך <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            סוג אבקה <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.pollen_type}
            onChange={(e) => set('pollen_type', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="לדוגמה: דבורים, מלאכותי"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            עובד <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.employee_id}
            onChange={(e) => set('employee_id', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">בחר עובד...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>

        {status && <StatusMessage type={status.type} message={status.message} />}

        <button
          type="submit"
          disabled={submitting || !!openingError}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Flower size={16} />}
          {submitting ? 'שומר...' : 'רשום האבקה'}
        </button>
      </form>
    </div>
  )
}
