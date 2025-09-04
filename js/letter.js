export function generateLetters() {
    const letterList = document.getElementById('letterList');
    if (!letterList) return; // ✅ 防御性编程

    letterList.innerHTML = ''; // 清空列表

    lettersData.forEach(letter => {
        const li = document.createElement('li');
        li.className = 'letter-item';
        li.onclick = () => {
            localStorage.setItem('currentLetterId', letter.id);
            window.location.href = 'article.html';
        };

        // ✅ 在循环内部构建标题，根据当前 letter 的内容添加图标
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

        // ✅ 将带图标的标题插入 li
        li.innerHTML = `
            ${titleHTML}
            <div class="letter-date">${formatDate(letter.date)}</div>
            <div class="letter-preview">${letter.text.substring(0, 80)}...</div>
        `;

        letterList.appendChild(li);
    });
}
