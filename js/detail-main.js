// js/detail-main.js
import { startTimer } from './timer.js';
import { startHeartAnimation } from './heart.js';
import { toggleProfile, toggleContact } from './sidebar.js';

// 延迟加载 article.js 和 background-music.js
let bgMusicPlayer = window.bgMusicPlayerInstance || null;

document.addEventListener('DOMContentLoaded', async () => {
    // 确保 article.js 模块加载完成后再调用 displayArticle()
    const { displayArticle } = await import('./article.js');
    
    // 调用 displayArticle()
    displayArticle();

    // 初始化其他功能
    startTimer();
    startHeartAnimation(150);

    // 初始化音乐播放器（如果不存在）
    if (!bgMusicPlayer) {
        const { BackgroundMusicPlayer } = await import('./background-music.js');
        bgMusicPlayer = new BackgroundMusicPlayer();
        window.bgMusicPlayerInstance = bgMusicPlayer;
        bgMusicPlayer.setMusic(
            '孙燕姿-遇见', 
            'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
            './lrc/yujian.lrc'
        );
    }
});
