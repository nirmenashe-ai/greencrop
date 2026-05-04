import { useState, useEffect } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { DEMO_GREENHOUSES, DEMO_SEASON_SETUPS } from '../../data/demoData'
import GreenhouseBlock from './GreenhouseBlock'
import ActionModal from './ActionModal'

export default function GreenhouseMap() {
  const [greenhouses, setGreenhouses] = useState([])
  const [seasonSetups, setSeasonSetups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState({ open: false, greenhouse: null, seasonSetup: null })

  useEffect(() => {
    if (!isConfigured) {
      setGreenhouses(DEMO_GREENHOUSES)
      setSeasonSetups(DEMO_SEASON_SETUPS)
      setLoading(false)
      return
    }

    Promise.all([
      supabase.from('greenhouses').select('*').order('name'),
      supabase.from('season_setup').select('*').eq('is_active', true),
    ])
      .then(([ghRes, ssRes]) => {
        if (ghRes.error) throw ghRes.error
        if (ssRes.error) throw ssRes.error
        setGreenhouses(ghRes.data || [])
        setSeasonSetups(ssRes.data || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleOpeningClick = (greenhouse, seasonSetup) => {
    setModal({ open: true, greenhouse, seasonSetup })
  }

  const closeModal = () => setModal({ open: false, greenhouse: null, seasonSetup: null })

  const getSetups = (ghId) => seasonSetups.filter((s) => s.greenhouse_id === ghId)

  const gh3 = greenhouses.find((g) => g.name.includes('3'))
  const gh2 = greenhouses.find((g) => g.name.includes('2'))
  const gh1 = greenhouses.find((g) => g.name.includes('1'))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-green-600" size={28} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        <AlertCircle size={18} />
        <div>
          <p className="text-sm font-medium">Failed to load greenhouse data</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {gh3 && (
          <GreenhouseBlock
            greenhouse={gh3}
            seasonSetups={getSetups(gh3.id)}
            onOpeningClick={handleOpeningClick}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gh2 && (
            <GreenhouseBlock
              greenhouse={gh2}
              seasonSetups={getSetups(gh2.id)}
              onOpeningClick={handleOpeningClick}
            />
          )}
          {gh1 && (
            <GreenhouseBlock
              greenhouse={gh1}
              seasonSetups={getSetups(gh1.id)}
              onOpeningClick={handleOpeningClick}
            />
          )}
        </div>
      </div>

      <ActionModal
        isOpen={modal.open}
        onClose={closeModal}
        greenhouse={modal.greenhouse}
        seasonSetup={modal.seasonSetup}
      />
    </>
  )
}
