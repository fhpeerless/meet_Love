// js/main.js
import { BackgroundMusicPlayer } from './background-music.js';
import { createHeart } from './heart.js';
import { startTimer } from './timer.js';
import { createPhotoGrid } from './photo.js';
import { generateLetters } from './letter.js';
import { toggleProfile, toggleContact } from './sidebar.js';

let bgMusicPlayer = null;

// 初始化函数 - 集中所有初始化逻辑
function init() {
    // 1. 初始化背景音乐播放器
    initBackgroundMusic();
    
    // 2. 初始化爱心动画
    setInterval(createHeart, 150);
    
    // 3. 初始化计时器
    startTimer();
    
    // 4. 初始化照片墙
    createPhotoGrid();
    
    // 5. 初始化信件列表
    generateLetters();
}

function initBackgroundMusic() {
    // 如果播放器已存在，直接使用（避免重复创建）
    if (!bgMusicPlayer) {
        bgMusicPlayer = new BackgroundMusicPlayer();
    }
    window.bgMusicPlayerInstance = bgMusicPlayer; // 挂载到全局变量
    // 设置背景音乐
    bgMusicPlayer.setMusic(
        '孙燕姿-遇见', 
        'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
        './lrc/yujian.lrc'
    );
    
    // 尝试播放（注意：浏览器要求用户交互后才能播放）
    // 这里先不自动 play()，由用户点击按钮触发更安全
    // bgMusicPlayer.play(); // ⚠️ 建议移除自动播放
}

// ✅ 只使用一个 DOMContentLoaded 监听器
document.addEventListener('DOMContentLoaded', function() {
    // 移除移动端照片墙
    if (window.innerWidth <= 768) {
        const photoContainer = document.querySelector('.photo-container');
        if (photoContainer) {
            photoContainer.remove();
        }
    }

    // 执行初始化
    init();

    // 将函数暴露到全局
    window.toggleProfile = toggleProfile;
    window.toggleContact = toggleContact;
    window.bgMusicPlayer = bgMusicPlayer;

    // ✅ 在这里处理播放器恢复逻辑（如果需要）
    // 检查是否已经有全局播放器实例（比如从其他页面共享）
    if (window.bgMusicPlayerInstance && window.bgMusicPlayerInstance !== bgMusicPlayer) {
        // 使用共享实例
        bgMusicPlayer = window.bgMusicPlayerInstance;
        window.bgMusicPlayer = bgMusicPlayer;
    } else {
        // 当前实例设为全局共享
        window.bgMusicPlayerInstance = bgMusicPlayer;
    }

    // 可选：添加点击页面任意处播放音乐（解决自动播放限制）
    const enableMusicOnInteraction = () => {
        if (bgMusicPlayer && !bgMusicPlayer.isPlaying) {
            bgMusicPlayer.play().catch(e => console.log('播放失败，需用户交互:', e));
        }
        // 移除事件监听，只触发一次
        document.removeEventListener('click', enableMusicOnInteraction);
        document.removeEventListener('touchstart', enableMusicOnInteraction);
    };

    document.addEventListener('click', enableMusicOnInteraction);
    document.addEventListener('touchstart', enableMusicOnInteraction);
});

// 点击页面空白处关闭侧边栏
document.addEventListener('click', function(e) {
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    const avatar = document.querySelector('.avatar');
    const profileBtn = document.getElementById('profileBtn');
    const contactBtn = document.getElementById('contactBtn');
    
    const isOutsideProfile = !avatar.contains(e.target) && 
                           !profileBtn.contains(e.target) && 
                           !profile.contains(e.target);
    
    const isOutsideContact = !contactBtn.contains(e.target) && 
                           !contact.contains(e.target);
    
    if (isOutsideProfile) {
        profile.classList.remove('show');
    }
    
    if (isOutsideContact) {
        contact.classList.remove('show');
    }
});
