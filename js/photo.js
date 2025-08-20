// photo.js
export function createPhotoGrid() {
    const container = document.getElementById('photoGrid');
    container.innerHTML = '';

    // ✅ 独立照片列表（可替换为你的图片）
    const standalonePhotos = [
        'https://picsum.photos/id/1015/800/400',
        'https://picsum.photos/id/1018/800/400',
        'https://picsum.photos/id/1025/800/400',
        'https://picsum.photos/id/1035/800/400',
        'https://picsum.photos/id/1045/800/400'
    ];

    if (standalonePhotos.length === 0) {
        const item = document.createElement('div');
        item.className = 'photo-item active';
        item.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;">暂无照片</div>';
        container.appendChild(item);
        return;
    }

    // 创建所有轮播项
    standalonePhotos.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        if (index === 0) item.classList.add('active'); // 第一张显示

        const img = document.createElement('img');
        img.src = src;
        img.alt = `纪念照片 ${index + 1}`;
        img.loading = "lazy";

        item.appendChild(img);
        container.appendChild(item);
    });

    // ✅ 启动轮播
    startCarousel(container, standalonePhotos.length);
}

function startCarousel(container, total) {
    let currentIndex = 0;
    const items = container.querySelectorAll('.photo-item');

    setInterval(() => {
        // 移除当前
        items[currentIndex].classList.remove('active');
        // 下一张
        currentIndex = (currentIndex + 1) % total;
        // 显示新一张
        items[currentIndex].classList.add('active');
    }, 3500); // 每 3.5 秒切换
}
