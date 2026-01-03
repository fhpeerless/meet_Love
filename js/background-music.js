// js/background-music.js
export class BackgroundMusicPlayer {
    constructor() {
        this.audio = null;
        this.playerContainer = null;
        this.lyricsContainer = null;
        this.isPlaying = false;
        this.currentSong = {
            title: '未知歌曲',
            url: '',
            lrcUrl: '' // 添加歌词URL
        };
        
        this.lyrics = []; // 存储解析后的歌词
        this.currentLyricIndex = -1;
        
        // 音乐列表数据结构
        this.musicList = [];
        this.currentIndex = 0;
        this.isLoop = false;
        this.isShuffle = false;
        
        this.init();
    }
    
    init() {
        this.createPlayer();
        this.createAudio();
        // 移除对this.defaultMusic的引用，因为它没有被定义
        // this.setMusic(this.defaultMusic.title, this.defaultMusic.url, this.defaultMusic.lrcUrl);
        // this.play();
    }
    
createPlayer() {
        // 创建外层容器
        this.playerWrapper = document.createElement('div');
        this.playerWrapper.className = 'music-player-wrapper';
        
        // 创建迷你播放按钮（默认显示，用于切换播放器显示/隐藏）
        this.miniPlayerBtn = document.createElement('button');
        this.miniPlayerBtn.className = 'mini-player-btn';
        this.miniPlayerBtn.innerHTML = '<i class="icon">🎵</i>';
        this.miniPlayerBtn.title = '音乐播放器';
        
        // 创建播放器容器
        this.playerContainer = document.createElement('div');
        this.playerContainer.className = 'bg-music-player';
        this.playerContainer.innerHTML = `
            <div class="player-content">
                <div class="song-info">
                    <span class="song-title">正在播放: <span id="currentSongTitle">${this.currentSong.title}</span></span>
                </div>
                <div class="player-controls">
                    <button id="prevBtn" class="control-btn">
                        <i class="icon">⏮</i>
                    </button>
                    <button id="playPauseBtn" class="control-btn">
                        <i class="icon">▶</i>
                    </button>
                    <button id="nextBtn" class="control-btn">
                        <i class="icon">⏭</i>
                    </button>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>
            <div class="music-list-container">
                <ul class="music-list" id="musicList"></ul>
            </div>
        `;
        
        // 创建歌词容器
        this.lyricsContainer = document.createElement('div');
        this.lyricsContainer.className = 'lyrics-container';
        this.lyricsContainer.id = 'lyricsContainer';
        this.lyricsContainer.innerHTML = `
            <div class="lyrics-content" id="lyricsContent">
                <div class="lyrics-line current">加载歌词中...</div>
            </div>
        `;
        
        // 将迷你按钮、播放器和歌词容器添加到外层容器中
        this.playerWrapper.appendChild(this.miniPlayerBtn);
        this.playerWrapper.appendChild(this.playerContainer);
        this.playerWrapper.appendChild(this.lyricsContainer);
        
        // 将外层容器添加到页面中
        document.body.appendChild(this.playerWrapper);
        
        // 默认隐藏完整播放器，只显示迷你按钮和歌词
        this.playerContainer.style.display = 'none';
        this.lyricsContainer.style.display = 'block';
        
        this.bindEvents();
    }
    
