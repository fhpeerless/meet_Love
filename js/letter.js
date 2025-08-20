// js/letter.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

export function generateLetters() {
    const letterList = document.getElementById('letterList');
    letterList.innerHTML = '';

    lettersData.forEach((letter, index) => {  // ✅ 解构出 index
        const li = document.createElement('li');
        li.className = 'letter-item';

        // ✅ 点击时存储的是索引 index，而不是 letter.id
        li.onclick = () => {
            localStorage.setItem('currentLetterId', index);
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
