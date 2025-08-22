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
    // 假设通过 URL 参数获取当前信件 ID
    const urlParams = new URLSearchParams(window.location.search);
    const letterId = urlParams.get('id');
    
    // 根据 ID 获取信件数据并调用 displayArticle
    import { lettersData } from './data.js'; // 假设 data.js 导出信件数据
    const currentLetter = letters.find(letter => letter.id === parseInt(letterId));
    
    if (currentLetter) {
        displayArticle(currentLetter); // ✅ 传入 letter 参数
        startTimer();
        startHeartAnimation(150);
    } else {
        console.error('未找到对应信件');
    }
});
