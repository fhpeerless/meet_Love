// js/article.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';
import { BackgroundMusicPlayer } from './background-music.js'; // 🔑 新增：导入播放器类

let currentAudio = null; // 用于跟踪当前播放的音频
let bgMusicPlayerInstance = null; // 🔄 跟踪当前播放器实例

export function displayArticle() {
    const letterId = localStorage.getItem('currentLetterId');
    if (!letterId) {
        console.warn('未找到信件 ID，跳回首页');
        window.location.href = 'index.html';
        return;
    }

    const letter = lettersData.find(l => l.id == letterId);
    if (!letter) {
        console.warn('未找到 ID 为', letterId, '的信件');
        window.location.href = 'index.html';
        return;
    }

    // 更新标题、日期、正文
    document.getElementById('articleTitle').textContent = letter.title;
    document.getElementById('articleDate').textContent = formatDate(letter.date);
    document.getElementById('articleContent').textContent = letter.text;

    // 处理照片
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';
    if (letter.photos && letter.photos.length > 0) {
        letter.photos.forEach(photoSrc => {
            const item = document.createElement('div');
            item.className = 'photo-item';
            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = letter.title;
            img.loading = 'lazy';
            item.appendChild(img);
            photoGrid.appendChild(item);
        });
        document.getElementById('articlePhotos').style.display = 'block';
    } else {
        document.getElementById('articlePhotos').style.display = 'none';
    }

    // 处理音乐
    const musicContainer = document.getElementById('musicContainer');
    musicContainer.innerHTML = ''; // 清空旧内容

    // 🚫 清理旧的播放器实例（如果存在）
    if (bgMusicPlayerInstance) {
        bgMusicPlayerInstance.close();
        bgMusicPlayerInstance = null;
    }

    if (letter.musicUrl) {
        try {
            bgMusicPlayerInstance = new BackgroundMusicPlayer();
            const title = letter.title || '未知歌曲';
            const lrcUrl = letter.lrcUrl || ''; // 从 data.js 中获取歌词 URL

            // 设置音乐并播放
            bgMusicPlayerInstance.setMusic(title, letter.musicUrl, lrcUrl);
            bgMusicPlayerInstance.play();

            // 将播放器挂载到指定容器（而非 document.body）
            const playerContainer = document.getElementById('musicContainer');
            playerContainer.appendChild(bgMusicPlayerInstance.playerContainer);
        } catch (error) {
            console.error('初始化播放器失败:', error);
            musicContainer.style.display = 'none'; // 出错则隐藏播放器
        }
    } else {
        musicContainer.style.display = 'none';
    }

    // 处理视频
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = '';
    if (letter.videoUrl) {
        const video = document.createElement('video');
        video.src = letter.videoUrl;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = false;
        video.playsInline = true;

        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'video-player';
        videoWrapper.innerHTML = '<h3>视频</h3>';
        videoWrapper.appendChild(video);
        videoContainer.appendChild(videoWrapper);
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }
}
