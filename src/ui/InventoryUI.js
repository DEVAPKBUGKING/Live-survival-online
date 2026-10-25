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
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 9999; background: rgba(5,5,15,0.85);
      display: flex; align-items: center; justify-content: center; padding: 20px;
      font-family: sans-serif;
    `;
    
    this.el.innerHTML = `
      <div style="width: 100%; max-width: 420px; max-height: 80vh; overflow-y: auto; background: #14142a; border: 1px solid #2a2a40; border-radius: 16px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h2 style="color: #6ee7b7; letter-spacing: 3px; margin: 0; font-size: 16px;">INVENTORY</h2>
          <button class="inventory-close" type="button" style="width: 36px; height: 36px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #e8e8f0; font-size: 16px; cursor: pointer;">✕</button>
        </div>
        <div class="inventory-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;"></div>
        <div class="inventory-empty" style="text-align: center; color: #6b7280; font-size: 13px; padding: 30px; display: none;">Inventory kosong</div>
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
    
    if (items.length === 0) { 
      empty.style.display = 'block'; 
      return; 
    }
    empty.style.display = 'none';

    for (const item of items) {
      const card = document.createElement('div');
      card.style.cssText = `background: rgba(30,30,50,0.8); border: 1px solid #2a2a40; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 6px;`;
      card.innerHTML = `
        <div style="font-size: 28px;">${item.icon}</div>
        <div style="font-size: 13px; font-weight: 700; color: #e8e8f0;">${item.name}</div>
        <div style="font-size: 10px; color: #9aa0b0;">${item.desc}</div>
        <div style="font-size: 11px; color: #6ee7b7; font-weight: 700;">x${item.count}</div>
        <button class="item-use" type="button" style="padding: 8px; border-radius: 8px; border: 1px solid #3b82f6; background: rgba(59,130,246,0.25); color: #60a5fa; font-size: 11px; font-weight: 700; cursor: pointer; margin-top: 4px;">GUNAKAN</button>
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
