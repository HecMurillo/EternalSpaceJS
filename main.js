// --- Manejo avanzado de sonido para menú ---
const menuMusic = document.getElementById('menu-music');
let soundBtn = null;
let isMusicPlaying = false;

function updateSoundBtn() {
    if (!soundBtn) return;
    soundBtn.textContent = isMusicPlaying ? 'Quitar sonido' : 'Activar sonido';
}

async function toggleMusic() {
    if (!menuMusic) return;
    if (isMusicPlaying) {
        // fade out then pause
        await fadeVolume(menuMusic, 0, 600);
        menuMusic.pause();
        isMusicPlaying = false;
    } else {
        try {
            // start from silence and fade in
            menuMusic.volume = 0;
            await menuMusic.play();
            await fadeVolume(menuMusic, 0.6, 800);
            isMusicPlaying = true;
        } catch (err) {
            isMusicPlaying = false;
        }
    }
    updateSoundBtn();
}

function createSoundButtonIfNeeded() {
    if (document.getElementById('sound-activate')) {
        soundBtn = document.getElementById('sound-activate');
        return;
    }
    soundBtn = document.createElement('button');
    soundBtn.id = 'sound-activate';
    soundBtn.className = 'sound-activate';
    soundBtn.textContent = isMusicPlaying ? 'Quitar sonido' : 'Activar sonido';
    soundBtn.addEventListener('click', toggleMusic);
    document.body.appendChild(soundBtn);
}

async function tryPlayMusic() {
    if (!menuMusic) return;
    createSoundButtonIfNeeded();
    try {
        // Try autoplay with fade in
        menuMusic.volume = 0;
        await menuMusic.play();
        await fadeVolume(menuMusic, 0.6, 800);
        isMusicPlaying = true;
    } catch (e) {
        isMusicPlaying = false;
    }
    updateSoundBtn();
}

// Utility: fade volume to target over duration ms
function fadeVolume(audioEl, target, duration) {
    return new Promise((resolve) => {
        const start = performance.now();
        const initial = Number(audioEl.volume) || 0;
        const diff = target - initial;
        function step(now) {
            const t = Math.min(1, (now - start) / duration);
            audioEl.volume = initial + diff * t;
            if (t < 1) requestAnimationFrame(step);
            else resolve();
        }
        requestAnimationFrame(step);
    });
}

// Asegurar loop siempre activo
if (menuMusic) {
    menuMusic.loop = true;
    menuMusic.addEventListener('ended', () => {
        menuMusic.currentTime = 0;
        menuMusic.play();
    });
}

window.addEventListener('load', () => {
    if (menuMusic) {
        menuMusic.loop = true;
        menuMusic.volume = 0.6;
    }
    tryPlayMusic();
});

