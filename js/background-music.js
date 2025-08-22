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
        
        this.defaultMusic = {
            title: '温馨时光',
            url: 'https://example.com/music/background.mp3',
            lrcUrl: 'https://example.com/lyrics/song.lrc' // 默认歌词URL
        };
        
        this.init();
    }
    
    init() {
        this.createPlayer();
        this.createAudio();
        this.setMusic(this.defaultMusic.title, this.defaultMusic.url, this.defaultMusic.lrcUrl);
        this.play();
    }
    
    createPlayer() {
        this.playerContainer = document.createElement('div');
        this.playerContainer.className = 'bg-music-player';
        this.playerContainer.innerHTML = `
            <div class="player-content">
                <div class="song-info">
                    <span class="song-title">正在播放: <span id="currentSongTitle">${this.currentSong.title}</span></span>
                </div>
                <div class="player-controls">
                    <button id="playPauseBtn" class="control-btn">
                        <i class="icon">▶</i>
                    </button>
                    <button id="lyricsBtn" class="control-btn">
                        <i class="icon">📝</i>
                    </button>
                    <button id="muteBtn" class="control-btn">
                        <i class="icon">🔊</i>
                    </button>
                    <button id="closeBtn" class="control-btn close">
                        <i class="icon">×</i>
                    </button>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
            </div>
            <!-- 歌词容器 -->
            <div class="lyrics-container" id="lyricsContainer">
                <div class="lyrics-content" id="lyricsContent">
                    <div class="lyrics-line current">加载歌词中...</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.playerContainer);
        
        this.lyricsContainer = document.getElementById('lyricsContainer');
        this.bindEvents();
    }
    
    createAudio() {
        this.audio = new Audio();
        this.audio.loop = true;
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
    }
    
    bindEvents() {
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlay();
        });
        
        document.getElementById('lyricsBtn').addEventListener('click', () => {
            this.toggleLyrics();
        });
        
        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });
        
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.close();
        });
        
        this.playerContainer.querySelector('.progress-bar').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        });
    }
    
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
    }
    
// background-music.js
// js/background-music.js
 async loadLyrics() {
        try {
            const response = await fetch(this.lrcUrl, {
                headers: {
                    'Accept': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP 请求失败，状态码：${response.status}`);
            }

            const blob = await response.blob();
            const lrcText = await blob.text();

            if (!lrcText || lrcText.trim() === '') {
                throw new Error('歌词内容为空');
            }

            if (!/^\[.*\]/.test(lrcText)) {
                throw new Error('歌词格式不正确');
            }

            console.log("【歌词内容】", lrcText);
            this.parseLyrics(lrcText);
        } catch (error) {
            console.error("【加载歌词失败】", error.message);
            this.showNoLyrics();
        }
    }

    parseLyrics(lrcText) {
        // 解析歌词逻辑
    }

    showNoLyrics() {
        // 显示无歌词提示
    }
}
    
parseLyrics(lrcText) {
    this.lyrics = [];
    const lines = lrcText.split('\n');
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length > 0) {
            const time = this.parseTime(matches[0][1], matches[0][2], matches[0][3] || '00');
            const text = line.replace(timeRegex, '').trim();
            if (text) {
                this.lyrics.push({ time, text });
            }
        }
    }

    this.lyrics.sort((a, b) => a.time - b.time);
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
        lyricsContent.innerHTML = '<div class="lyrics-line">歌词加载失败</div>';
    }
    
    toggleLyrics() {
        this.lyricsContainer.classList.toggle('show');
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
        if (this.playerContainer) {
            this.playerContainer.remove();
            this.playerContainer = null;
        }
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = `<i class="icon">${this.isPlaying ? '⏸' : '▶'}</i>`;
    }
    
    showPlayHint() {
        const hint = document.createElement('div');
        hint.className = 'play-hint';
        hint.textContent = '点击页面任意位置以播放背景音乐';
        document.body.appendChild(hint);
        
        setTimeout(() => {
            if (hint.parentElement) {
                hint.remove();
            }
        }, 5000);
        
        const playHandler = () => {
            this.play();
            hint.remove();
            document.removeEventListener('click', playHandler);
        };
        
        document.addEventListener('click', playHandler);
    }
}
