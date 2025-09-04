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

        // 动态添加 SVG 图标
        if (letter.photos && letter.photos.length > 0) {
            titleHTML = `
                <svg class="media-icon photo-icon" viewBox="0 0 24 24">
                    <use href="#icon-photo" />
                </svg>
            ` + titleHTML;
        }
        if (letter.musicUrl) {
            titleHTML = `
                <svg class="media-icon music-icon" viewBox="0 0 24 24">
                    <use href="#icon-music" />
                </svg>
            ` + titleHTML;
        }
        if (letter.videoUrl) {
            titleHTML = `
                <svg class="media-icon video-icon" viewBox="0 0 24 24">
                    <use href="#icon-video" />
                </svg>
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
