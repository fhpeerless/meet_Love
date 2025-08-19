function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.innerHTML = '❤️';

    // 随机水平位置
    heart.style.left = Math.random() * 100 + 'vw';

    // 随机大小
    const size = Math.random() * 15 + 10;
    heart.style.fontSize = `${size}px`;

    // 随机颜色
    const colors = ['#ff5a79', '#ff6b6b', '#f78da7', '#ffb8b8', '#ff9ff3', '#c77dff', '#54a0ff'];
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];

    // 添加到 body
    document.body.appendChild(heart);

    // 6秒后移除
    setTimeout(() => {
        heart.remove();
    }, 6000);
}

// 初始生成一些
for (let i = 0; i < 15; i++) {
    setTimeout(createHeart, Math.random() * 1000);
}

// 持续生成
setInterval(createHeart, 400);
