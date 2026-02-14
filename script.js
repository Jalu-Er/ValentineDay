const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let stars = [];
let formationProgress = 0;
const finalSection = document.getElementById('section3');
const valentineText = document.getElementById('valentineText');

function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initStars();
}

window.addEventListener('resize', resizeCanvas);

function getOutlinePoint(angle) {
    const cx = 0, cy = 0.2;
    let rMin = 0;
    let rMax = 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    for (let i = 0; i < 15; i++) {
        let r = (rMin + rMax) / 2;
        let x = cx + r * dx;
        let y = cy + r * dy;
        let val = Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
        if (val <= 0) rMin = r;
        else rMax = r;
    }
    let r = (rMin + rMax) / 2;
    return { x: cx + r * dx, y: cy + r * dy };
}

function getInnerPoint() {
    while (true) {
        const x = (Math.random() - 0.5) * 3;
        const y = (Math.random() - 0.5) * 3;
        if (Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3) <= -0.05) {
            return { x, y };
        }
    }
}

class Star {
    constructor(index, total) {
        this.index = index;
        this.isOutline = index < 120; 
        
        this.floatingX = Math.random() * width;
        this.floatingY = Math.random() * height;

        this.vx = 0.05 + Math.random() * 0.08;
        this.vy = (Math.random() - 0.5) * 0.04;

        let rawPoint;
        if (this.isOutline) {
            const angle = (index / 120) * Math.PI * 2;
            rawPoint = getOutlinePoint(angle);
            this.size = Math.random() * 1.5 + 1.2;
        } else {
            rawPoint = getInnerPoint();
            this.size = Math.random() * 1.5 + 0.5;
        }

        const scale = Math.min(width, height) / 3.5;
        this.heartX = width / 2 + rawPoint.x * scale;
        this.heartY = height / 2 - rawPoint.y * scale; 

        this.x = this.floatingX;
        this.y = this.floatingY;
        
        this.twinkleSpeed = Math.random() * 0.003 + 0.001; 
        this.twinklePhase = Math.random() * Math.PI * 2;
    }

    update() {
        this.floatingX += this.vx;
        this.floatingY += this.vy;

        if (this.floatingX > width) {
            this.floatingX = 0;
            this.x -= width;
        } else if (this.floatingX < 0) {
            this.floatingX = width;
            this.x += width;
        }

        if (this.floatingY > height) {
            this.floatingY = 0;
            this.y -= height;
        } else if (this.floatingY < 0) {
            this.floatingY = height;
            this.y += height;
        }

        const targetX = this.floatingX + (this.heartX - this.floatingX) * formationProgress;
        const targetY = this.floatingY + (this.heartY - this.floatingY) * formationProgress;

        this.x += (targetX - this.x) * 0.06;
        this.y += (targetY - this.y) * 0.06;
    }

    draw() {
        const twinkle = Math.sin(Date.now() * this.twinkleSpeed + this.twinklePhase);
        const twinkleEffect = (twinkle + 1) / 2; 

        const skyOpacity = 0.2 + (twinkleEffect * 0.3);
        const baseOpacity = this.isOutline ? 0.6 : 0.25;
        const heartOpacity = baseOpacity + (twinkleEffect * (1 - baseOpacity));

        const currentOpacity = skyOpacity + (heartOpacity - skyOpacity) * formationProgress;

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initStars() {
    stars = [];
    const numStars = 320; 
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star(i, numStars));
    }
}

function drawConnections() {
    if (formationProgress < 0.1) return;

    const maxDist = 45; 
    ctx.lineWidth = 0.5;

    for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
            const dx = stars[i].x - stars[j].x;
            const dy = stars[i].y - stars[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
                const alpha = (1 - dist / maxDist) * formationProgress * (stars[i].isOutline && stars[j].isOutline ? 0.7 : 0.35);
                ctx.strokeStyle = `rgba(209, 217, 230, ${alpha})`;
                ctx.beginPath();
                ctx.moveTo(stars[i].x, stars[i].y);
                ctx.lineTo(stars[j].x, stars[j].y);
                ctx.stroke();
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let star of stars) {
        star.update();
        star.draw();
    }
    drawConnections();
    requestAnimationFrame(animate);
}

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    let progress = scrollTop / scrollHeight;
    formationProgress = Math.max(0, Math.min(1, progress));

    if (formationProgress > 0.95) {
        valentineText.classList.add('show');
    } else {
        valentineText.classList.remove('show');
    }

    const card = document.querySelector('.poem-card');
    if (card) {
        const cardRect = card.getBoundingClientRect();
        if (cardRect.top < window.innerHeight * 0.8) {
            card.classList.add('visible');
        }
    }
});

resizeCanvas();
animate();
