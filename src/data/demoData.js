export const DEMO_GREENHOUSES = [
  { id: 'demo-gh-1', name: 'Greenhouse 1', total_openings: 7 },
  { id: 'demo-gh-2', name: 'Greenhouse 2', total_openings: 11 },
  { id: 'demo-gh-3', name: 'Greenhouse 3', total_openings: 18 },
]

export const DEMO_SEASON_SETUPS = [
  {
    id: 'demo-ss-1',
    greenhouse_id: 'demo-gh-3',
    crop_name: 'Cucumbers',
    start_opening: 1,
    end_opening: 4,
    is_active: true,
  },
  {
    id: 'demo-ss-2',
    greenhouse_id: 'demo-gh-3',
    crop_name: 'Peppers',
    start_opening: 5,
    end_opening: 7,
    is_active: true,
  },
]

export const DEMO_EMPLOYEES = [
  { id: 'demo-emp-1', first_name: 'John', last_name: 'Smith' },
  { id: 'demo-emp-2', first_name: 'Maria', last_name: 'Garcia' },
  { id: 'demo-emp-3', first_name: 'Ahmad', last_name: 'Hassan' },
]

export const DEMO_SPRAY_TYPES = [
  { id: 'demo-st-1', name: 'Pesticide A' },
  { id: 'demo-st-2', name: 'Fungicide B' },
  { id: 'demo-st-3', name: 'Herbicide C' },
]
