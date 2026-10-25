import { supabase } from '../config/supabase.js';

export class LoginUI {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
    this.isRegisterMode = false;
    this.el = null;
  }

  show() {
    this.el = document.createElement('div');
    this.el.style.cssText = `
      position: fixed; inset: 0; z-index: 100000; background: #0a0a12;
      display: flex; align-items: center; justify-content: center; padding: 24px; font-family: sans-serif;
    `;
    this.render();
    document.body.appendChild(this.el);
  }

  render() {
    this.el.innerHTML = `
      <div style="text-align: center; width: 100%; max-width: 320px;">
        <h1 style="color: #6ee7b7; letter-spacing: 5px; font-size: 2.5rem; margin-bottom: 10px; font-weight: 800;">LSO</h1>
        <p style="color: #9aa0b0; margin-bottom: 30px; font-size: 0.8rem;">Life Survival Online</p>
        
        <div id="login-error" style="display:none; background:rgba(255,68,68,.15); border:1px solid #ef4444; border-radius:10px; padding:10px; margin-bottom:12px; font-size:.8rem; color:#ef4444;"></div>
        
        <input type="text" id="l-u" placeholder="Username" autocomplete="off" style="width:100%; padding:15px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; font-size:1rem; margin-bottom:12px; outline:none;">
        <input type="password" id="l-p" placeholder="Password" style="width:100%; padding:15px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.1); border-radius:12px; color:#fff; font-size:1rem; margin-bottom:20px; outline:none;">
        
        <button id="auth-btn" style="width:100%; padding:15px; background:#6ee7b7; color:#000; border:none; border-radius:30px; font-weight:800; font-size:.9rem; cursor:pointer; transition:transform 0.2s;">MASUK</button>
        
        <p id="toggle-auth" style="margin-top: 25px; color: #9aa0b0; cursor: pointer; font-size: 0.9rem;">
          Belum punya akun? <span style="color: #6ee7b7;">Daftar</span>
        </p>
      </div>
    `;

    const btn = this.el.querySelector('#auth-btn');
    const toggle = this.el.querySelector('#toggle-auth');
    const errEl = this.el.querySelector('#login-error');
    const userIn = this.el.querySelector('#l-u');
    const passIn = this.el.querySelector('#l-p');

    toggle.addEventListener('click', () => {
      this.isRegisterMode = !this.isRegisterMode;
      btn.innerText = this.isRegisterMode ? 'DAFTAR' : 'MASUK';
      toggle.innerHTML = this.isRegisterMode 
        ? 'Sudah punya akun? <span style="color: #6ee7b7;">Masuk</span>' 
        : 'Belum punya akun? <span style="color: #6ee7b7;">Daftar</span>';
      errEl.style.display = 'none';
    });

    btn.addEventListener('click', async () => {
      const username = userIn.value.trim();
      const password = passIn.value.trim();

      if (!username || !password) {
        errEl.innerText = 'Isi username dan password!';
        errEl.style.display = 'block';
        return;
      }
      if (username.length < 3 || password.length < 4) {
        errEl.innerText = 'Username min 3 huruf, Password min 4 huruf!';
        errEl.style.display = 'block';
        return;
      }

      btn.disabled = true;
      btn.innerText = 'MEMPROSES...';
      errEl.style.display = 'none';

      try {
        if (this.isRegisterMode) {
          // --- PROSES DAFTAR ---
          // Cek username udah ada belum
          const { data: exist } = await supabase.from('profiles').select('username').eq('username', username).maybeSingle();
          if (exist) throw new Error("Username sudah dipakai!");

          // Bikin email dummy buat Supabase Auth (karena lu gamau pake email)
          const dummyEmail = `${username.toLowerCase()}@lso-game.com`;
          
          const { data: authData, error: authErr } = await supabase.auth.signUp({
            email: dummyEmail,
            password: password,
            options: { data: { username: username } }
          });

          if (authErr) throw authErr;

          // Simpan password mentah (biar bisa login pakai username nanti)
          await supabase.from('profiles').update({ password_text: password }).eq('id', authData.user.id);
          
          this.handleSuccess(authData.user);
        } else {
          // --- PROSES MASUK ---
          // Cari user berdasarkan username di tabel profiles
          const { data: profile, error: pErr } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
          
          if (!profile) throw new Error("Akun tidak ditemukan!");
          if (profile.password_text !== password) throw new Error("Password salah!");

          // Login ke Supabase pakai email dummy
          const dummyEmail = `${username.toLowerCase()}@lso-game.com`;
          const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: dummyEmail,
            password: password
          });

          if (authErr) throw authErr;
          this.handleSuccess(authData.user);
        }
      } catch (err) {
        errEl.innerText = err.message;
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.innerText = this.isRegisterMode ? 'DAFTAR' : 'MASUK';
      }
    });
  }

  async handleSuccess(user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    this.el.remove();
    this.onLoginSuccess(user, profile);
  }
}
