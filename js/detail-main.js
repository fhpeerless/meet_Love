// js/detail-main.js
import { startTimer } from './timer.js';
import { displayArticle } from './article.js';
import { toggleProfile, toggleContact } from './sidebar.js';
import { startHeartAnimation } from './heart.js';
import { lettersData } from './data.js';

// 暴露数据到全局
window.lettersData = lettersData;

document.addEventListener('DOMContentLoaded', () => {
    startTimer();
        window.displayArticle = displayArticle; 
    displayArticle();

    startHeartAnimation(150);
});

// 暴露 toggle 函数
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
