    if (player.is_host) {
      const startBtn = this.el.querySelector('#lobby-start');
      startBtn.style.display = 'block';
      startBtn.addEventListener('click', async () => {
        if (this.starting) return;
        this.starting = true;
        startBtn.textContent = 'STARTING...';
        try {
          await this.rooms.startGame();
          // HOST: langsung masuk game tanpa menunggu broadcast balik.
          // Broadcast tetap dikirim untuk pemain lain.
          this.onStart({ startedAt: Date.now() });
        } catch (e) {
          alert(e.message);
          this.starting = false;
          startBtn.textContent = 'START GAME';
        }
      });
    }
