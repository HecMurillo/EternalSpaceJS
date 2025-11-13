// Lógica principal del gameplay y UI in-game
(function () {
    const background = window.MenuBackground;
    if (!background) throw new Error('MenuBackground no está inicializado.');

    const canvas = background.getCanvas();
    const ctx = background.getContext();

    const keyboardState = { left: false, right: false };
    const pointerState = {
        active: false,
        id: null,
        targetX: null
    };

    let keyboardBound = false;
    let pointerBound = false;
    let resizeBound = false;

    let scoreElement = null;
    let overlay = null;
    let overlayTitle = null;
    let retryButton = null;
    let menuButton = null;

    const callbacks = {
        onRequestMenu: null
    };

    let gameState = null;

    function ensureScoreElement() {
        if (scoreElement) return scoreElement;
        scoreElement = document.createElement('div');
        scoreElement.id = 'score-ui';
        scoreElement.className = 'score-ui';
        document.body.appendChild(scoreElement);
        return scoreElement;
    }

    function ensureOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'game-over-overlay';
        overlay.className = 'game-over-overlay';

        overlayTitle = document.createElement('h2');
        overlayTitle.className = 'game-over-title';
        overlay.appendChild(overlayTitle);

        const btnRow = document.createElement('div');
        btnRow.className = 'game-over-btn-row';

        retryButton = document.createElement('button');
        retryButton.className = 'game-over-btn';
        retryButton.textContent = 'Volver a intentar';

        menuButton = document.createElement('button');
        menuButton.className = 'game-over-btn secondary';
        menuButton.textContent = 'Volver al menú';

        btnRow.appendChild(retryButton);
        btnRow.appendChild(menuButton);
        overlay.appendChild(btnRow);
        document.body.appendChild(overlay);
        return overlay;
    }

    function bindKeyboard() {
        if (keyboardBound) return;
        window.addEventListener('keydown', event => {
            if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') keyboardState.left = true;
            if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') keyboardState.right = true;
        });
        window.addEventListener('keyup', event => {
            if (event.key === 'a' || event.key === 'A' || event.key === 'ArrowLeft') keyboardState.left = false;
            if (event.key === 'd' || event.key === 'D' || event.key === 'ArrowRight') keyboardState.right = false;
        });
        keyboardBound = true;
    }

    function pointerCanvasPosition(event) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function bindPointer() {
        if (pointerBound) return;

        canvas.addEventListener('pointerdown', event => {
            canvas.setPointerCapture?.(event.pointerId);
            const pos = pointerCanvasPosition(event);
            pointerState.active = true;
            pointerState.id = event.pointerId;
            pointerState.targetX = pos.x;
        });

        canvas.addEventListener('pointermove', event => {
            if (!pointerState.active || pointerState.id !== event.pointerId) return;
            const pos = pointerCanvasPosition(event);
            pointerState.targetX = pos.x;
            event.preventDefault();
        }, { passive: false });

        const deactivate = event => {
            if (pointerState.id !== null && event.pointerId !== pointerState.id) return;
            if (canvas.hasPointerCapture?.(event.pointerId)) {
                canvas.releasePointerCapture(event.pointerId);
            }
            pointerState.active = false;
            pointerState.id = null;
            pointerState.targetX = null;
        };

        canvas.addEventListener('pointerup', deactivate);
        canvas.addEventListener('pointercancel', deactivate);
        window.addEventListener('pointerup', deactivate);
        pointerBound = true;
    }

    function bindResize() {
        if (resizeBound) return;
        window.addEventListener('resize', () => {
            if (gameState && gameState.running) adjustToViewportChange(gameState);
        });
        resizeBound = true;
    }

    function adjustToViewportChange(state) {
        const oldWidth = state.viewportWidth || canvas.width;
        const oldHeight = state.viewportHeight || canvas.height;
        const newWidth = canvas.width;
        const newHeight = canvas.height;
        if (!oldWidth || !oldHeight || (oldWidth === newWidth && oldHeight === newHeight)) {
            state.viewportWidth = newWidth;
            state.viewportHeight = newHeight;
            return;
        }

        const widthRatio = newWidth / oldWidth;
        const heightRatio = newHeight / oldHeight;

        state.ship.x *= widthRatio;
        state.ship.y = newHeight * 0.72;
        for (const star of state.stars) {
            star.x *= widthRatio;
            star.y *= heightRatio;
        }
        for (const meteor of state.meteors) {
            meteor.x *= widthRatio;
            meteor.y *= heightRatio;
        }

        if (pointerState.targetX !== null) pointerState.targetX *= widthRatio;

        state.viewportWidth = newWidth;
        state.viewportHeight = newHeight;
    }

    function ensureShipElement() {
        let ship = document.getElementById('player-ship');
        if (!ship) {
            ship = document.createElement('div');
            ship.id = 'player-ship';
            ship.innerHTML = `<svg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="shipGrad" x1="40" y1="8" x2="40" y2="62" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#76ddff"/>
                        <stop offset="100%" stop-color="#1c55c9"/>
                    </linearGradient>
                    <linearGradient id="thrusterGrad" x1="40" y1="52" x2="40" y2="78" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#ffd54f"/>
                        <stop offset="100%" stop-color="#ff6f00"/>
                    </linearGradient>
                </defs>
                <polygon points="40,8 68,60 40,46 12,60" fill="url(#shipGrad)" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
                <polygon points="28,54 40,74 52,54" fill="url(#thrusterGrad)" opacity="0.9"/>
            </svg>`;
            document.body.appendChild(ship);
        }
        return ship;
    }

    function hideShipVisual() {
        const ship = document.getElementById('player-ship');
        if (ship) {
            ship.classList.remove('visible');
            ship.style.display = 'none';
        }
    }

    function applyShipDrawing(ship) {
        const gradient = ctx.createLinearGradient(0, -ship.height * 0.55, 0, ship.height * 0.45);
        gradient.addColorStop(0, '#76ddff');
        gradient.addColorStop(1, '#1c55c9');

        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.beginPath();
        ctx.moveTo(0, -ship.height * 0.55);
        ctx.lineTo(ship.width * 0.5, ship.height * 0.45);
        ctx.lineTo(0, ship.height * 0.32);
        ctx.lineTo(-ship.width * 0.5, ship.height * 0.45);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#8be7ff';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#ffffffaa';
        ctx.stroke();

        // Efecto de propulsión
        ctx.beginPath();
        ctx.moveTo(-ship.width * 0.2, ship.height * 0.35);
        ctx.lineTo(0, ship.height * 0.65);
        ctx.lineTo(ship.width * 0.2, ship.height * 0.35);
        ctx.closePath();
        const thruster = ctx.createLinearGradient(0, ship.height * 0.35, 0, ship.height * 0.7);
        thruster.addColorStop(0, '#ffd54f');
        thruster.addColorStop(1, '#ff6f00');
        ctx.fillStyle = thruster;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function drawMeteor(meteor) {
        ctx.save();
        ctx.translate(meteor.x, meteor.y);
        ctx.rotate(meteor.angle);
        ctx.beginPath();
        const segments = 12;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const sizeVariation = meteor.size * (0.75 + Math.sin(i * 1.7 + meteor.angle) * 0.13 + Math.random() * 0.18);
            ctx.lineTo(Math.cos(angle) * sizeVariation, Math.sin(angle) * sizeVariation);
        }
        ctx.closePath();
        const grad = ctx.createRadialGradient(0, 0, meteor.size * 0.2, 0, 0, meteor.size);
        grad.addColorStop(0, '#e0e0e0');
        grad.addColorStop(0.5, '#888');
        grad.addColorStop(1, '#222');
        ctx.fillStyle = grad;
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 0.92;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function spawnMeteor(state) {
        const growth = 1 + Math.min(state.score, 150) * 0.0025;
        const baseSize = 36;
        const size = baseSize * (0.9 + Math.random() * 0.45) * growth;
        const difficulty = 1 + Math.min(state.score, 220) * 0.012;
        const fastChance = 0.22;
        const isFast = Math.random() < fastChance;
        const speedVariance = isFast ? 1.7 : 1 + Math.random() * 0.35;
        state.meteors.push({
            x: Math.random() * (canvas.width + size) - size / 2,
            y: -size,
            size,
            speed: (state.baseMeteorSpeed + Math.random() * 1.3) * difficulty * speedVariance,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() * 0.035 - 0.017) * speedVariance
        });
    }

    function updateStars(stars) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#fff';
        for (const star of stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
            star.y += star.speed;
            if (star.y > canvas.height) star.y = 0;
        }
        ctx.restore();
    }

    function updateMeteors(state) {
        for (const meteor of state.meteors) {
            meteor.y += meteor.speed;
            meteor.angle += meteor.rotSpeed;
        }
        state.meteors = state.meteors.filter(meteor => meteor.y < canvas.height + meteor.size);
    }

    function checkCollision(state) {
        for (const meteor of state.meteors) {
            const dx = meteor.x - state.ship.x;
            const dy = meteor.y - state.ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < meteor.size * 0.65 + state.ship.width * 0.3) return true;
        }
        return false;
    }

    function updateShip(state) {
        const ship = state.ship;
        ship.speed = state.baseShipSpeed + Math.min(5.5, state.score * 0.04);

        if (pointerState.active && pointerState.targetX !== null) {
            const diff = pointerState.targetX - ship.x;
            ship.x += Math.max(-ship.speed * 1.4, Math.min(ship.speed * 1.4, diff * 0.25));
        } else {
            if (keyboardState.left) ship.x -= ship.speed;
            if (keyboardState.right) ship.x += ship.speed;
        }

        ship.x = Math.max(ship.width / 2, Math.min(canvas.width - ship.width / 2, ship.x));
    }

    function updateScore(state) {
        const now = performance.now();
        if (now - state.lastScoreTick >= 500) {
            state.score += 1;
            state.lastScoreTick = now;
        }
    }

    function currentSpawnInterval(state) {
        const base = 1100;
        const min = 420;
        return Math.max(min, base - state.score * 9);
    }

    function loop() {
        if (!gameState || !gameState.running) return;
        if (gameState.viewportWidth !== canvas.width || gameState.viewportHeight !== canvas.height) {
            adjustToViewportChange(gameState);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updateStars(gameState.stars);
        updateShip(gameState);
        updateMeteors(gameState);
        applyShipDrawing(gameState.ship);
        for (const meteor of gameState.meteors) drawMeteor(meteor);

        const now = performance.now();
        if (now - gameState.lastMeteorSpawn > currentSpawnInterval(gameState)) {
            spawnMeteor(gameState);
            gameState.lastMeteorSpawn = now;
        }

        updateScore(gameState);
        if (scoreElement) scoreElement.textContent = `Puntaje: ${gameState.score}`;

        if (checkCollision(gameState)) {
            endGame();
            return;
        }

        gameState.raf = requestAnimationFrame(loop);
    }

    function endGame() {
        if (!gameState) return;
        gameState.running = false;
        if (gameState.raf) cancelAnimationFrame(gameState.raf);
        hideShipVisual();
        window.GameAudio?.stop?.({ fade: true });
        if (scoreElement) scoreElement.textContent = `¡Fin del juego! Puntaje: ${gameState.score}`;

        const ui = ensureOverlay();
        ui.classList.add('show');
        overlayTitle.textContent = `¡Fin del juego! Puntaje: ${gameState.score}`;
        retryButton.onclick = () => {
            window.play8BitSound?.();
            ui.classList.remove('show');
            restart();
        };
        menuButton.onclick = () => {
            window.play8BitSound?.();
            ui.classList.remove('show');
            scoreElement.style.display = 'none';
            callbacks.onRequestMenu?.();
        };
    }

    function restart() {
        if (!gameState) return;
        const newStars = background.createStarfield({ count: gameState.stars.length });
        start({
            stars: newStars,
            onRequestMenu: callbacks.onRequestMenu
        });
    }

    function start({ stars, onRequestMenu }) {
        bindKeyboard();
        bindPointer();
        bindResize();
        ensureScoreElement();
        ensureOverlay();
        if (overlay) overlay.classList.remove('show');

        callbacks.onRequestMenu = onRequestMenu;
        pointerState.active = false;
        pointerState.id = null;
        pointerState.targetX = null;
        keyboardState.left = false;
        keyboardState.right = false;

        const ship = {
            x: canvas.width / 2,
            y: canvas.height * 0.72,
            width: 44,
            height: 64,
            speed: 5.4
        };

        gameState = {
            running: true,
            ship,
            stars: Array.isArray(stars) && stars.length ? stars : background.createStarfield(),
            meteors: [],
            score: 0,
            baseShipSpeed: 5.4,
            baseMeteorSpeed: 2.4,
            lastScoreTick: performance.now(),
            lastMeteorSpawn: performance.now(),
            raf: null,
            viewportWidth: canvas.width,
            viewportHeight: canvas.height
        };

        background.clear();
        hideShipVisual();
        if (scoreElement) {
            scoreElement.textContent = 'Puntaje: 0';
            scoreElement.style.display = 'block';
        }

        spawnMeteor(gameState);
        gameState.lastMeteorSpawn = performance.now();
        window.GameAudio?.playRandomTrack?.();
        loop();
    }

    function stop() {
        if (!gameState) return;
        gameState.running = false;
        if (gameState.raf) cancelAnimationFrame(gameState.raf);
        hideShipVisual();
        window.GameAudio?.stop?.({ fade: true });
        if (scoreElement) {
            scoreElement.style.display = 'none';
            scoreElement.textContent = '';
        }
        if (overlay) overlay.classList.remove('show');
        pointerState.active = false;
        pointerState.id = null;
        pointerState.targetX = null;
        keyboardState.left = false;
        keyboardState.right = false;
        gameState = null;
    }

    window.Game = {
        start,
        stop,
        restart,
        isRunning: () => !!(gameState && gameState.running)
    };

    window.GameAssets = {
        ensureShipElement,
        hideShipVisual
    };
})();
