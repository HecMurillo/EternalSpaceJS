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
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.03
    };
}

function drawAsteroid(a) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const r = a.size * (0.7 + Math.random() * 0.3);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fillStyle = '#b0b0b0';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    ctx.fill();
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

