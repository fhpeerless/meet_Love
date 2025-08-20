// heart.js
export function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '♥★'; // 使用心形和星号作为心形图案

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    const colors = ['#ff6b9d', '#ff8a65', '#ffb74d', '#81c784', '#64b5f6', '#ba68c8', '#e1bee7'];
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];

    // 增加字体大小，使其更大
    const size = Math.random() * 20 + 15; // 调整大小范围，最小15px，最大35px
    heart.style.fontSize = `${size}px`;

    document.body.appendChild(heart);

    const animate = setInterval(() => {
        const currentY = parseFloat(heart.style.top);
        const currentX = parseFloat(heart.style.left);

        heart.style.top = `${currentY - 1}px`;
        heart.style.left = `${currentX + (Math.random() - 0.5)}px`;
        heart.style.opacity = parseFloat(heart.style.opacity) - 0.005;

        if (currentY < -20 || parseFloat(heart.style.opacity) <= 0) {
            clearInterval(animate);
            heart.remove();
        }
    }, 50);
}

export function startHeartAnimation(duration) {
    // 每隔一定时间创建一个新心形
    setInterval(createHeart, duration);
}
