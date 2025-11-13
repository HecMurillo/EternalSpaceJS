// Maneja la transición del menú al gameplay y el retorno al menú
(function () {
    const background = window.MenuBackground;
    const Game = window.Game;
    const GameAssets = window.GameAssets;
    if (!background || !Game) throw new Error('Dependencias de juego no encontradas.');

    const canvas = background.getCanvas();
    const ctx = background.getContext();

    const container = document.querySelector('.container');
    const title = document.querySelector('.title');
    const playButton = document.getElementById('play-btn');

    const WARP_FRAMES = 240;
    const SHIP_SHOW_DELAY = 120;
    const SHIP_VISIBLE_DURATION = 900;

    function createWarpStars() {
        const count = 120;
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * 8 + 8,
                size: Math.random() * 1.5 + 0.5
            });
        }
        return stars;
    }

    function resetMenuStyles() {
        if (container) {
            container.classList.remove('hide-menu');
            container.style.opacity = '';
            container.style.filter = '';
            container.style.pointerEvents = '';
        }
        const soundToggle = document.getElementById('sound-activate');
        const elements = [title, playButton, soundToggle];
        for (const element of elements) {
            if (!element) continue;
            element.classList.remove('fade-out-up');
            element.style.opacity = '';
            element.style.transform = '';
            element.style.filter = '';
        }
    }

    function slowDownStars(stars) {
        for (const star of stars) {
            star.speed = Math.random() * 0.7 + 0.3;
            star.size = Math.max(0.4, Math.min(star.size, 1.6));
        }
        return stars;
    }

    function showShipThenStart(stars) {
        const shipEl = GameAssets?.ensureShipElement?.();
        if (!shipEl) {
            Game.start({
                stars,
                onRequestMenu: returnToMenu
            });
            return;
        }
        shipEl.style.display = 'block';
        setTimeout(() => {
            shipEl.classList.add('visible');
            setTimeout(() => {
                shipEl.classList.remove('visible');
                shipEl.style.display = 'none';
                Game.start({
                    stars,
                    onRequestMenu: returnToMenu
                });
            }, SHIP_VISIBLE_DURATION);
        }, SHIP_SHOW_DELAY);
    }

    function start() {
        background.stop();
        background.clear();
        const stars = createWarpStars();
        let frame = 0;

        function animateWarp() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = '#fff';
            for (const star of stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                star.y += star.speed;
                if (star.y > canvas.height) star.y = 0;
            }
            ctx.restore();
            frame += 1;
            if (frame < WARP_FRAMES) {
                requestAnimationFrame(animateWarp);
            } else {
                slowDownStars(stars);
                showShipThenStart(stars);
            }
        }

        animateWarp();
    }

    function returnToMenu() {
        Game.stop();
        GameAssets?.hideShipVisual?.();
        resetMenuStyles();
        background.clear();
        background.start();
        window.MenuAudio?.resumeMenuMusic?.();
    }

    window.GameTransition = {
        start,
        returnToMenu
    };
})();
