import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Tag, Loader2, Search } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { DEMO_SPRAY_TYPES } from '../../data/demoData'
import Modal from '../../components/common/Modal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import StatusMessage from '../../components/common/StatusMessage'

let demoId = 10

function SprayTypeForm({ initial, onSave, onCancel, saving, error }) {
  const [name, setName] = useState(initial?.name || '')
  return (
    <div className="p-5 space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Spray Type Name <span className="text-red-500">*</span>
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="e.g. Pesticide A, Fungicide B"
        />
      </div>
      {error && <StatusMessage type="error" message={error} />}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={() => name.trim() && onSave({ name: name.trim() })}
          disabled={saving || !name.trim()}
          className="flex-1 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Update' : 'Add Type'}
        </button>
      </div>
    </div>
  )
}

export default function SprayTypesPage() {
  const [types, setTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, type: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    if (!isConfigured) { setTypes(DEMO_SPRAY_TYPES.slice()); setLoading(false); return }
    const { data } = await supabase.from('spray_types').select('*').order('name')
    setTypes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setFormError(''); setModal({ open: true, type: null }) }
  const openEdit = (t) => { setFormError(''); setModal({ open: true, type: t }) }
  const closeModal = () => setModal({ open: false, type: null })

  const handleSave = async ({ name }) => {
    setSaving(true)
    setFormError('')
    try {
      if (!isConfigured) {
        if (modal.type) {
          setTypes((prev) => prev.map((t) => t.id === modal.type.id ? { ...t, name } : t))
        } else {
          setTypes((prev) => [...prev, { id: `demo-st-${++demoId}`, name }])
        }
        closeModal()
        return
      }
      if (modal.type) {
        const { error } = await supabase.from('spray_types').update({ name }).eq('id', modal.type.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('spray_types').insert({ name })
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
        setTypes((prev) => prev.filter((t) => t.id !== confirm.id))
        setConfirm({ open: false, id: null })
        return
      }
      await supabase.from('spray_types').delete().eq('id', confirm.id)
      await load()
      setConfirm({ open: false, id: null })
    } finally {
      setDeleting(false)
    }
  }

  const filtered = types.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={20} className="text-green-600" />
          <h2 className="text-lg font-bold text-gray-800">Spray Types</h2>
          <span className="text-sm text-gray-400">({types.length})</span>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Add Type
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search types…"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-green-600" size={24} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? 'No types match your search.' : 'No spray types yet.'}</p>
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
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Tag size={13} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(t)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setConfirm({ open: true, id: t.id })}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      <Modal isOpen={modal.open} onClose={closeModal} title={modal.type ? 'Edit Spray Type' : 'Add Spray Type'} maxWidth="max-w-sm">
        <SprayTypeForm initial={modal.type} onSave={handleSave} onCancel={closeModal} saving={saving} error={formError} />
      </Modal>

      <ConfirmDialog
        isOpen={confirm.open}
        onClose={() => setConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Spray Type"
        message="Are you sure you want to delete this spray type? Existing spray logs referencing it will be affected."
        loading={deleting}
      />
    </div>
  )
}