    createAudio() {
        this.audio = new Audio();
        this.audio.volume = 0.3;
        
        // 更新进度条
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                document.getElementById('progressFill').style.width = `${progress}%`;
                
                // 更新歌词
                this.updateLyrics();
            }
        });
        
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButton();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });
        
        // 添加歌曲结束事件，实现自动切换
        this.audio.addEventListener('ended', () => {
            this.nextSong();
        });
    }
    
    bindEvents() {
        // 迷你播放器按钮点击事件：切换播放器显示/隐藏
        this.miniPlayerBtn.addEventListener('click', () => {
            this.togglePlayer();
        });
        
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlay();
        });
        
        // 上一曲按钮事件
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.prevSong();
        });
        
        // 下一曲按钮事件
        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextSong();
        });
        
        this.playerContainer.querySelector('.progress-bar').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        });
    }
    
    // 切换播放器显示/隐藏
    togglePlayer() {
        if (this.playerContainer.style.display === 'none') {
            // 显示完整播放器
            this.playerContainer.style.display = 'block';
        } else {
            // 隐藏完整播放器，只显示迷你按钮和歌词
            this.playerContainer.style.display = 'none';
            // 保持歌词显示
            this.lyricsContainer.style.display = 'block';
        }
    }
    
    // 设置音乐列表
    setMusicList(musicList) {
        this.musicList = musicList;
        this.updateMusicListUI();
    }
    
    // 设置当前播放的音乐
    setMusic(title, url, lrcUrl = '') {
        this.currentSong.title = title || '未知歌曲';
        this.currentSong.url = url;
        this.currentSong.lrcUrl = lrcUrl;
        
        document.getElementById('currentSongTitle').textContent = this.currentSong.title;
        
        if (this.audio) {
            this.audio.src = url;
            this.audio.load();
        }
        
        // 加载歌词
        if (lrcUrl) {
            this.loadLyrics(lrcUrl);
        } else {
            this.clearLyrics();
        }
        
        // 更新音乐列表UI，高亮当前歌曲
        this.updateMusicListUI();
    }
    
    // 从列表中播放歌曲
    playFromList(index) {
        if (index >= 0 && index < this.musicList.length) {
            this.currentIndex = index;
            const song = this.musicList[index];
            this.setMusic(song.title, song.url, song.lrcUrl);
            this.play();
        }
    }
    
    // 上一曲
    prevSong() {
        if (this.musicList.length === 0) return;
        
        this.currentIndex = (this.currentIndex - 1 + this.musicList.length) % this.musicList.length;
        this.playFromList(this.currentIndex);
    }
    
    // 下一曲
    nextSong() {
        if (this.musicList.length === 0) return;
        
        this.currentIndex = (this.currentIndex + 1) % this.musicList.length;
        this.playFromList(this.currentIndex);
    }
    
    // 切换音乐列表显示
    toggleMusicList() {
        if (this.musicListContainer) {
            this.musicListContainer.classList.toggle('show');
        }
    }
    
    // 切换循环模式
    toggleLoop() {
        this.isLoop = !this.isLoop;
        const loopBtn = document.getElementById('loopBtn');
        loopBtn.style.color = this.isLoop ? '#ff6b6b' : '#fff';
    }
    
    // 更新音乐列表UI
    updateMusicListUI() {
        const musicListElement = document.getElementById('musicList');
        if (!musicListElement) return;
        
        musicListElement.innerHTML = '';
        
        this.musicList.forEach((song, index) => {
            const listItem = document.createElement('li');
            listItem.className = `music-list-item ${index === this.currentIndex ? 'active' : ''}`;
            listItem.innerHTML = `
                <span class="song-name">${song.title}</span>
                ${index === this.currentIndex ? '<span class="play-indicator">▶</span>' : ''}
            `;
            
            listItem.addEventListener('click', () => {
                this.playFromList(index);
            });
            
            musicListElement.appendChild(listItem);
        });
    }
    
    async loadLyrics(lrcUrl) {
        try {
            const response = await fetch(lrcUrl);
            const lrcText = await response.text();
            this.parseLyrics(lrcText);
        } catch (error) {
            console.warn('加载歌词失败:', error);
            this.showNoLyrics();
        }
    }
    
    parseLyrics(lrcText) {
        this.lyrics = [];
        const lines = lrcText.split('\n');
        
        // 正则表达式匹配时间标签 [mm:ss.xx] 或 [mm:ss]
        const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
        
        lines.forEach(line => {
            const matches = [...line.matchAll(timeRegex)];
            if (matches.length > 0) {
                const time = this.parseTime(matches[0][1], matches[0][2], matches[0][3] || '00');
                const text = line.replace(timeRegex, '').trim();
                
                if (text) {
                    this.lyrics.push({ time, text });
                }
            }
        });
        
        // 按时间排序
        this.lyrics.sort((a, b) => a.time - b.time);
        
        // 初始化歌词显示
        this.updateLyrics();
    }
    
    parseTime(minutes, seconds, centiseconds) {
        // 将时间转换为秒数
        return parseInt(minutes) * 60 + 
               parseInt(seconds) + 
               parseInt(centiseconds) / 100;
    }
    
    updateLyrics() {
        if (this.lyrics.length === 0) return;
        
        const currentTime = this.audio.currentTime;
        let newIndex = -1;
        
        // 找到当前应该显示的歌词行
        for (let i = 0; i < this.lyrics.length; i++) {
            if (i === this.lyrics.length - 1 || 
                (this.lyrics[i].time <= currentTime && this.lyrics[i + 1].time > currentTime)) {
                newIndex = i;
                break;
            }
        }
        
        if (newIndex !== this.currentLyricIndex) {
            this.currentLyricIndex = newIndex;
            this.displayCurrentLyric();
        }
    }
    
    displayCurrentLyric() {
        const lyricsContent = document.getElementById('lyricsContent');
        lyricsContent.innerHTML = '';
        
        if (this.currentLyricIndex >= 0) {
            // 显示当前歌词（居中高亮）
            const currentLine = document.createElement('div');
            currentLine.className = 'lyrics-line current';
            currentLine.textContent = this.lyrics[this.currentLyricIndex].text;
            lyricsContent.appendChild(currentLine);
            
            // 显示上一行（如果有）
            if (this.currentLyricIndex > 0) {
                const prevLine = document.createElement('div');
                prevLine.className = 'lyrics-line';
                prevLine.textContent = this.lyrics[this.currentLyricIndex - 1].text;
                lyricsContent.insertBefore(prevLine, currentLine);
            }
            
            // 显示下一行（如果有）
            if (this.currentLyricIndex < this.lyrics.length - 1) {
                const nextLine = document.createElement('div');
                nextLine.className = 'lyrics-line';
                nextLine.textContent = this.lyrics[this.currentLyricIndex + 1].text;
                lyricsContent.appendChild(nextLine);
            }
        } else {
            // 没有匹配的歌词
            const line = document.createElement('div');
            line.className = 'lyrics-line';
            line.textContent = '暂无歌词';
            lyricsContent.appendChild(line);
        }
    }
    
    clearLyrics() {
        this.lyrics = [];
        this.currentLyricIndex = -1;
        const lyricsContent = document.getElementById('lyricsContent');
        lyricsContent.innerHTML = '<div class="lyrics-line">暂无歌词</div>';
    }
    
    showNoLyrics() {
        const lyricsContent = document.getElementById('lyricsContent');
        lyricsContent.innerHTML = '<div class="lyrics-line">歌词加载中</div>';
    }
    
