// js/detail-main.js
import { startTimer } from './js/timer.js';
import { displayArticle } from './js/article.js';
import { toggleProfile, toggleContact } from './js/sidebar.js';
import { startHeartAnimation } from './js/heart.js';
import { lettersData } from './js/data.js';

// 暴露数据到全局
window.lettersData = lettersData;

document.addEventListener('DOMContentLoaded', () => {
    window.displayArticle = displayArticle; // ✅ 先暴露到全局
    displayArticle(); // ✅ 再调用
    startTimer();
    startHeartAnimation(150);
});

// 暴露 toggle 函数
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
