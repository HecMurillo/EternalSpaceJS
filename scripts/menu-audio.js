const MUSIC_PREF_KEY = 'eternalSpaceMusicEnabled';
const menuMusic = document.getElementById('menu-music');
let soundBtn = null;

let isMusicEnabled = true;
let isMusicPlaying = false;

function loadPreference() {
    try {
        const stored = localStorage.getItem(MUSIC_PREF_KEY);
        if (stored === null) return true;
        return stored === '1';
    } catch (err) {
        return true;
    }
}

function savePreference() {
    try {
        localStorage.setItem(MUSIC_PREF_KEY, isMusicEnabled ? '1' : '0');
    } catch (err) {
        // Ignorar restricciones de almacenamiento
    }
}

function updateSoundBtn() {
    if (!soundBtn) return;
    const runningGame = !!window.Game?.isRunning?.();
    const playing = runningGame ? isMusicEnabled : isMusicPlaying;
    const label = isMusicEnabled && playing ? 'Quitar sonido' : 'Activar sonido';
    soundBtn.textContent = label;
    soundBtn.classList.toggle('active', isMusicEnabled && playing);
}

async function fadeVolume(audioEl, target, duration) {
    return new Promise(resolve => {
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

async function resumeMenuMusic({ fade = true } = {}) {
    if (!menuMusic || !isMusicEnabled) {
        isMusicPlaying = false;
        updateSoundBtn();
        return;
    }
    try {
        menuMusic.loop = true;
        if (menuMusic.paused) {
            menuMusic.volume = fade ? 0 : 0.6;
            await menuMusic.play();
        }
        if (fade) {
            await fadeVolume(menuMusic, 0.6, 600);
        } else {
            menuMusic.volume = 0.6;
        }
        isMusicPlaying = true;
    } catch (err) {
        isMusicPlaying = false;
    }
    updateSoundBtn();
}

async function stopMenuMusic({ fade = true } = {}) {
    if (!menuMusic) return;
    if (fade) await fadeVolume(menuMusic, 0, 500);
    menuMusic.pause();
    isMusicPlaying = false;
    updateSoundBtn();
}

async function handleSoundToggle() {
    if (!isMusicEnabled) {
        isMusicEnabled = true;
        savePreference();
        if (window.Game?.isRunning?.()) {
            await window.GameAudio?.playRandomTrack?.();
            isMusicPlaying = true;
            updateSoundBtn();
        } else {
            await resumeMenuMusic();
        }
        return;
    }
    if (!isMusicPlaying) {
        if (window.Game?.isRunning?.()) {
            await window.GameAudio?.playRandomTrack?.();
            isMusicPlaying = true;
            updateSoundBtn();
        } else {
            await resumeMenuMusic();
        }
        return;
    }
    isMusicEnabled = false;
    savePreference();
    await stopMenuMusic({ fade: true });
    await window.GameAudio?.handlePreferenceDisabled?.();
}

function createSoundButtonIfNeeded() {
    if (document.getElementById('sound-activate')) {
        soundBtn = document.getElementById('sound-activate');
    } else {
        soundBtn = document.createElement('button');
        soundBtn.id = 'sound-activate';
        soundBtn.className = 'sound-activate';
        document.body.appendChild(soundBtn);
    }
    soundBtn.addEventListener('click', () => handleSoundToggle());
    soundBtn.addEventListener('mouseenter', () => soundBtn.classList.add('hovered'));
    soundBtn.addEventListener('mouseleave', () => soundBtn.classList.remove('hovered'));
    soundBtn.addEventListener('touchstart', () => soundBtn.classList.add('hovered'));
    soundBtn.addEventListener('touchend', () => soundBtn.classList.remove('hovered'));
}

const playBtn = document.getElementById('play-btn');
const title = document.querySelector('.title');
const container = document.querySelector('.container');

if (playBtn) {
    playBtn.addEventListener('click', async () => {
        await stopMenuMusic({ fade: true });
        window.play8BitSound?.();
        if (title) title.classList.add('fade-out-up');
        if (playBtn) playBtn.classList.add('fade-out-up');
        const soundCtrl = soundBtn || document.getElementById('sound-activate');
        if (soundCtrl) soundCtrl.classList.add('fade-out-up');
        setTimeout(() => {
            if (container) container.classList.add('hide-menu');
            window.GameTransition?.start?.();
        }, 700);
    });
}

// Efecto 8-bit simple para botón
window.play8BitSound = function play8BitSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 0.09);
    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.13);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.13);
    osc.onended = () => audioCtx.close();
};

window.MenuAudio = {
    resumeMenuMusic,
    stopMenuMusic,
    isEnabled: () => isMusicEnabled
};

window.addEventListener('load', async () => {
    isMusicEnabled = loadPreference();
    createSoundButtonIfNeeded();
    updateSoundBtn();
    if (isMusicEnabled) {
        await resumeMenuMusic({ fade: false });
    } else if (menuMusic) {
        menuMusic.pause();
        menuMusic.currentTime = 0;
    }
});
