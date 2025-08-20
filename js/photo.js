// photo.js
export function createPhotoGrid() {
    const container = document.getElementById('photoGrid');
    container.innerHTML = '';

    // ✅ 独立的照片列表（不来自信件）
    const standalonePhotos = [
        'https://picsum.photos/id/1015/300/200',
        'https://picsum.photos/id/1018/300/200',
        'https://picsum.photos/id/1025/300/200',
        'https://picsum.photos/id/1035/300/200',
        'https://picsum.photos/id/1045/300/200'
    ];

    if (standalonePhotos.length === 0) {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;">暂无照片</div>';
        container.appendChild(item);
        return;
    }

    // 创建所有图片元素
    standalonePhotos.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'photo-item';
        item.dataset.index = index; // 记录索引
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

// ✅ 轮播函数：自动切换显示的照片
function startCarousel(container, total) {
    const items = container.children;
    let currentIndex = 0;

    // 初始显示第一张
    showSlide(currentIndex);

    // 每 3 秒切换一次
    setInterval(() => {
        currentIndex = (currentIndex + 1) % total;
        showSlide(currentIndex);
    }, 3000);

    function showSlide(index) {
        for (let i = 0; i < items.length; i++) {
            items[i].style.opacity = '0';
            items[i].style.zIndex = '1';
        }
        items[index].style.opacity = '1';
        items[index].style.zIndex = '2';
    }

    // 给第一张设置初始样式
    function showSlide(index) {
        for (let i = 0; i < items.length; i++) {
            items[i].style.transition = 'opacity 0.8s ease';
            items[i].style.opacity = '0';
            items[i].style.zIndex = '1';
        }
        items[index].style.opacity = '1';
        items[index].style.zIndex = '2';
    }

    // 初始化第一张
    if (items[0]) {
        items[0].style.opacity = '1';
        items[0].style.zIndex = '2';
    }
}
