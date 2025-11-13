// Control exclusivo del fondo de asteroides del menú
(function () {
    const canvas = document.getElementById('asteroids-bg');
    const ctx = canvas.getContext('2d');

    const ASTEROID_COUNT = 25;
    const STAR_COUNT = 110;
    let asteroids = [];
    let stars = [];
    let isRunning = false;
    let animationFrame = null;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function randomAsteroid() {
        const size = Math.random() * 30 + 20;
        return {
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height,
            size,
            speed: Math.random() * 0.6 + 0.35,
            angle: Math.random() * Math.PI * 2,
            rotSpeed: Math.random() * 0.02 - 0.01
        };
    }

    function drawAsteroid(asteroid) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.angle);
        ctx.beginPath();
        const vertices = 12;
        for (let i = 0; i < vertices; i++) {
            const rad = (i / vertices) * Math.PI * 2;
            const radius = asteroid.size * (0.75 + Math.sin(i * 1.7 + asteroid.angle) * 0.13 + Math.random() * 0.18);
            ctx.lineTo(Math.cos(rad) * radius, Math.sin(rad) * radius);
        }
        ctx.closePath();
        const gradient = ctx.createRadialGradient(0, 0, asteroid.size * 0.2, 0, 0, asteroid.size);
        gradient.addColorStop(0, '#e0e0e0');
        gradient.addColorStop(0.5, '#888');
        gradient.addColorStop(1, '#222');
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#222';
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 0.92;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function updateAsteroids() {
        for (const asteroid of asteroids) {
            asteroid.y += asteroid.speed;
            asteroid.angle += asteroid.rotSpeed;
            if (asteroid.y - asteroid.size > canvas.height) {
                Object.assign(asteroid, randomAsteroid());
                asteroid.y = -asteroid.size;
            }
        }
    }

    function drawStars() {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#fff';
        for (const star of stars) {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function updateStars() {
        for (const star of stars) {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = -star.size;
                star.x = Math.random() * canvas.width;
            }
        }
    }

    function drawFrame() {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawStars();
        updateStars();
        for (const asteroid of asteroids) drawAsteroid(asteroid);
        updateAsteroids();
        animationFrame = requestAnimationFrame(drawFrame);
    }

    function initAsteroids() {
        asteroids = [];
        for (let i = 0; i < ASTEROID_COUNT; i++) {
            asteroids.push(randomAsteroid());
        }
    }

    function initStars() {
        stars = createStarfield({
            count: STAR_COUNT,
            minSpeed: 0.18,
            maxSpeed: 0.55,
            minSize: 0.35,
            maxSize: 1.4
        });
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        initAsteroids();
        initStars();
        drawFrame();
    }

    function stop() {
        isRunning = false;
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    function clear() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function createStarfield(options = {}) {
        const {
            count = 80,
            minSpeed = 0.3,
            maxSpeed = 0.9,
            minSize = 0.4,
            maxSize = 1.6
        } = options;
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
                size: Math.random() * (maxSize - minSize) + minSize
            });
        }
        return stars;
    }

    function handleResize() {
        const running = isRunning;
        stop();
        resizeCanvas();
        if (running) start();
    }

    resizeCanvas();
    start();
    window.addEventListener('resize', handleResize);

    window.MenuBackground = {
        start,
        stop,
        clear,
        isRunning: () => isRunning,
        getCanvas: () => canvas,
        getContext: () => ctx,
        createStarfield
    };
})();
