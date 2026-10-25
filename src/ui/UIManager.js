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
    // Simpan ke database
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

  buildDialogUI() { /* SAMA SEPERTI SEBELUMNYA */ }
  showDialog(speaker, text, onNext) { /* SAMA SEPERTI SEBELUMNYA */ }
  hideDialog() { /* SAMA SEPERTI SEBELUMNYA */ }
  buildLicenseUI() { /* SAMA SEPERTI SEBELUMNYA */ }
  showLicense() { /* SAMA SEPERTI SEBELUMNYA */ }
}
