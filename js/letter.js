// js/letter.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

export function generateLetters() {
    const letterList = document.getElementById('letterList');
    if (!letterList) return;

    letterList.innerHTML = '';

    lettersData.forEach(letter => {
        const li = document.createElement('li');
        li.className = 'letter-item';
        li.onclick = () => {
            localStorage.setItem('currentLetterId', letter.id);
            window.location.href = 'article.html';
        };

        // 构建标题部分
        let titleHTML = `<div class="letter-title">${letter.title}</div>`;

        // 根据媒体内容添加图标
        if (letter.photos && letter.photos.length > 0) {
            titleHTML = `<span class="media-icon photo-icon"></span>${titleHTML}`;
        }
        if (letter.musicUrl) {
            titleHTML = `<span class="media-icon music-icon"></span>${titleHTML}`;
        }
        if (letter.videoUrl) {
            titleHTML = `<span class="media-icon video-icon"></span>${titleHTML}`;
        }

        li.innerHTML = `
            ${titleHTML}
            <div class="letter-date">${formatDate(letter.date)}</div>
            <div class="letter-preview">${letter.text.substring(0, 80)}...</div>
        `;

        letterList.appendChild(li);
    });
}