toggleLyrics() {

    const btn = document.getElementById('lyricsBtn');
    if (this.lyricsContainer.classList.contains('hidden')) {
        this.lyricsContainer.classList.remove('hidden');
        btn.innerHTML = '<i class="icon">📝</i>';
    } else {
        this.lyricsContainer.classList.add('hidden');
        btn.innerHTML = '<i class="icon">👁️</i>';
    }

}
    
    play() {
        if (this.audio && this.currentSong.url) {
            this.audio.play().catch(error => {
                console.warn('自动播放被浏览器阻止:', error);
                this.showPlayHint();
            });
        }
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    toggleMute() {
        this.audio.muted = !this.audio.muted;
        const muteBtn = document.getElementById('muteBtn');
        muteBtn.innerHTML = `<i class="icon">${this.audio.muted ? '🔇' : '🔊'}</i>`;
    }
    
    close() {
        this.pause();
        if (this.playerWrapper) {
            this.playerWrapper.remove();
            this.playerWrapper = null;
            this.playerContainer = null;
            this.lyricsContainer = null;
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = `<i class="icon">${this.isPlaying ? '⏸' : '▶'}</i>`;
    }
    
    showPlayHint() {
        if (this.isPlayHintShown) return; // 如果提示已经显示过，直接返回
             this.isPlayHintShown = true;
        const hint = document.createElement('div');
        hint.className = 'play-hint';
        hint.textContent = '点击页面任意位置以播放背景音乐';
        document.body.appendChild(hint);
        
        setTimeout(() => {
            if (hint.parentElement) {
                hint.remove();
            }
        }, 10000);
        
        const playHandler = () => {
            this.play();
            hint.remove();
            document.removeEventListener('click', playHandler);
        };
        
        document.addEventListener('click', playHandler);
    }
}
