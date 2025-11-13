// Fondo animado de asteroides para la pantalla de inicio
const canvas = document.getElementById('asteroids-bg');
const ctx = canvas.getContext('2d');
let asteroids = [];
const ASTEROID_COUNT = 25;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function randomAsteroid() {
    const size = Math.random() * 30 + 20;
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        size,
        speed: Math.random() * 0.7 + 0.3,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008
    };
}

function drawAsteroid(a) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.beginPath();
    const vertices = 12;
    for (let i = 0; i < vertices; i++) {
        const angle = (i / vertices) * Math.PI * 2;
        const r = a.size * (0.75 + Math.sin(i * 1.7 + a.angle) * 0.13 + Math.random() * 0.18);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(0, 0, a.size * 0.2, 0, 0, a.size);
    grad.addColorStop(0, '#e0e0e0');
    grad.addColorStop(0.5, '#888');
    grad.addColorStop(1, '#222');
    ctx.fillStyle = grad;
    ctx.shadowColor = '#222';
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 0.92;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
}

function updateAsteroids() {
    for (let a of asteroids) {
        a.y += a.speed;
        a.angle += a.rotSpeed;
        if (a.y - a.size > canvas.height) {
            Object.assign(a, randomAsteroid());
            a.y = -a.size;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let a of asteroids) drawAsteroid(a);
    updateAsteroids();
    requestAnimationFrame(animate);
}

function initAsteroids() {
    asteroids = [];
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        asteroids.push(randomAsteroid());
    }
}

initAsteroids();
animate();
