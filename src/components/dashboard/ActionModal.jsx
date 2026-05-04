import { useState } from 'react'
import { Droplets, Wind, Flower, Package } from 'lucide-react'
import Modal from '../common/Modal'
import IrrigationForm from '../forms/IrrigationForm'
import SprayingForm from '../forms/SprayingForm'
import FertilizationForm from '../forms/FertilizationForm'
import YieldForm from '../forms/YieldForm'
import { getCropColor } from '../../utils/cropColors'

const TABS = [
  { id: 'irrigation', label: 'השקיה', Icon: Droplets },
  { id: 'spraying', label: 'ריסוס', Icon: Wind },
  { id: 'fertilization', label: 'האבקה', Icon: Flower },
  { id: 'yield', label: 'יבול', Icon: Package },
]

export default function ActionModal({ isOpen, onClose, greenhouse, seasonSetup }) {
  const [activeTab, setActiveTab] = useState('irrigation')

  if (!greenhouse || !seasonSetup) return null

  const color = getCropColor(seasonSetup.crop_name)
  const openingCount = seasonSetup.end_opening - seasonSetup.start_opening + 1
  const areaDunam = ((openingCount * 8 * 48) / 1000).toFixed(2)

  const subtitle = `${seasonSetup.crop_name} · פתחים ${seasonSetup.start_opening}–${seasonSetup.end_opening} · ${areaDunam} דונם`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={greenhouse.name}
      subtitle={subtitle}
      maxWidth="max-w-xl"
    >
      <div
        className="flex items-center gap-2 px-5 py-2 border-b border-gray-100"
        style={{ backgroundColor: color.light }}
      >
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.border }} />
          {seasonSetup.crop_name}
        </span>
        <span className="text-xs text-gray-500">{openingCount} פתחים · {openingCount * 8}מ רוחב</span>
      </div>

      <div className="flex border-b border-gray-100 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === id
                ? 'border-green-600 text-green-700 bg-green-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'irrigation' && <IrrigationForm greenhouse={greenhouse} seasonSetup={seasonSetup} />}
      {activeTab === 'spraying' && <SprayingForm greenhouse={greenhouse} seasonSetup={seasonSetup} />}
      {activeTab === 'fertilization' && <FertilizationForm greenhouse={greenhouse} seasonSetup={seasonSetup} />}
      {activeTab === 'yield' && <YieldForm greenhouse={greenhouse} seasonSetup={seasonSetup} />}
    </Modal>
  )
}
