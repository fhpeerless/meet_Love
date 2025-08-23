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

/ 初始化背景音乐播放器
function initBackgroundMusic() {
    // 创建背景音乐播放器实例
    bgMusicPlayer = new BackgroundMusicPlayer();
    // 设置多首音乐列表（替换为你的实际音乐链接）
    bgMusicPlayer.setMusicList([
        {
            title: '遇见 - 孙燕姿',
            url: 'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
            lrcUrl: './lrc/yujian.lrc'
        },
        {
            title: '第二首歌',
            url: 'https://yourdomain.com/music/second.mp3',
            lrcUrl: ''
        },
        {
            title: '第三首歌',
            url: 'https://yourdomain.com/music/third.mp3',
            lrcUrl: ''
        }
    ]);
}

// 初始化函数
function init() {
    initBackgroundMusic(); // 调用新的初始化逻辑
    setInterval(createHeart, 150);
    startTimer();
    createPhotoGrid();
    generateLetters();
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        const photoContainer = document.querySelector('.photo-container');
        if (photoContainer) {
            photoContainer.remove();
        }
    }
    init();
    window.toggleProfile = toggleProfile;
    window.toggleContact = toggleContact;
    window.bgMusicPlayer = bgMusicPlayer;
});
// 点击页面空白处关闭侧边栏
document.addEventListener('click', function(e) {
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    const avatar = document.querySelector('.avatar');
    const profileBtn = document.getElementById('profileBtn');
    const contactBtn = document.getElementById('contactBtn');
    
    // 检查点击是否在相关元素之外
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
