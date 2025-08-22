// js/main.js
import { BackgroundMusicPlayer } from './background-music.js';
import { createHeart } from './heart.js';
import { startTimer } from './timer.js';
import { createPhotoGrid } from './photo.js';
import { generateLetters } from './letter.js';
import { toggleProfile, toggleContact } from './sidebar.js';

let bgMusicPlayer = null;

// 初始化函数 - 集中所有初始化逻辑
// 修改 main.js 中的 init 函数
function init() {
    try {
        // 1. 初始化背景音乐播放器
        initBackgroundMusic();
    } catch (error) {
        console.error('背景音乐初始化失败:', error);
    }

    try {
        // 2. 初始化爱心动画
        setInterval(createHeart, 150);
    } catch (error) {
        console.error('爱心动画初始化失败:', error);
    }

    try {
        // 3. 初始化计时器
        startTimer();
    } catch (error) {
        console.error('计时器初始化失败:', error);
    }

    try {
        // 4. 初始化照片墙
        createPhotoGrid();
    } catch (error) {
        console.error('照片墙初始化失败:', error);
    }

    try {
        // 5. 初始化信件列表
        generateLetters();
    } catch (error) {
        console.error('信件列表初始化失败:', error);
    }
}

function initBackgroundMusic() {
    // 创建背景音乐播放器实例
    bgMusicPlayer = new BackgroundMusicPlayer();
    
    // 设置背景音乐（替换为您的实际音乐链接）
    bgMusicPlayer.setMusic(
       '孙燕姿-遇见', 
        'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
        './lrc/yujian.lrc' // 您的LRC歌词文件URL
    );
}

// 修改 main.js 中的 DOMContentLoaded 事件处理程序
document.addEventListener('DOMContentLoaded', function() {
    // 1. 执行主初始化
    init();
    // 2. 暴露全局函数（必须在 init() 之后）
    window.toggleProfile = toggleProfile;
    window.toggleContact = toggleContact;
    window.bgMusicPlayer = bgMusicPlayer;

    // 3. 添加移动端折叠逻辑
    const caption = document.getElementById('caption');
    const toggleBtn = document.getElementById('toggleBtn');
    if (caption && toggleBtn) {
        if (window.innerWidth <= 768) {
            toggleBtn.style.display = 'block';
            toggleBtn.addEventListener('click', () => {
                caption.classList.toggle('expanded');
                toggleBtn.textContent = caption.classList.contains('expanded') ? '收起' : '展开全文';
            });
        } else {
            toggleBtn.style.display = 'none';
        }
    }

    // 4. 点击页面空白处关闭侧边栏
    document.addEventListener('click', function(e) {
        const profile = document.getElementById('profile');
        const contact = document.getElementById('contact');
        const avatar = document.querySelector('.avatar');
        const profileBtn = document.getElementById('profileBtn');
        const contactBtn = document.getElementById('contactBtn');

        const isOutsideProfile = !avatar?.contains(e.target) && 
                               !profileBtn?.contains(e.target) && 
                               !profile?.contains(e.target);
        const isOutsideContact = !contactBtn?.contains(e.target) && 
                               !contact?.contains(e.target);

        if (isOutsideProfile) {
            profile?.classList.remove('show');
        }
        if (isOutsideContact) {
            contact?.classList.remove('show');
        }
    });
});
