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
    
    // 设置基础内容
    document.getElementById('articleTitle').textContent = letter.title;
    document.getElementById('articleDate').textContent = formatDate(letter.date);
    document.getElementById('articleContent').textContent = letter.text;

    // 处理照片
    const articlePhotos = document.getElementById('articlePhotos');
    const photoGrid = document.getElementById('photoGrid');
    photoGrid.innerHTML = '';

    if (letter.photos && Array.isArray(letter.photos) && letter.photos.length > 0) {
        const validPhotos = letter.photos.filter(url => url.trim() !== '');
        if (validPhotos.length > 0) {
            articlePhotos.style.display = 'block';
            validPhotos.forEach(photoUrl => {
                const img = document.createElement('img');
                img.src = photoUrl;
                img.alt = '照片';
                img.onerror = () => { img.style.display = 'none'; }; // 图片加载失败时隐藏
                photoGrid.appendChild(img);
            });
        } else {
            articlePhotos.style.display = 'none';
        }
    } else {
        articlePhotos.style.display = 'none';
    }

    // 处理视频
    const videoContainer = document.getElementById('videoContainer');
    videoContainer.innerHTML = '';
    if (letter.videoUrl && letter.videoUrl.trim() !== '') {
        const video = document.createElement('video');
        video.src = letter.videoUrl;
        video.controls = true;
        video.loop = true;
        video.muted = true; // 默认静音（避免自动播放限制）
        video.playsInline = true; // iOS内联播放
        videoContainer.appendChild(video);
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }

    // 处理音乐
    const musicContainer = document.getElementById('musicContainer');
    musicContainer.innerHTML = '';
    if (letter.musicUrl && letter.musicUrl.trim() !== '') {
        const audio = document.createElement('audio');
        audio.src = letter.musicUrl;
        audio.loop = true;
        audio.style.display = 'none'; // 隐藏原生控件
        audio.muted = true; // 默认静音
        audio.addEventListener('ended', () => {
            audio.currentTime = 0;
            audio.play();
        });

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
        musicContainer.appendChild(audio);
        musicContainer.style.display = 'block';
    } else {
        musicContainer.style.display = 'none';
    }
}
