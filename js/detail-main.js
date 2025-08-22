// js/detail-main.js
import { startTimer } from './timer.js';
import { displayArticle } from './article.js'; // ✅ 导入 displayArticle
import { toggleProfile, toggleContact } from './sidebar.js';
import { startHeartAnimation } from './heart.js';


// 将侧边栏和显示文章函数暴露到全局
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
window.displayArticle = displayArticle; // ✅ 暴露 displayArticle 用于 DOMContentLoaded

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    displayArticle(); // ✅ 调用 displayArticle
    startTimer();
    startHeartAnimation(150);
});


