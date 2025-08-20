// js/detail-main.js
import { startTimer } from './timer.js';
import { displayArticle } from './article.js';
import { toggleProfile, toggleContact, setupCloseOnOutsideClick } from './sidebar.js';
import { startHeartAnimation } from './heart.js';
import { lettersData } from './data.js';

// 暴露数据到全局，供 displayArticle 使用
window.lettersData = lettersData;

document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    displayArticle(); // 显示文章
    setupCloseOnOutsideClick();
    startHeartAnimation(150);
});

// 暴露 toggle 函数给 HTML onclick 使用
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
