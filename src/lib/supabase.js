import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export const isConfigured = Boolean(url && key)
export const isAdminConfigured = Boolean(url && serviceKey)

export const supabase = isConfigured ? createClient(url, key) : null
export const supabaseAdmin = isAdminConfigured
  ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null
