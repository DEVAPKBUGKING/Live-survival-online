import { createClient } from '@supabase/supabase-js';

// GANTI dua nilai ini dengan milikmu dari Supabase dashboard (Settings → API)
const SUPABASE_URL = 'https://ujmnrrhvulzedezwjfmx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_xuaJr_Ue2zXKVSJGVvYUYg_ewQLpdO4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 10 } }
});

export function getClientId() {
  let id = localStorage.getItem('lso_client_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('lso_client_id', id);
  }
  return id;
}

export function getPlayerName() {
  return localStorage.getItem('lso_player_name') || '';
}

export function setPlayerName(name) {
  localStorage.setItem('lso_player_name', name);
}
