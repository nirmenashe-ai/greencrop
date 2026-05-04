import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Users, Loader2, Search } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { DEMO_EMPLOYEES } from '../../data/demoData'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StatusMessage from '../../components/common/StatusMessage'

let demoId = 10

function EmployeeForm({ initial, onSave, onCancel, saving, error }) {
  const [first, setFirst] = useState(initial?.first_name || '')
  const [last, setLast] = useState(initial?.last_name || '')
  return (
    <div className="p-5 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">First Name <span className="text-red-500">*</span></label>
          <input
            autoFocus
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Last Name <span className="text-red-500">*</span></label>
          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Smith"
          />
        </div>
      </div>
      {error && <StatusMessage type="error" message={error} />}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => first.trim() && last.trim() && onSave({ first_name: first.trim(), last_name: last.trim() })}
          disabled={saving || !first.trim() || !last.trim()}
          className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Update' : 'Add Employee'}
        </button>
      </div>
    </div>
  )
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, employee: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    if (!isConfigured) { setEmployees(DEMO_EMPLOYEES.slice()); setLoading(false); return }
    const { data } = await supabase.from('employees').select('*').order('last_name')
    setEmployees(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setFormError(''); setModal({ open: true, employee: null }) }
  const openEdit = (emp) => { setFormError(''); setModal({ open: true, employee: emp }) }
  const closeModal = () => setModal({ open: false, employee: null })

  const handleSave = async ({ first_name, last_name }) => {
    setSaving(true)
    setFormError('')
    try {
      if (!isConfigured) {
        if (modal.employee) {
          setEmployees((prev) => prev.map((e) => e.id === modal.employee.id ? { ...e, first_name, last_name } : e))
        } else {
          setEmployees((prev) => [...prev, { id: `demo-emp-${++demoId}`, first_name, last_name }])
        }
        closeModal()
        return
      }
      if (modal.employee) {
        const { error } = await supabase.from('employees').update({ first_name, last_name }).eq('id', modal.employee.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('employees').insert({ first_name, last_name })
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
        setEmployees((prev) => prev.filter((e) => e.id !== confirm.id))
        setConfirm({ open: false, id: null })
        return
      }
      await supabase.from('employees').delete().eq('id', confirm.id)
      await load()
      setConfirm({ open: false, id: null })
    } finally {
      setDeleting(false)
    }
  }

  const filtered = employees.filter((e) =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">Employees</h2>
          <span className="text-sm text-gray-400">({employees.length})</span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" size={24} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No employees match your search.' : 'No employees yet. Add one to get started.'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-700">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{emp.first_name} {emp.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirm({ open: true, id: emp.id })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
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

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.employee ? 'Edit Employee' : 'Add Employee'}
        maxWidth="max-w-sm"
      >
        <EmployeeForm
          initial={modal.employee}
          onSave={handleSave}
          onCancel={closeModal}
          saving={saving}
          error={formError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        loading={deleting}
      />
    </div>
  )
}
