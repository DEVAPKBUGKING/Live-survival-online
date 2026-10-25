export class InventoryUI {
  constructor(container, inventory, onUse, onClose) {
    this.container = container;
    this.inventory = inventory;
    this.onUse = onUse;
    this.onClose = onClose;
    this.el = null;
    this.unsub = null;
    this.closed = false;
  }

  show() {
    this.el = document.createElement('div');
    this.el.id = 'inventory-screen';
    this.el.innerHTML = `
      <div class="inventory-panel">
        <div class="inventory-header">
          <h2>INVENTORY</h2>
          <button class="inventory-close" type="button">✕</button>
        </div>
        <div class="inventory-grid"></div>
        <div class="inventory-empty">Inventory kosong</div>
      </div>
    `;
    this.container.appendChild(this.el);

    const close = (e) => {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      if (this.closed) return;
      this.closed = true;
      if (this.onClose) this.onClose();
    };

    this.el.querySelector('.inventory-close').addEventListener('click', close);
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) close(e);
    });

    this.unsub = this.inventory.onChange(() => this.render());
    this.render();
  }

  render() {
    if (!this.el) return;
    const grid = this.el.querySelector('.inventory-grid');
    const empty = this.el.querySelector('.inventory-empty');
    const items = this.inventory.getItems();
    grid.innerHTML = '';
    if (items.length === 0) { empty.style.display = 'block'; return; }
    empty.style.display = 'none';
    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'inventory-item';
      card.innerHTML = `
        <div class="item-icon">${item.icon}</div>
        <div class="item-name">${item.name}</div>
        <div class="item-desc">${item.desc}</div>
        <div class="item-count">x${item.count}</div>
        <button class="item-use" type="button">GUNAKAN</button>
      `;
      card.querySelector('.item-use').addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.onUse) this.onUse(item.id);
      });
      grid.appendChild(card);
    }
  }

  hide() {
    if (this.unsub) { this.unsub(); this.unsub = null; }
    if (this.el) { this.el.remove(); this.el = null; }
  }
}
