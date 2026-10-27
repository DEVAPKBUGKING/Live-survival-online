export class UIManager {
  constructor(container, userProfile) {
    this.container = container;
    this.money = userProfile?.money || 5000; 
    this.hasLicense = userProfile?.has_license || false; 
    this.userId = userProfile?.id;
    
    this.buildTopRightUI();
    this.buildDialogUI();
    this.buildLicenseUI();
  }

  buildTopRightUI() {
    this.topRight = document.createElement('div');
    this.topRight.style.cssText = `position: fixed; top: 70px; right: 16px; z-index: 9000; text-align: right; font-family: sans-serif; color: #fff; text-shadow: 1px 1px 3px #000; pointer-events: none;`;
    document.body.appendChild(this.topRight);
    this.updateMoney();
  }

  updateMoney() {
    this.topRight.innerHTML = `
      <div style="font-size: 20px; font-weight: 800; color: #6ee7b7;">$${this.money}</div>
      <div style="font-size: 12px; margin-top: 5px; color: ${this.hasLicense ? '#60a5fa' : '#9aa0b0'}">
        ${this.hasLicense ? 'LICENSE: ACTIVE' : 'LICENSE: NONE'}
      </div>
    `;
  }

  async addMoney(amount) {
    this.money += amount;
    this.updateMoney();
    if (this.userId) {
      const { supabase } = await import('../config/supabase.js');
      await supabase.from('profiles').update({ money: this.money }).eq('id', this.userId);
    }
  }

  async giveLicense() {
    this.hasLicense = true;
    this.updateMoney();
    if (this.userId) {
      const { supabase } = await import('../config/supabase.js');
      await supabase.from('profiles').update({ has_license: true }).eq('id', this.userId);
    }
  }

  buildDialogUI() {
    this.dialogEl = document.createElement('div');
    this.dialogEl.style.cssText = `position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 500px; background: rgba(10,10,20,0.95); border: 2px solid #3b82f6; border-radius: 12px; padding: 16px; z-index: 9999; display: none; flex-direction: column; gap: 10px; font-family: sans-serif;`;
    this.dialogEl.innerHTML = `
      <div id="dialog-speaker" style="color: #fbbf24; font-weight: 800; font-size: 16px;">NPC</div>
      <div id="dialog-text" style="color: #e8e8f0; font-size: 14px; line-height: 1.4;">Teks...</div>
      <button id="dialog-next" style="align-self: flex-end; padding: 8px 16px; background: #3b82f6; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; pointer-events: auto;">LANJUT</button>
    `;
    document.body.appendChild(this.dialogEl);
    this.dialogEl.querySelector('#dialog-next').addEventListener('click', () => { if (this.onDialogNext) this.onDialogNext(); });
  }

  showDialog(speaker, text, onNext) {
    this.dialogEl.querySelector('#dialog-speaker').textContent = speaker;
    this.dialogEl.querySelector('#dialog-text').textContent = text;
    this.dialogEl.style.display = 'flex';
    this.onDialogNext = onNext;
  }

  hideDialog() { this.dialogEl.style.display = 'none'; this.onDialogNext = null; }

  buildLicenseUI() {
    this.licenseEl = document.createElement('div');
    this.licenseEl.style.cssText = `position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: none; align-items: center; justify-content: center;`;
    this.licenseEl.innerHTML = `
      <div style="background: #14142a; padding: 20px; border-radius: 12px; border: 2px solid #6ee7b7; text-align: center; width: 300px; font-family: sans-serif;">
        <h2 style="color: #6ee7b7; margin-bottom: 10px;">IDENTITY CARD</h2>
        <div style="color: #fff; text-align: left; font-size: 14px; margin-bottom: 20px;">
          <b>Name:</b> Player<br><b>Country:</b> Forge<br><b>Status:</b> Citizen
        </div>
        <button id="close-license" style="padding: 10px; width: 100%; background: #3b82f6; border: none; border-radius: 6px; color: #fff; font-weight: bold; cursor: pointer;">TUTUP</button>
      </div>
    `;
    document.body.appendChild(this.licenseEl);
    this.licenseEl.querySelector('#close-license').addEventListener('click', () => { this.licenseEl.style.display = 'none'; });
  }

  showLicense() { this.licenseEl.style.display = 'flex'; }
}
