// js/background-music.js
export class BackgroundMusicPlayer {
    constructor() {
        this.audio = null;
        this.playerContainer = null;
        this.lyricsContainer = null;
        this.isPlaying = false;
        this.musicList = []; // 新增：音乐列表
        this.currentSongIndex = 0; // 当前播放的歌曲索引
        this.isPlayHintShown = false; // 是否显示过播放提示
        this.init();
    }

    init() {
        this.createPlayer();
        this.createAudio();
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

    createPlayer() {
        this.playerContainer = document.createElement('div');
        this.playerContainer.className = 'bg-music-player';
        this.playerContainer.innerHTML = `
            <div class="player-content">
                <div class="song-info">
                    <span class="song-title">正在播放: <span id="currentSongTitle">加载中</span></span>
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
            <div class="lyrics-container hidden" id="lyricsContainer">
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

    play() {
        if (this.audio && this.currentSong && this.currentSong.url) {
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

    toggleLyrics() {
        const lyricsContainer = document.getElementById('lyricsContainer');
        if (lyricsContainer.classList.contains('hidden')) {
            lyricsContainer.classList.remove('hidden');
        } else {
            lyricsContainer.classList.add('hidden');
        }
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
        if (this.isPlayHintShown) return;
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

    // 歌词加载逻辑
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
}
