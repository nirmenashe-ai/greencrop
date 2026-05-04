const PALETTE = [
  { bg: '#dcfce7', border: '#16a34a', text: '#14532d', light: '#f0fdf4' },
  { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', light: '#fef2f2' },
  { bg: '#fef9c3', border: '#ca8a04', text: '#713f12', light: '#fefce8' },
  { bg: '#dbeafe', border: '#2563eb', text: '#1e3a5f', light: '#eff6ff' },
  { bg: '#f3e8ff', border: '#9333ea', text: '#581c87', light: '#faf5ff' },
  { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', light: '#fff7ed' },
  { bg: '#e0f2fe', border: '#0284c7', text: '#0c4a6e', light: '#f0f9ff' },
  { bg: '#fce7f3', border: '#db2777', text: '#831843', light: '#fdf2f8' },
  { bg: '#d1fae5', border: '#059669', text: '#064e3b', light: '#ecfdf5' },
]

const EMPTY_COLOR = { bg: '#f3f4f6', border: '#d1d5db', text: '#9ca3af', light: '#f9fafb' }

const cache = {}

export function getCropColor(cropName) {
  if (!cropName) return EMPTY_COLOR
  if (cache[cropName]) return cache[cropName]
  let hash = 0
  for (let i = 0; i < cropName.length; i++) {
    hash = cropName.charCodeAt(i) + ((hash << 5) - hash)
  }
  const color = PALETTE[Math.abs(hash) % PALETTE.length]
  cache[cropName] = color
  return color
}

export { EMPTY_COLOR }
