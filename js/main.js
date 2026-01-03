// js/main.js
import { BackgroundMusicPlayer } from './background-music.js';
import { createHeart } from './heart.js';
import { startTimer } from './timer.js';
import { createPhotoGrid } from './photo.js';
import { generateLetters } from './letter.js';
import { toggleProfile, toggleContact, toggleDeclaration } from './sidebar.js';
// js/main.js
import { lettersData } from './data.js'; // ✅ 导入信件数据


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
     updateLetterCount(); // ✅ 新增：更新信件统计
}

function initBackgroundMusic() {
    // 创建背景音乐播放器实例
    bgMusicPlayer = new BackgroundMusicPlayer();
    
    // 从信件数据中提取音乐列表
    const musicList = [];
    
    // 添加上下文提供的歌曲
    musicList.push({
        title: '孙燕姿-遇见', 
        url: 'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
        lrcUrl: './lrc/yujian.lrc'
    });
    
    // 从信件数据中提取所有音乐
    lettersData.forEach(letter => {
        if (letter.musicUrl && letter.musicTitle) {
            musicList.push({
                title: letter.musicTitle,
                url: letter.musicUrl,
                lrcUrl: letter.lyricsUrl || ''
            });
        }
    });
    
    // 移除重复的歌曲
    const uniqueMusicList = musicList.filter((song, index, self) => 
        index === self.findIndex((s) => s.url === song.url)
    );
    
    // 设置音乐列表
    bgMusicPlayer.setMusicList(uniqueMusicList);
    
    // 设置并播放第一首歌曲
    if (uniqueMusicList.length > 0) {
        bgMusicPlayer.setMusic(
            uniqueMusicList[0].title,
            uniqueMusicList[0].url,
            uniqueMusicList[0].lrcUrl
        );
        bgMusicPlayer.play();
    }
}

// 定义更新信件统计的函数
function updateLetterCount() {
    const count = lettersData.length;
    document.getElementById('letterCount').textContent = `总计信件：${count}封`;
}

// ✅ 页面加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
    
    // 将函数暴露到全局（必须在 init() 之后）
    window.toggleProfile = toggleProfile;
    window.toggleContact = toggleContact;
    window.toggleDeclaration = toggleDeclaration;
    window.bgMusicPlayer = bgMusicPlayer;
    
    // 添加事件监听器
    // 点击头像按钮显示/隐藏侧边栏
    const avatarBtn = document.getElementById('avatarBtn');
    if (avatarBtn) {
        avatarBtn.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
    }
    
    // 点击汉堡菜单显示/隐藏侧边栏
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
    }
    
    // 添加元素存在检查，确保事件监听器能够正确绑定
    const declarationBtn = document.getElementById('declarationBtn');
    if (declarationBtn) {
        declarationBtn.addEventListener('click', toggleDeclaration);
    }
    
    const profileBtn = document.getElementById('profileBtn');
    if (profileBtn) {
        profileBtn.addEventListener('click', toggleProfile);
    }
    
    const contactBtn = document.getElementById('contactBtn');
    if (contactBtn) {
        contactBtn.addEventListener('click', toggleContact);
    }
});

// 点击页面空白处关闭侧边栏和侧边栏内容
document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    const profile = document.getElementById('profile');
    const contact = document.getElementById('contact');
    const declaration = document.getElementById('xuanshi');
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const avatarBtn = document.getElementById('avatarBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    
    // 检查点击是否在侧边栏、头像或汉堡菜单上
    const isClickOnSidebar = sidebar && sidebar.contains(e.target);
    const isClickOnSidebarAvatar = sidebarAvatar && sidebarAvatar.contains(e.target);
    const isClickOnAvatarBtn = avatarBtn && avatarBtn.contains(e.target);
    const isClickOnHamburger = hamburgerMenu && hamburgerMenu.contains(e.target);
    
    // 如果点击在任何相关元素上，不关闭
    if (isClickOnSidebar || isClickOnSidebarAvatar || isClickOnAvatarBtn || isClickOnHamburger) {
        return;
    }
    
    // 否则关闭侧边栏和所有内容
    sidebar?.classList.remove('show');
    profile?.classList.remove('show');
    contact?.classList.remove('show');
    declaration?.classList.remove('show');
});
