// js/letter.js
import { lettersData } from './data.js'; // ✅ 正确导入
import { formatDate } from './utils.js'; // ✅ 正确导入

export function generateLetters() {
    const letterList = document.getElementById('letterList');
    if (!letterList) return; // ✅ 防御性编程
    letterList.innerHTML = '';
    
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
