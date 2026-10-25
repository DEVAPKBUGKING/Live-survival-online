const ITEMS = {
  water: { id: 'water', name: 'Air Mineral', desc: 'Memulihkan haus +30', icon: '💧', type: 'drink', effect: { thirst: 30 } },
  bread: { id: 'bread', name: 'Roti', desc: 'Memulihkan lapar +25', icon: '🍞', type: 'food', effect: { hunger: 25 } },
  rice: { id: 'rice', name: 'Nasi Kotak', desc: 'Memulihkan lapar +40', icon: '🍚', type: 'food', effect: { hunger: 40 } },
  snack: { id: 'snack', name: 'Makanan Ringan', desc: 'Memulihkan lapar +15', icon: '🍪', type: 'food', effect: { hunger: 15 } },
  soda: { id: 'soda', name: 'Minuman Kemasan', desc: 'Memulihkan haus +20', icon: '🥤', type: 'drink', effect: { thirst: 20 } },
  medkit: { id: 'medkit', name: 'Obat', desc: 'Memulihkan health +40', icon: '💊', type: 'heal', effect: { health: 40 } }
};

export class Inventory {
  constructor() {
    this.capacity = 12;
    this.slots = []; // { itemId, count }
    this.listeners = new Set();
  }

  add(itemId, count = 1) {
    if (!ITEMS[itemId]) throw new Error('Item tidak dikenal: ' + itemId);
    let remaining = count;

    // Cari slot yang sama
    for (const s of this.slots) {
      if (s.itemId === itemId) {
        const space = 99 - s.count;
        const add = Math.min(space, remaining);
        s.count += add;
        remaining -= add;
        if (remaining <= 0) { this.emit(); return true; }
      }
    }

    // Slot baru
    while (remaining > 0 && this.slots.length < this.capacity) {
      const add = Math.min(99, remaining);
      this.slots.push({ itemId, count: add });
      remaining -= add;
    }

    this.emit();
    return remaining <= 0;
  }

  use(itemId) {
    const slot = this.slots.find(s => s.itemId === itemId);
    if (!slot || slot.count <= 0) return null;
    slot.count--;
    if (slot.count <= 0) {
      this.slots = this.slots.filter(s => s !== slot);
    }
    this.emit();
    return ITEMS[itemId];
  }

  getItems() {
    return this.slots.map(s => ({
      ...ITEMS[s.itemId],
      count: s.count
    }));
  }

  getCount(itemId) {
    const slot = this.slots.find(s => s.itemId === itemId);
    return slot ? slot.count : 0;
  }

  onChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  emit() {
    for (const cb of this.listeners) cb(this.getItems());
  }
}

export { ITEMS };
