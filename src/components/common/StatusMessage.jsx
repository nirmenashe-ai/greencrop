import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

const styles = {
  success: {
    wrapper: 'bg-green-50 border-green-200 text-green-800',
    Icon: CheckCircle2,
  },
  error: {
    wrapper: 'bg-red-50 border-red-200 text-red-800',
    Icon: AlertCircle,
  },
  info: {
    wrapper: 'bg-blue-50 border-blue-200 text-blue-800',
    Icon: Info,
  },
}

export default function StatusMessage({ type = 'info', message }) {
  if (!message) return null
  const { wrapper, Icon } = styles[type] || styles.info
  return (
    <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-sm ${wrapper}`}>
      <Icon size={16} className="flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
