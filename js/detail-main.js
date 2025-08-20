// js/detail-main.js
import { startTimer } from './timer.js';
import { displayArticle } from './article.js';
// ❌ 删除 setupCloseOnOutsideClick
import { toggleProfile, toggleContact } from './sidebar.js';
import { startHeartAnimation } from './heart.js';
import { lettersData } from './data.js';

// 暴露数据到全局
window.lettersData = lettersData;

document.addEventListener('DOMContentLoaded', () => {
    startTimer();           // ✅ 现在会执行
    displayArticle();       // ✅ 现在会执行
    // setupCloseOnOutsideClick(); // ❌ 删除这一行
    startHeartAnimation(150); // ✅ 现在会执行
});

// 暴露 toggle 函数
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
