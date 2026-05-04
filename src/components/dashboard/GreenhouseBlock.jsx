import { Layers } from 'lucide-react'
import { getCropColor, EMPTY_COLOR } from '../../utils/cropColors'

function buildOpeningMap(seasonSetups) {
  const map = {}
  seasonSetups.forEach((setup) => {
    for (let i = setup.start_opening; i <= setup.end_opening; i++) {
      map[i] = setup
    }
  })
  return map
}

export default function GreenhouseBlock({ greenhouse, seasonSetups, onOpeningClick }) {
  const openingMap = buildOpeningMap(seasonSetups)
  const cols = Math.min(greenhouse.total_openings, greenhouse.total_openings <= 9 ? greenhouse.total_openings : 9)
  const totalArea = greenhouse.total_openings * 8 * 48
  const activeCrops = [...new Set(seasonSetups.map((s) => s.crop_name))]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-green-600" />
          <h3 className="text-sm font-bold text-gray-800">{greenhouse.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {greenhouse.total_openings} פתחים · {(totalArea / 1000).toFixed(1)} דונם
          </p>
        </div>
      </div>

      {seasonSetups.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-100 flex flex-wrap gap-1.5">
          {seasonSetups.map((setup) => {
            const color = getCropColor(setup.crop_name)
            return (
              <span
                key={setup.id}
                className="flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: color.bg,
                  color: color.text,
                  border: `1px solid ${color.border}`,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.border }} />
                {setup.crop_name} ({setup.start_opening}–{setup.end_opening})
              </span>
            )
          })}
        </div>
      )}

      <div className="p-3">
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: greenhouse.total_openings }, (_, i) => i + 1).map((num) => {
            const setup = openingMap[num]
            const color = setup ? getCropColor(setup.crop_name) : EMPTY_COLOR

            return (
              <button
                key={num}
                onClick={() => setup && onOpeningClick(greenhouse, setup)}
                disabled={!setup}
                title={setup ? `${setup.crop_name} — לחץ לרישום פעילות` : `פתח ${num} — לא מוגדר`}
                className={`rounded-lg p-2 text-center transition-all duration-150 min-h-[68px] flex flex-col items-center justify-center gap-1 ${
                  setup
                    ? 'cursor-pointer hover:scale-105 active:scale-95 shadow-sm hover:shadow-md'
                    : 'cursor-default'
                }`}
                style={{
                  backgroundColor: color.bg,
                  border: `1.5px solid ${color.border}`,
                }}
              >
                <span
                  className="text-xs font-bold leading-none"
                  style={{ color: color.text }}
                >
                  {num}
                </span>
                {setup ? (
                  <span
                    className="text-[10px] leading-tight max-w-full truncate px-0.5 font-medium"
                    style={{ color: color.text }}
                  >
                    {setup.crop_name}
                  </span>
                ) : (
                  <span className="text-[9px] text-gray-400">ריק</span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
