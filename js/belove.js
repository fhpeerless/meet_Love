function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');

    // 使用 Unicode 心形符号
    heart.innerHTML = '❤️';

    // 随机位置
    const left = Math.random() * 100; // 百分比
    heart.style.left = `${left}vw`;

    // 随机大小 (10px - 30px)
    const size = Math.random() * 20 + 10;
    heart.style.fontSize = `${size}px`;

    // 随机颜色
    const colors = ['#ff5a79', '#ff6b6b', '#f78da7', '#ffb8b8', '#ff9ff3', '#c77dff', '#54a0ff', '#5f27cd', '#00d2d3'];
    heart.style.color = colors[Math.floor(Math.random() * colors.length)];

    // 随机动画延迟
    heart.style.animationDelay = `${Math.random() * 6}s`;

    document.body.appendChild(heart);

    // 动画结束后移除元素
    setTimeout(() => {
        heart.remove();
    }, 6000);
}

// 初始生成一些心形
for (let i = 0; i < 30; i++) {
    setTimeout(createHeart, Math.random() * 1000);
}

// 持续生成心形
setInterval(createHeart, 300);
