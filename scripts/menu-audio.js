const menuMusic = document.getElementById('menu-music');
let soundBtn = null;
let isMusicPlaying = false;

function updateSoundBtn() {
    if (!soundBtn) return;
    soundBtn.textContent = isMusicPlaying ? 'Quitar sonido' : 'Activar sonido';
    soundBtn.classList.toggle('active', isMusicPlaying);
}

async function toggleMusic() {
    if (!menuMusic) return;
    if (isMusicPlaying) {
        await fadeVolume(menuMusic, 0, 600);
        menuMusic.pause();
        isMusicPlaying = false;
    } else {
        try {
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
    soundBtn.addEventListener('mouseenter', () => soundBtn.classList.add('hovered'));
    soundBtn.addEventListener('mouseleave', () => soundBtn.classList.remove('hovered'));
    soundBtn.addEventListener('touchstart', () => soundBtn.classList.add('hovered'));
    soundBtn.addEventListener('touchend', () => soundBtn.classList.remove('hovered'));
    document.body.appendChild(soundBtn);
}

async function tryPlayMusic() {
    if (!menuMusic) return;
    createSoundButtonIfNeeded();
    try {
        menuMusic.volume = 0;
        await menuMusic.play();
        await fadeVolume(menuMusic, 0.6, 800);
        isMusicPlaying = true;
    } catch (e) {
        isMusicPlaying = false;
    }
    updateSoundBtn();
}

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

const playBtn = document.getElementById('play-btn');
const title = document.querySelector('.title');
const container = document.querySelector('.container');
const startSound = document.getElementById('start-sound');

if (playBtn) {
    playBtn.addEventListener('click', async () => {
        // Fade out música menú
        if (menuMusic && !menuMusic.paused) {
            await fadeVolume(menuMusic, 0, 600);
            menuMusic.pause();
            isMusicPlaying = false;
            updateSoundBtn();
        }
        // Sonido 8-bit generado
        play8BitSound();
        // Animar salida de menú
        if (title) title.classList.add('fade-out-up');
        if (playBtn) playBtn.classList.add('fade-out-up');
        if (soundBtn) soundBtn.classList.add('fade-out-up');
        // Lanzar transición de avance
        setTimeout(() => {
            if (container) container.classList.add('hide-menu');
            if (window.startGameTransition) window.startGameTransition();
        }, 700);
    });
}

// Efecto 8-bit simple para botón
function play8BitSound() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(440, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.09);
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.13);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.13);
    o.onended = () => ctx.close();
}
