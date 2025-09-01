// js/article.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

export function displayArticle() {
    const letterId = localStorage.getItem('currentLetterId');
    if (!letterId) {
        console.warn('未找到信件 ID');
        window.location.href = 'index.html';
        return;
    }

    const letter = lettersData.find(l => l.id == letterId);
    if (!letter) {
        console.warn('未找到信件');
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
    if (letter.musicUrl) {
        const songTitle = letter.songTitle || letter.title; // 优先用 songTitle，否则用信件标题
        if (window.bgMusicPlayer) {
            window.bgMusicPlayer.setMusic(
                songTitle,
                letter.musicUrl,
                letter.lrcUrl || ''
            );
            window.bgMusicPlayer.play();
        } else {
            console.warn('背景音乐播放器未初始化');
        }
    } else {
        // 如果没有音乐，清空播放器
        if (window.bgMusicPlayer) {
            window.bgMusicPlayer.clear(); // 假设播放器支持 clear() 方法
        }
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
