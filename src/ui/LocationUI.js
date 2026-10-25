export class LocationUI {
  constructor(container) {
    this.infoEl = document.createElement('div');
    this.infoEl.style.cssText = `
      position: fixed; top: 70px; right: 16px; z-index: 90;
      color: #fff; font-family: sans-serif; text-align: right;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.8); pointer-events: none;
    `;
    document.body.appendChild(this.infoEl);
    this.currentLocation = { country: 'Forge', city: 'Cucum' };
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    this.infoEl.innerHTML = `
      <div style="font-size: 20px; font-weight: 800; text-transform: uppercase;">${this.currentLocation.city}</div>
      <div style="font-size: 12px; color: #6ee7b7; font-weight: 600; letter-spacing: 2px;">${this.currentLocation.country}</div>
      <div style="font-size: 16px; font-weight: 700; margin-top: 4px; font-family: monospace;">${timeString}</div>
    `;
  }

  showTeleportScreen(country, city, callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `position: fixed; inset: 0; z-index: 100000; background: #000; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #fff; font-family: sans-serif;`;
    overlay.innerHTML = `
      <div style="font-size: 14px; color: #9aa0b0; letter-spacing: 3px; margin-bottom: 10px;">TRAVELING TO</div>
      <div style="font-size: 32px; font-weight: 800; text-transform: uppercase; color: #6ee7b7;">${city}</div>
      <div style="font-size: 16px; font-weight: 600; text-transform: uppercase; margin-top: 5px;">${country}</div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.remove();
      this.currentLocation = { country, city };
      this.updateTime();
      if (callback) callback();
    }, 2000);
  }
}
