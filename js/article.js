// js/article.js
import { formatDate } from './utils.js'; // 我们稍后创建工具函数

export function displayArticle() {
    const letterId = localStorage.getItem('currentLetterId');
    if (!letterId) {
        window.location.href = 'index.html';
        return;
    }

    // 确保 lettersData 已加载
    const letter = window.lettersData?.find(l => l.id == letterId);
    if (!letter) {
        window.location.href = 'index.html';
        return;
    }

    const titleEl = document.getElementById('articleTitle');
    const dateEl = document.getElementById('articleDate');
    const contentEl = document.getElementById('articleContent');
    const photoGrid = document.getElementById('photoGrid');

    if (titleEl) titleEl.textContent = letter.title;
    if (dateEl) dateEl.textContent = formatDate(letter.date);
    if (contentEl) contentEl.textContent = letter.text.replace(/\n/g, '\n\n'); // 保留换行

    // 清空并渲染照片
    if (photoGrid) {
        photoGrid.innerHTML = '';
        const photosContainer = document.getElementById('articlePhotos');

        if (letter.photos && letter.photos.length > 0) {
            letter.photos.forEach(photoSrc => {
                const item = document.createElement('div');
                item.className = 'photo-item';
                const img = document.createElement('img');
                img.src = photoSrc;
                img.alt = letter.title;
                img.loading = 'lazy';
                item.appendChild(img);
                photoGrid.appendChild(item);
            });
            if (photosContainer) photosContainer.style.display = 'block';
        } else {
            if (photosContainer) photosContainer.style.display = 'none';
        }
    }
}
