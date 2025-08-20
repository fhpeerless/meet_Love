// js/detail-main.js
import { startTimer } from './timer.js';
import { displayArticle } from './article.js';
import { toggleProfile, toggleContact } from './sidebar.js';
import { startHeartAnimation } from './heart.js';
import { lettersData } from './data.js';

// 暴露数据到全局
window.lettersData = lettersData;

document.addEventListener('DOMContentLoaded', () => {
    window.displayArticle = displayArticle; // ✅ 先暴露
    displayArticle(); // ✅ 再调用
    startTimer(); // ✅ 计时器
    startHeartAnimation(150); // ✅ 心形动画
});

// 暴露 toggle 函数
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
