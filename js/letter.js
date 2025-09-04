// js/letter.js
import { lettersData } from './data.js'; // ✅ 正确导入
import { formatDate } from './utils.js'; // ✅ 正确导入

export function generateLetters() {
    

    
    const letterList = document.getElementById('letterList');
    if (!letterList) return; // ✅ 防御性编程
    letterList.innerHTML = '';
        // 在生成标题前，先判断是否有图片、音乐或视频
let titleHTML = `<div class="letter-title">${letter.title}</div>`;

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
    
    lettersData.forEach(letter => {
        const li = document.createElement('li');
        li.className = 'letter-item';
        li.onclick = () => {
            localStorage.setItem('currentLetterId', letter.id);
            window.location.href = 'article.html';
        };
        li.innerHTML = `
            <div class="letter-title">${letter.title}</div>
            <div class="letter-date">${formatDate(letter.date)}</div>
            <div class="letter-preview">${letter.text.substring(0, 80)}...</div>
        `;
        letterList.appendChild(li);
    });
}
