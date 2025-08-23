// js/article.js
import { lettersData } from './data.js';
import { formatDate } from './utils.js';

let currentAudio = null; // 用于跟踪当前播放的音频

export function displayArticle(container) {
    const letterId = localStorage.getItem('currentLetterId');
    if (!letterId) {
        console.warn('未找到信件 ID');
        return;
    }
    const letter = lettersData.find(l => l.id == letterId);
    if (!letter) {
        console.warn('未找到信件');
        return;
    }

    // 创建详情页内容
    const articleContent = document.createElement('div');
    articleContent.innerHTML = `
        <a href="index.html" class="back-btn">← 返回</a>
        <h1 class="article-title">${letter.title}</h1>
        <div class="article-date">${formatDate(letter.date)}</div>
        <div class="article-content">${letter.text}</div>
        <div class="article-photos">
            <div class="article-photos-title">照片记录</div>
            <div class="photo-grid"></div>
        </div>
        <div class="media-container" id="musicContainer"></div>
        <div class="media-container" id="videoContainer"></div>
    `;

    // 处理照片
    const photoGrid = articleContent.querySelector('.photo-grid');
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
    } else {
        articleContent.querySelector('.article-photos').style.display = 'none';
    }

    // 处理音乐
    const musicContainer = articleContent.querySelector('#musicContainer');
    if (letter.musicUrl) {
        const audio = document.createElement('audio');
        audio.src = letter.musicUrl;
        audio.controls = true;
        audio.autoplay = true;
        audio.loop = true;
        audio.volume = 0.5;

        if (currentAudio && !currentAudio.paused) {
            currentAudio.pause();
        }
        currentAudio = audio;

        musicContainer.appendChild(audio);
    }

    // 处理视频
    const videoContainer = articleContent.querySelector('#videoContainer');
    if (letter.videoUrl) {
        const video = document.createElement('video');
        video.src = letter.videoUrl;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = false;
        video.playsInline = true;
        videoContainer.appendChild(video);
    }

    // 将内容添加到传入的容器中
    container.innerHTML = ''; // 清空容器
    container.appendChild(articleContent);
}
