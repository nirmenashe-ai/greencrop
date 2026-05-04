import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'מחק', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <p className="text-sm text-gray-600 pt-1">{message}</p>
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'מוחק...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
