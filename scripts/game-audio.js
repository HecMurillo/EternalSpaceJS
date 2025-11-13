// Reproduce música aleatoria durante la partida
(function () {
    const TRACKS = [
        'assets/audio/Blip in the Void.mp3',
        'assets/audio/Blip in the Void v2.mp3',
        'assets/audio/Dead Silence.mp3'
    ];

    let currentAudio = null;
    let lastTrack = null;
    let fadeFrame = null;

    function isAudioEnabled() {
        const enabledFn = window.MenuAudio?.isEnabled;
        if (typeof enabledFn === 'function') return !!enabledFn();
        return true;
    }

    function clearFade() {
        if (fadeFrame) {
            cancelAnimationFrame(fadeFrame);
            fadeFrame = null;
        }
    }

    function fadeVolume(audio, target, duration = 500) {
        return new Promise(resolve => {
            const start = performance.now();
            const initial = Number(audio.volume) || 0;
            const diff = target - initial;
            function step(now) {
                const t = Math.min(1, (now - start) / duration);
                audio.volume = initial + diff * t;
                if (t < 1) {
                    fadeFrame = requestAnimationFrame(step);
                } else {
                    fadeFrame = null;
                    resolve();
                }
            }
            fadeFrame = requestAnimationFrame(step);
        });
    }

    function pickRandomTrack() {
        if (!TRACKS.length) return null;
        let track = TRACKS[Math.floor(Math.random() * TRACKS.length)];
        if (TRACKS.length > 1 && lastTrack) {
            let attempts = 0;
            while (track === lastTrack && attempts < 4) {
                track = TRACKS[Math.floor(Math.random() * TRACKS.length)];
                attempts += 1;
            }
        }
        lastTrack = track;
        return track;
    }

    async function stop(options = {}) {
        const { fade = true } = options;
        if (!currentAudio) return;
        clearFade();
        const audio = currentAudio;
        if (fade) await fadeVolume(audio, 0, 400);
        audio.pause();
        if (currentAudio === audio) currentAudio = null;
    }

    async function playRandomTrack() {
        await stop({ fade: true });
        if (!isAudioEnabled()) return;
        const track = pickRandomTrack();
        if (!track) return;
        const audio = new Audio(track);
        audio.loop = false;
        audio.volume = 0;
        currentAudio = audio;
        try {
            await audio.play();
            await fadeVolume(audio, 0.65, 600);
        } catch (err) {
            currentAudio = null;
            return;
        }
        audio.addEventListener('ended', () => {
            if (currentAudio === audio) {
                playRandomTrack();
            }
        });
    }

    async function handlePreferenceDisabled() {
        await stop({ fade: true });
    }

    window.GameAudio = {
        playRandomTrack,
        stop,
        handlePreferenceDisabled
    };
})();
