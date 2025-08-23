// js/letter.js
export function generateLetters() {
    const letterList = document.getElementById('letterList');
    if (!letterList) return;
    letterList.innerHTML = '';
    lettersData.forEach(letter => {
        const li = document.createElement('li');
        li.className = 'letter-item';
        li.onclick = () => {
            localStorage.setItem('currentLetterId', letter.id);
            loadArticleContent();
        };
        li.innerHTML = `
            <div class="letter-title">${letter.title}</div>
            <div class="letter-date">${formatDate(letter.date)}</div>
            <div class="letter-preview">${letter.text.substring(0, 80)}...</div>
        `;
        letterList.appendChild(li);
    });
}

function loadArticleContent() {
    const articleContainer = document.getElementById('articleContainer');
    if (!articleContainer) return;

    import('./article.js').then(module => {
        module.displayArticle(articleContainer);
    });
}
