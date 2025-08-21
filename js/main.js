// js/main.js
import { BackgroundMusicPlayer } from './background-music.js';
import { createHeart } from './heart.js';
import { startTimer } from './timer.js';
import { createPhotoGrid } from './photo.js';
import { generateLetters } from './letter.js'; // ✅ 导入 generateLetters
import { toggleProfile, toggleContact } from './sidebar.js';
let bgMusicPlayer = null;
// 初始化爱心动画
setInterval(createHeart, 150);

// 初始化计时器
startTimer();

// 初始化照片墙
createPhotoGrid();

// ✅ 初始化信件列表
generateLetters(); // ✅ 调用函数

// 初始化函数
function init() {
    // 启动背景音乐播放器
    initBackgroundMusic();
    
    // 启动其他功能
    startHeartAnimation(150);
    startTimer();
}

function initBackgroundMusic() {
    // 创建背景音乐播放器实例
    bgMusicPlayer = new BackgroundMusicPlayer();
    
    // 您可以在这里动态设置音乐
    // bgMusicPlayer.setMusic('孙燕姿-遇见', 'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a');
}


// ✅ 初始化音乐
document.addEventListener('DOMContentLoaded', init);

// 将侧边栏函数暴露到全局
window.toggleProfile = toggleProfile;
window.toggleContact = toggleContact;
window.bgMusicPlayer = bgMusicPlayer;

// 页面加载完成后绑定事件
document.addEventListener('click', function(e) 
{
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    const avatar = document.querySelector('.avatar');
    const btns = document.querySelectorAll('.sidebar-btn');
    
    if (!avatar.contains(e.target) && !profile.contains(e.target) && 
        !btns[0].contains(e.target) && !profile.contains(e.target) &&
        !btns[1].contains(e.target) && !contact.contains(e.target)
       ) 
    {
        profile.classList.remove('show');
        contact.classList.remove('show');
    }



    
});
