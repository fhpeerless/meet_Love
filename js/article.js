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
    
    document.getElementById('articleTitle').textContent = letter.title;
    document.getElementById('articleDate').textContent = formatDate(letter.date);
    document.getElementById('articleContent').textContent = letter.text;
    
    // 处理照片
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';
    
if (letter.photos && letter.photos.length > 0) {
    const photoGrid = document.createElement('div');
    photoGrid.className = 'photo-grid';
    
    letter.photos.forEach(photoUrl => {
        const img = document.createElement('img');
        img.src = photoUrl;
        img.alt = '照片';
        photoGrid.appendChild(img);
    });

    const articlePhotos = document.getElementById('articlePhotos');
    articlePhotos.innerHTML = ''; // 清空旧内容
    articlePhotos.appendChild(photoGrid);
} else {
    // 如果没有照片，移除照片模块
    const articlePhotos = document.getElementById('articlePhotos');
    articlePhotos.style.display = 'none';
}

    // 处理音乐
    const musicContainer = document.getElementById('musicContainer');
    musicContainer.innerHTML = '';
    
    if (letter.musicUrl) 
    {
        const audio = document.createElement('audio');
        audio.src = letter.musicUrl;
        audio.controls = true;
        audio.autoplay = true; // 自动播放
        audio.loop = true; // 循环播放
        audio.volume = 0.5; // 设置音量
        audio.style.display = 'none'; // 隐藏音频控件

     // 将音频添加到页面中（但不可见）
    document.body.appendChild(audio);

    // 用户交互后触发播放
    window.addEventListener('click', () => {
        if (!audio.paused) return;
        audio.play().catch(error => {
            console.warn('播放音乐失败:', error);
        });
    });
        
        // 停止之前播放的音乐
        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
        }
        currentAudio = audio;
        
        const audioWrapper = document.createElement('div');
        audioWrapper.className = 'audio-player';
        audioWrapper.innerHTML = '<h3>背景音乐</h3>';
        audioWrapper.appendChild(audio);
        musicContainer.appendChild(audioWrapper);
        musicContainer.style.display = 'block';
    } 
    else 
    {
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
