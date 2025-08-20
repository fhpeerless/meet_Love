// js/detail-main.js
import { startTimer } from './timer.js';
import { displayArticle } from './article.js';
import { toggleProfile, toggleContact, setupCloseOnOutsideClick } from './sidebar.js';
import { startHeartAnimation } from './heart.js';
import { lettersData } from './data.js';

// 暴露数据给全局（兼容旧逻辑）
window.lettersData = lettersData;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    startTimer();
    displayArticle();
    setupCloseOnOutsideClick();
    startHeartAnimation(150); // 每150ms一个爱心
});
