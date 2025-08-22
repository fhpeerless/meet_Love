export class BackgroundMusicPlayer {
    constructor() {
        this.audioContext = null;
        this.sourceNode = null;
        this.audioBuffer = null;
        this.gainNode = null;
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
        
        // 用于存储当前时间，以便在页面切换后恢复
        this.currentTime = 0;
        
        this.init();
    }
    
    async init() {
        // 创建 Web Audio API 上下文（延迟创建，避免自动播放限制）
        this.createAudioContext();
        
        this.createPlayer();
        this.setMusic(this.defaultMusic.title, this.defaultMusic.url, this.defaultMusic.lrcUrl);
        
        // 注意：由于浏览器自动播放限制，不能在这里自动播放
        // 需要用户交互后才能播放
    }
    
    createAudioContext() {
        // 只有在用户交互后才能创建音频上下文
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // 创建增益节点用于控制音量
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 0.3; // 设置初始音量为30%
            this.gainNode.connect(this.audioContext.destination);
        }
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
        
        // 添加页面可见性监听，防止在页面不可见时继续播放
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面不可见时暂停（保存状态）
                if (this.isPlaying) {
                    this.pause();
                    this.wasPlayingBeforeHide = true;
                }
            } else {
                // 页面重新可见时恢复播放
                if (this.wasPlayingBeforeHide) {
                    this.play();
                    this.wasPlayingBeforeHide = false;
                }
            }
        });
    }
    
    async loadAudioBuffer(url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        } catch (error) {
            console.error('加载音频文件失败:', error);
            // 如果加载失败，使用默认音乐
            if (url !== this.defaultMusic.url) {
                this.setMusic(this.defaultMusic.title, this.defaultMusic.url, this.defaultMusic.lrcUrl);
            }
        }
    }
    
    async play() {
        // 确保音频上下文已创建
        if (!this.audioContext) {
            this.createAudioContext();
        }
        
        // 如果音频上下文被暂停，先恢复
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        
        // 如果已经有音源节点，先停止
        if (this.sourceNode) {
            this.sourceNode.stop();
        }
        
        // 创建新的音源节点
        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.audioBuffer;
        this.sourceNode.loop = true;
        this.sourceNode.connect(this.gainNode);
        
        // 从上次保存的时间开始播放
        this.sourceNode.start(0, this.currentTime);
        
        this.isPlaying = true;
        this.updatePlayButton();
        
        // 启动时间更新定时器
        this.startUpdateTime();
    }
    
    pause() {
        if (this.sourceNode) {
            this.sourceNode.stop();
            this.sourceNode = null;
            
            // 保存当前播放时间
            if (this.audioContext && this.audioContext.state === 'running') {
                this.currentTime = this.audioContext.currentTime;
            }
        }
        
        this.isPlaying = false;
        this.updatePlayButton();
        
        // 停止时间更新
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
            this.timeUpdateInterval = null;
        }
    }
    
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    setMusic(title, url, lrcUrl = '') {
        this.currentSong.title = title || '未知歌曲';
        this.currentSong.url = url;
        this.currentSong.lrcUrl = lrcUrl;
        
        document.getElementById('currentSongTitle').textContent = this.currentSong.title;
        
        // 重置当前时间
        this.currentTime = 0;
        
        // 加载新的音频文件
        this.loadAudioBuffer(url);
        
        // 加载歌词
        if (lrcUrl) {
            this.loadLyrics(lrcUrl);
        } else {
            this.clearLyrics();
        }
    }
    
    bindEvents() {
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            // 首次点击时创建音频上下文
            if (!this.audioContext) {
                this.createAudioContext();
            }
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
            if (this.audioBuffer && this.isPlaying) {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                const duration = this.audioBuffer.duration;
                this.currentTime = percent * duration;
                
                // 重新开始播放
                this.pause();
                this.play();
                
                // 更新进度条
                this.updateProgress(percent * 100);
            }
        });
    }
    
    updatePlayButton() {
        const btn = document.getElementById('playPauseBtn');
        const icon = btn.querySelector('.icon');
        icon.textContent = this.isPlaying ? '❚❚' : '▶';
    }
    
    updateProgress(percent) {
        document.getElementById('progressFill').style.width = `${percent}%`;
    }
    
    startUpdateTime() {
        // 停止已有的定时器
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
        }
        
        // 创建新的定时器来更新进度和歌词
        this.timeUpdateInterval = setInterval(() => {
            if (this.isPlaying && this.audioBuffer) {
                // 计算当前播放时间
                let currentTime = this.currentTime + (this.audioContext.currentTime - this.startTime);
                const duration = this.audioBuffer.duration;
                const progress = (currentTime % duration) / duration * 100;
                
                this.updateProgress(progress);
                this.updateLyrics(currentTime % duration);
            }
        }, 100); // 每100ms更新一次
    }
    
    toggleMute() {
        if (this.gainNode) {
            this.gainNode.gain.value = this.gainNode.gain.value === 0 ? 0.3 : 0;
            const btn = document.getElementById('muteBtn');
            const icon = btn.querySelector('.icon');
            icon.textContent = this.gainNode.gain.value === 0 ? '🔇' : '🔊';
        }
    }
    
    close() {
        this.pause();
        if (this.playerContainer) {
            this.playerContainer.remove();
        }
    }
    
    // 歌词相关方法保持不变
    async loadLyrics(lrcUrl) {
        try {
            const response = await fetch(lrcUrl);
            const text = await response.text();
            this.parseLyrics(text);
        } catch (error) {
            console.error('加载歌词失败:', error);
            this.clearLyrics();
        }
    }
    
    parseLyrics(text) {
        this.lyrics = [];
        const lines = text.split('\n');
        
        for (let line of lines) {
            const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/);
            if (timeMatch) {
                const minutes = parseInt(timeMatch[1]);
                const seconds = parseInt(timeMatch[2]);
                const milliseconds = parseInt(timeMatch[3]);
                const time = minutes * 60 + seconds + milliseconds / 1000;
                
                const content = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
                if (content) {
                    this.lyrics.push({ time, content });
                }
            }
        }
        
        // 按时间排序
        this.lyrics.sort((a, b) => a.time - b.time);
        this.updateLyrics();
    }
    
    updateLyrics(currentTime) {
        if (!this.lyrics.length) return;
        
        // 如果没有传入当前时间，使用 Web Audio API 的时间
        if (currentTime === undefined) {
            if (this.isPlaying && this.audioBuffer) {
                currentTime = this.currentTime + (this.audioContext.currentTime - this.startTime);
                currentTime = currentTime % this.audioBuffer.duration;
            } else {
                currentTime = 0;
            }
        }
        
        // 找到当前应该显示的歌词
        let newIndex = -1;
        for (let i = 0; i < this.lyrics.length; i++) {
            if (currentTime >= this.lyrics[i].time) {
                newIndex = i;
            } else {
                break;
            }
        }
        
        if (newIndex !== this.currentLyricIndex) {
            this.currentLyricIndex = newIndex;
            this.displayCurrentLyric();
        }
    }
    
    displayCurrentLyric() {
        const content = document.getElementById('lyricsContent');
        if (this.currentLyricIndex >= 0) {
            content.innerHTML = '';
            const line = document.createElement('div');
            line.className = 'lyrics-line current';
            line.textContent = this.lyrics[this.currentLyricIndex].content;
            content.appendChild(line);
        } else {
            content.innerHTML = '<div class="lyrics-line current">暂无歌词</div>';
        }
    }
    
    clearLyrics() {
        this.lyrics = [];
        this.currentLyricIndex = -1;
        const content = document.getElementById('lyricsContent');
        content.innerHTML = '<div class="lyrics-line current">暂无歌词</div>';
    }
    
    toggleLyrics() {
        this.lyricsContainer.classList.toggle('show');
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
