// js/letter.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

// letter.js
// letter.js

function generateLetters() {
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

        let titleHTML = `<div class="letter-title">${letter.title}</div>`;

        // 使用 <img> 加载本地 SVG
        if (letter.photos && letter.photos.length > 0) {
            titleHTML = `
                <img src="images/photo-icon.svg" class="media-icon photo-icon" alt="照片" />
            ` + titleHTML;
        }
        if (letter.musicUrl) {
            titleHTML = `
                <img src="images/music-icon.svg" class="media-icon music-icon" alt="音乐" />
            ` + titleHTML;
        }
        if (letter.videoUrl) {
            titleHTML = `
                <img src="images/video-icon.svg" class="media-icon video-icon" alt="视频" />
            ` + titleHTML;
        }

        li.innerHTML = `
            ${titleHTML}
            <div class="letter-date">${formatDate(letter.date)}</div>
            <div class="letter-preview">${letter.text.substring(0, 80)}...</div>
        `;

        letterList.appendChild(li);
    });
}
