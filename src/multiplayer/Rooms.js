import { supabase, getClientId } from '../config/supabase.js';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function saveToHistory(room) {
  const key = 'lso_room_history';
  const history = JSON.parse(localStorage.getItem(key) || '[]');
  const filtered = history.filter(h => h.code !== room.code);
  filtered.unshift({ code: room.code, roomName: room.name, joinedAt: Date.now() });
  localStorage.setItem(key, JSON.stringify(filtered.slice(0, 10)));
}

export class Rooms {
  constructor() {
    this.currentRoom = null;
    this.currentPlayer = null;
    this.channel = null;
    this.listeners = new Set();
  }

  async createRoom({ name, roomName, maxPlayers }) {
    const clientId = getClientId();
    let room = null;

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode();
      const { data, error } = await supabase
        .from('rooms')
        .insert({ code, name: roomName, host_id: clientId, max_players: maxPlayers, status: 'playing' })
        .select().single();

      if (!error) { room = data; break; }
      if (error.code !== '23505') throw new Error('Gagal buat room: ' + error.message);
    }
    if (!room) throw new Error('Gagal generate kode unik, coba lagi.');

    const { data: player, error: pErr } = await supabase
      .from('room_players')
      .insert({ room_id: room.id, client_id: clientId, name, is_host: true })
      .select().single();
    if (pErr) throw new Error('Gagal masuk room: ' + pErr.message);

    this.currentRoom = room;
    this.currentPlayer = player;
    saveToHistory(room);
    await this.subscribeToRoom(room.id);
    return { room, player };
  }

  async joinRoom({ code, name }) {
    const clientId = getClientId();
    const upperCode = code.trim().toUpperCase();

    const { data: rooms, error: rErr } = await supabase
      .from('rooms').select('*')
      .eq('code', upperCode).limit(1);
    if (rErr) throw new Error('Gagal cari room: ' + rErr.message);
    if (!rooms || rooms.length === 0) throw new Error('Room tidak ditemukan.');
    const room = rooms[0];

    if (room.status === 'ended') throw new Error('Room sudah berakhir.');

    const { count } = await supabase
      .from('room_players').select('*', { count: 'exact', head: true })
      .eq('room_id', room.id);
    if (count >= room.max_players) throw new Error(`Room penuh (${count}/${room.max_players}).`);

    const { data: existing } = await supabase
      .from('room_players').select('*')
      .eq('room_id', room.id).eq('client_id', clientId).limit(1);

    let player;
    let isNewJoin = false;
    if (existing && existing.length > 0) {
      player = existing[0];
    } else {
      const { data: p, error: pErr } = await supabase
        .from('room_players')
        .insert({ room_id: room.id, client_id: clientId, name, is_host: false })
        .select().single();
      if (pErr) throw new Error('Gagal join: ' + pErr.message);
      player = p;
      isNewJoin = true;

      // Kalau room sudah ada host lain dan statusnya sudah playing,
      // pastikan tetap 'playing' — jangan reset.
      if (room.status !== 'playing') {
        await supabase.from('rooms')
          .update({ status: 'playing', started_at: room.started_at || new Date().toISOString() })
          .eq('id', room.id);
      }
    }

    this.currentRoom = room;
    this.currentPlayer = player;
    saveToHistory(room);
    await this.subscribeToRoom(room.id);

    if (isNewJoin) {
      this.channel?.send({
        type: 'broadcast', event: 'player_joined',
        payload: { name, clientId }
      });
    }

    return { room, player };
  }

  async subscribeToRoom(roomId) {
    this.unsubscribe();
    this.channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } }
    });

    this.channel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` },
        () => this.emit('players_changed'))
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => this.emit('room_changed', payload.new))
      .on('broadcast', { event: 'pos' },
        (payload) => this.emit('pos', payload.payload))
      .on('broadcast', { event: 'bye' },
        (payload) => this.emit('bye', payload.payload))
      .on('broadcast', { event: 'player_joined' },
        (payload) => this.emit('player_joined', payload.payload))
      .subscribe((status) => this.emit('connection', status));
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  async fetchPlayers() {
    if (!this.currentRoom) return [];
    const { data, error } = await supabase
      .from('room_players').select('*')
      .eq('room_id', this.currentRoom.id)
      .order('joined_at', { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
  }

  async leaveRoom() {
    if (!this.currentPlayer) return;

    try {
      await this.channel?.send({
        type: 'broadcast', event: 'bye',
        payload: { clientId: getClientId() }
      });
    } catch {}

    await supabase.from('room_players').delete().eq('id', this.currentPlayer.id);

    this.unsubscribe();
    this.currentRoom = null;
    this.currentPlayer = null;
  }

  sendPosition(data) {
    if (!this.channel) return;
    this.channel.send({ type: 'broadcast', event: 'pos', payload: data });
  }

  on(event, cb) {
    const wrapped = { event, cb };
    this.listeners.add(wrapped);
    return () => this.listeners.delete(wrapped);
  }

  emit(event, data) {
    for (const l of this.listeners) if (l.event === event) l.cb(data);
  }
}
