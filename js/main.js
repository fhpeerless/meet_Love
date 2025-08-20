// js/main.js
import { createHeart } from './heart.js';
import { startTimer } from './timer.js';
import { createPhotoGrid } from './photo.js';
import { generateLetters } from './letter.js'; // ✅ 导入 generateLetters
import { toggleProfile, toggleContact } from './sidebar.js';

// 初始化爱心动画
setInterval(createHeart, 150);

// 初始化计时器
startTimer();

// 初始化照片墙
createPhotoGrid();

// ✅ 初始化信件列表
generateLetters(); // ✅ 调用函数

// 将侧边栏函数暴露到全局
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;

// 页面加载完成后绑定事件
document.addEventListener('click', function(e) {
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    const avatar = document.querySelector('.avatar');
    const btns = document.querySelectorAll('.sidebar-btn');
    
    if (!avatar.contains(e.target) && !profile.contains(e.target) && 
        !btns[0].contains(e.target) && !profile.contains(e.target) &&
        !btns[1].contains(e.target) && !contact.contains(e.target)) {
        profile.classList.remove('show');
        contact.classList.remove('show');
    }
});
