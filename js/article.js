// article.js
import { BackgroundMusicPlayer } from './background-music.js';
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

let currentBgMusicPlayer = null;

export function displayArticle() {
    const letterId = localStorage.getItem('currentLetterId');
    console.log('当前信件 ID:', letterId); // 调试日志

    if (!letterId) {
        console.warn('未找到信件 ID，跳回首页');
        window.location.href = 'index.html';
        return;
    }

    const letter = lettersData.find(l => l.id == letterId);
    console.log('找到的信件:', letter); // 调试日志

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
    musicContainer.innerHTML = '';
    if (letter.musicUrl) {
        try {
            if (currentBgMusicPlayer) currentBgMusicPlayer.close();
            currentBgMusicPlayer = new BackgroundMusicPlayer();
            currentBgMusicPlayer.setMusic(letter.songTitle || '未知歌曲', letter.musicUrl, letter.lrcUrl || '');
            currentBgMusicPlayer.play();
        } catch (error) {
            console.error('音乐播放器初始化失败:', error);
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

document.addEventListener('DOMContentLoaded', () => {
    displayArticle();
});
