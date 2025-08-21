// js/background-music.js
export class BackgroundMusicPlayer {
    constructor() {
        this.audio = null;
        this.playerContainer = null;
        this.isPlaying = false;
        this.currentSong = {
            title: '未知歌曲',
            url: ''
        };
        
        // 默认的背景音乐配置
        this.defaultMusic = {
            title: '温馨时光', // 默认歌名
            url: 'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a' // 替换为您的音乐直链
        };
        
        this.init();
    }
    
    init() {
        // 创建播放器容器
        this.createPlayer();
        
        // 初始化音频对象
        this.createAudio();
        
        // 设置默认音乐
        this.setMusic(this.defaultMusic.title, this.defaultMusic.url);
        
        // 自动播放（注意：浏览器策略可能阻止自动播放）
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
        `;
        
        document.body.appendChild(this.playerContainer);
        
        // 绑定事件
        this.bindEvents();
    }
    
    createAudio() {
        this.audio = new Audio();
        this.audio.loop = true; // 循环播放
        this.audio.volume = 0.8; // 初始音量
        
        // 更新进度条
        this.audio.addEventListener('timeupdate', () => {
            if (this.audio.duration) {
                const progress = (this.audio.currentTime / this.audio.duration) * 100;
                document.getElementById('progressFill').style.width = `${progress}%`;
            }
        });
        
        // 处理播放/暂停状态
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
        // 播放/暂停按钮
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlay();
        });
        
        // 静音按钮
        document.getElementById('muteBtn').addEventListener('click', () => {
            this.toggleMute();
        });
        
        // 关闭按钮
        document.getElementById('closeBtn').addEventListener('click', () => {
            this.close();
        });
        
        // 点击进度条跳转
        this.playerContainer.querySelector('.progress-bar').addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            this.audio.currentTime = percent * this.audio.duration;
        });
    }
    
    setMusic(title, url) {
        this.currentSong.title = title || '未知歌曲';
        this.currentSong.url = url;
        
        // 更新显示的歌名
        document.getElementById('currentSongTitle').textContent = this.currentSong.title;
        
        // 设置音频源
        if (this.audio) {
            this.audio.src = url;
            this.audio.load();
        }
    }
    
    play() {
        if (this.audio && this.currentSong.url) {
            this.audio.play().catch(error => {
                console.warn('自动播放被浏览器阻止:', error);
                // 显示提示，需要用户交互才能播放
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
        // 可以在这里添加回调或事件通知音乐已关闭
    }
    
    updatePlayButton() {
        const playBtn = document.getElementById('playPauseBtn');
        playBtn.innerHTML = `<i class="icon">${this.isPlaying ? '⏸' : '▶'}</i>`;
    }
    
    showPlayHint() {
        // 创建一个临时提示
        const hint = document.createElement('div');
        hint.className = 'play-hint';
        hint.textContent = '点击页面任意位置以播放背景音乐';
        document.body.appendChild(hint);
        
        // 5秒后自动移除
        setTimeout(() => {
            if (hint.parentElement) {
                hint.remove();
            }
        }, 5000);
        
        // 点击页面任意位置播放
        const playHandler = () => {
            this.play();
            hint.remove();
            document.removeEventListener('click', playHandler);
        };
        
        document.addEventListener('click', playHandler);
    }
}
