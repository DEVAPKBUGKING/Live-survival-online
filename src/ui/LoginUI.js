import { supabase } from '../config/supabase.js';

export class LoginUI {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 100000; background: #0a0a12;
      display: flex; align-items: center; justify-content: center; padding: 24px; font-family: sans-serif;
    `;
    this.el.innerHTML = `
      <div style="width: 100%; max-width: 360px; background: #14142a; border: 1px solid #2a2a40; border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 14px;">
        <h2 style="color: #6ee7b7; text-align: center; letter-spacing: 2px; margin: 0 0 8px 0; font-size: 18px;">LOGIN / REGISTER</h2>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0;">
          Username
          <input id="login-user" type="text" placeholder="PlayerOne" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px;" />
        </label>
        
        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0;">
          Email (Buat Login)
          <input id="login-email" type="email" placeholder="email@example.com" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px;" />
        </label>

        <label style="display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: #9aa0b0;">
          Password
          <input id="login-pass" type="password" placeholder="******" style="padding: 12px; border: 1px solid #2a2a40; border-radius: 10px; background: #0a0a14; color: #e8e8f0; font-size: 15px;" />
        </label>
        
        <div id="login-error" style="font-size: 12px; color: #ef4444; min-height: 16px;"></div>
        
        <div style="display: flex; gap: 10px; margin-top: 6px;">
          <button id="btn-login" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #3b82f6; background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; font-weight: bold; cursor: pointer;">MASUK</button>
          <button id="btn-register" style="flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #2a2a40; background: rgba(40,40,60,0.8); color: #e8e8f0; font-weight: bold; cursor: pointer;">DAFTAR</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.el);

    const errEl = this.el.querySelector('#login-error');
    const userEl = this.el.querySelector('#login-user');
    const emailEl = this.el.querySelector('#login-email');
    const passEl = this.el.querySelector('#login-pass');

    this.el.querySelector('#btn-login').addEventListener('click', async () => {
      errEl.textContent = 'Memproses...';
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailEl.value, password: passEl.value
      });
      if (error) errEl.textContent = error.message;
      else this.handleSuccess(data.user);
    });

    this.el.querySelector('#btn-register').addEventListener('click', async () => {
      errEl.textContent = 'Memproses...';
      const { data, error } = await supabase.auth.signUp({
        email: emailEl.value, password: passEl.value,
        options: { data: { username: userEl.value } }
      });
      if (error) errEl.textContent = error.message;
      else {
        errEl.textContent = 'Cek email untuk verifikasi (atau langsung masuk jika dimatikan).';
        // Jika lu matiin "Confirm Email" di Supabase, dia bakal langsung login otomatis
        if (data.user && data.session) this.handleSuccess(data.user);
      }
    });
  }

  async handleSuccess(user) {
    // Ambil data profil (uang, ktp, admin)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    this.el.remove();
    this.onLoginSuccess(user, profile);
  }
}
