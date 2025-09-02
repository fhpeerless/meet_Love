// js/article.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

let currentAudio = null; // 用于跟踪当前播放的音频

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
    musicContainer.innerHTML = '';
    if (letter.musicUrl) {
        const audio = document.createElement('audio');
        audio.src = letter.musicUrl;
        audio.controls = true;
        audio.autoplay = true; // 自动播放
        audio.loop = true; // 循环播放
        audio.volume = 0.5; // 设置音量
        
        // 停止之前播放的音乐
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
        }
        currentAudio = audio;
        
        const audioWrapper = document.createElement('div');
    audioWrapper.className = 'audio-player';

    // 添加歌曲标题
    const songTitle = document.createElement('h3');
    songTitle.textContent = letter.musicTitle || '未知歌曲';
    audioWrapper.appendChild(songTitle);

    audioWrapper.appendChild(audio);
    musicContainer.appendChild(audioWrapper);
    musicContainer.style.display = 'block';
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
        video.autoplay = true; // 自动播放
        video.loop = true; // 循环播放
        video.muted = false; // 不静音
        video.playsInline = true; // 在iOS上内联播放
        
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
