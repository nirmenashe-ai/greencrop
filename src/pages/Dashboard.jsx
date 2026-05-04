import { useEffect, useState } from 'react'
import { Layers, Sprout, AreaChart, CalendarDays } from 'lucide-react'
import { supabase, isConfigured } from '../lib/supabase'
import { DEMO_GREENHOUSES, DEMO_SEASON_SETUPS } from '../data/demoData'
import GreenhouseMap from '../components/dashboard/GreenhouseMap'

function StatCard({ icon: Icon, label, value, color = 'text-green-600', bg = 'bg-green-50' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${bg}`}>
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({ greenhouses: 0, crops: 0, area: 0 })
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!isConfigured) {
      const crops = [...new Set(DEMO_SEASON_SETUPS.map((s) => s.crop_name))].length
      const area = DEMO_GREENHOUSES.reduce((sum, g) => sum + g.total_openings * 8 * 48, 0)
      setStats({ greenhouses: DEMO_GREENHOUSES.length, crops, area })
      return
    }
    Promise.all([
      supabase.from('greenhouses').select('id, total_openings'),
      supabase.from('season_setup').select('crop_name').eq('is_active', true),
    ]).then(([ghRes, ssRes]) => {
      const ghs = ghRes.data || []
      const ss = ssRes.data || []
      const crops = [...new Set(ss.map((s) => s.crop_name))].length
      const area = ghs.reduce((sum, g) => sum + g.total_openings * 8 * 48, 0)
      setStats({ greenhouses: ghs.length, crops, area })
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Farm Overview</h2>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Layers} label="Greenhouses" value={stats.greenhouses} />
        <StatCard icon={Sprout} label="Active Crops" value={stats.crops} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard
          icon={AreaChart}
          label="Total Area"
          value={`${(stats.area / 1000).toFixed(1)} dun`}
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={CalendarDays}
          label="Season"
          value={new Date().getFullYear()}
          color="text-purple-600"
          bg="bg-purple-50"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Greenhouse Map</h3>
          <span className="text-xs text-gray-400">· Click any crop section to log activity</span>
        </div>
        <GreenhouseMap />
      </div>
    </div>
  )
}
