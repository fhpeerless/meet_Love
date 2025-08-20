// js/photo.js

/**
 * 创建照片轮播墙
 */
export function createPhotoGrid() {
    const container = document.getElementById('photoGrid');
    if (!container) {
        console.warn('未找到 photoGrid 容器');
        return;
    }

    // 示例图片数组（你可以替换成你们的真实照片）
    const photos = [
        'https://picsum.photos/id/1015/800/400',
        'https://picsum.photos/id/1018/800/400',
        'https://picsum.photos/id/1025/800/400',
        'https://picsum.photos/id/1035/800/400',
        'https://picsum.photos/id/1045/800/400'
    ];

    // 清空容器
    container.innerHTML = '';

    if (photos.length === 0) {
        const item = document.createElement('div');
        item.className = 'photo-item active';
        item.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:14px;">暂无照片</div>';
        container.appendChild(item);
        return;
    }

    // 动态创建每张轮播图
    photos.forEach((src, index) => {
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

    // 启动自动轮播
    startCarousel(container, photos.length);
}

/**
 * 启动轮播动画
 * @param {HTMLElement} container - 轮播容器
 * @param {number} total - 图片总数
 */
function startCarousel(container, total) {
    let currentIndex = 0;
    const items = container.querySelectorAll('.photo-item');

    setInterval(() => {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % total;
        items[currentIndex].classList.add('active');
    }, 3500); // 每 3.5 秒切换一张
}
