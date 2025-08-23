// js/letter.js
export function generateLetters() {
    const letterList = document.getElementById('letterList');
    if (!letterList) return;
    letterList.innerHTML = '';
    lettersData.forEach(letter => {
        const li = document.createElement('li');
        li.className = 'letter-item';
        li.onclick = () => {
            // 保存当前信件ID到localStorage
            localStorage.setItem('currentLetterId', letter.id);
            // 动态加载详情页内容到index.html
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

// 新增：动态加载详情页内容
function loadArticleContent() {
    const articleContainer = document.getElementById('articleContainer');
    if (!articleContainer) return;

    // 清空现有内容
    articleContainer.innerHTML = '';

    // 使用 fetch 或直接调用 displayArticle 函数生成内容
    import('./article.js').then(module => {
        module.displayArticle(articleContainer);
    });
}
