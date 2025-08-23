// js/background-music.js
// 修改背景音乐播放器类
export class BackgroundMusicPlayer {
    constructor() {
        this.audio = null;
        this.playerContainer = null;
        this.lyricsContainer = null;
        this.isPlaying = false;
        this.musicList = []; // 新增：音乐列表
        this.currentSongIndex = 0; // 当前播放的歌曲索引
        this.init();
    }

    init() {
        this.createPlayer();
        this.createAudio();
        // 默认音乐列表（可从外部传入）
        this.setMusicList([
            {
                title: '遇见 - 孙燕姿',
                url: 'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
                lrcUrl: './lrc/yujian.lrc'
            },
            {
                title: '第二首歌',
                url: 'https://yourdomain.com/music/second.mp3',
                lrcUrl: ''
            },
            {
                title: '第三首歌',
                url: 'https://yourdomain.com/music/third.mp3',
                lrcUrl: ''
            }
        ]);
        this.play();
        // 监听音频结束事件，自动播放下一首
        this.audio.addEventListener('ended', () => {
            this.nextSong();
        });
    }

    setMusicList(musicList) {
        this.musicList = musicList;
        if (this.musicList.length > 0) {
            this.setMusic(this.musicList[this.currentSongIndex]);
        }
    }

    setMusic(song) {
        this.currentSong = song;
        document.getElementById('currentSongTitle').textContent = song.title;
        if (this.audio) {
            this.audio.src = song.url;
            this.audio.load();
        }
        // 加载歌词
        if (song.lrcUrl) {
            this.loadLyrics(song.lrcUrl);
        } else {
            this.clearLyrics();
        }
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.musicList.length;
        this.setMusic(this.musicList[this.currentSongIndex]);
        this.play();
    }

    // 其余方法保持不变（play、pause、togglePlay 等）
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
                <button id="prevBtn" class="control-btn">⏮</button>
                <button id="playPauseBtn" class="control-btn">▶</button>
                <button id="nextBtn" class="control-btn">⏭</button>
                <button id="lyricsBtn" class="control-btn">📝</button>
                <button id="muteBtn" class="control-btn">🔊</button>
                <button id="closeBtn" class="control-btn close">×</button>
            </div>
        </div>
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" id="progressFill"></div>
            </div>
        </div>
        <!-- 🔻 修改：移除 'show' 类，让默认不显示，但我们会在 JS 中控制 -->
        <div class="lyrics-container" id="lyricsContainer">
            <div class="lyrics-content" id="lyricsContent">
                <div class="lyrics-line current">加载歌词中...</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(this.playerContainer);

    this.lyricsContainer = document.getElementById('lyricsContainer');
    
    // 🔥 新增：设置默认显示
    this.lyricsContainer.style.display = 'block'; // 或 'flex'，根据布局
    
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
