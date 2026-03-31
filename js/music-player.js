var MusicPlayer = (function() {
    function MusicPlayer() {
        this.audio = null;
        this.isPlaying = false;
        this.currentSongIndex = 0;
        this.lyrics = [];
        this.currentLyricIndex = -1;
        
        this.musicList = [
            {
                title: '孙燕姿 - 遇见',
                url: 'http://note.youdao.com/yws/api/personal/file/1f3ec446fd52ecd683be5c509aebf58d?method=download&inline=true&shareKey=fc9eac5d25590b1c61a9d8a9450d653a',
                lrcUrl: './lrc/yujian.lrc'
            },
            {
                title: '毛不易 - 给你给我',
                url: 'http://note.youdao.com/yws/api/personal/file/e9255f74a03034e6194aad0a8d1f277e?method=download&inline=true&shareKey=be61f4113153eade2911bf6fe6891931',
                lrcUrl: './lrc/gngwo.lrc'
            },
            {
                title: '张杰 - 少年中国说',
                url: 'http://note.youdao.com/yws/api/personal/file/19803c2bfda5cfd06df07147ee8ece54?method=download&inline=true&shareKey=4ab84312ba36407a167125812538a768',
                lrcUrl: './lrc/china_say.lrc'
            },
            {
                title: '群星 - 失控',
                url: 'http://note.youdao.com/yws/api/personal/file/00234c8c38ecd64c6019d46c9b8f153b?method=download&inline=true&shareKey=98669ad7c421a1f6d7e59350f4ad943c',
                lrcUrl: './lrc/shikong.lrc'
            }
        ];
        
        this.init();
    }
    
    MusicPlayer.prototype.init = function() {
        this.createAudio();
        this.bindEvents();
        this.updateMusicList();
        this.loadSong(0);
    };
    
    MusicPlayer.prototype.createAudio = function() {
        this.audio = new Audio();
        this.audio.volume = 0.5;
        
        var self = this;
        
        this.audio.addEventListener('timeupdate', function() {
            self.updateProgress();
            self.updateLyrics();
        });
        
        this.audio.addEventListener('ended', function() {
            self.nextSong();
        });
        
        this.audio.addEventListener('play', function() {
            self.isPlaying = true;
            self.updatePlayButton();
            $('.song-cover').addClass('playing');
        });
        
        this.audio.addEventListener('pause', function() {
            self.isPlaying = false;
            self.updatePlayButton();
            $('.song-cover').removeClass('playing');
        });
        
        this.audio.addEventListener('loadedmetadata', function() {
            self.updateDuration();
        });
    };
    
    MusicPlayer.prototype.bindEvents = function() {
        var self = this;
        
        $('#playPauseBtn').off('click').on('click', function() {
            self.togglePlay();
        });
        
        $('#prevBtn').off('click').on('click', function() {
            self.prevSong();
        });
        
        $('#nextBtn').off('click').on('click', function() {
            self.nextSong();
        });
        
        $('.progress-bar-container').off('click').on('click', function(e) {
            var rect = this.getBoundingClientRect();
            var percent = (e.clientX - rect.left) / rect.width;
            self.audio.currentTime = percent * self.audio.duration;
        });
        
        $('.volume-slider').off('input').on('input', function() {
            self.audio.volume = this.value;
        });
        
        $('#togglePlaylistBtn').off('click').on('click', function() {
            var $playlistSection = $('.music-list-section');
            var $btn = $(this);
            $playlistSection.toggleClass('hidden');
            if ($playlistSection.hasClass('hidden')) {
                $btn.text('显示播放列表');
            } else {
                $btn.text('隐藏播放列表');
            }
        });
    };
    
    MusicPlayer.prototype.loadSong = function(index) {
        if (index < 0 || index >= this.musicList.length) return;
        
        this.currentSongIndex = index;
        var song = this.musicList[index];
        
        this.audio.src = song.url;
        this.audio.load();
        
        $('.song-title-display').text(song.title);
        this.updateMusicList();
        
        if (song.lrcUrl) {
            this.loadLyrics(song.lrcUrl);
        } else {
            this.clearLyrics();
        }
    };
    
    MusicPlayer.prototype.loadLyrics = function(lrcUrl) {
        var self = this;
        this.lyrics = [];
        
        $.get(lrcUrl).done(function(data) {
            self.parseLyrics(data);
        }).fail(function() {
            self.clearLyrics();
        });
    };
    
    MusicPlayer.prototype.parseLyrics = function(lrcText) {
        this.lyrics = [];
        var lines = lrcText.split('\n');
        var timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
        
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var matches = line.match(timeRegex);
            
            if (matches && matches.length > 0) {
                var timeMatch = matches[0].match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/);
                if (timeMatch) {
                    var minutes = parseInt(timeMatch[1]);
                    var seconds = parseInt(timeMatch[2]);
                    var centiseconds = parseInt(timeMatch[3] || '0');
                    var time = minutes * 60 + seconds + centiseconds / 100;
                    
                    var text = line.replace(timeRegex, '').trim();
                    if (text) {
                        this.lyrics.push({ time: time, text: text });
                    }
                }
            }
        }
        
        this.lyrics.sort(function(a, b) { return a.time - b.time; });
        this.displayLyrics();
        
        if (this.audio) {
            var self = this;
            setTimeout(function() {
                self.updateLyrics();
            }, 100);
        }
    };
    
    MusicPlayer.prototype.displayLyrics = function() {
        var container = $('.lyrics-display');
        container.empty();
        
        if (this.lyrics.length === 0) {
            container.append('<div class="lyrics-line">暂无歌词</div>');
            return;
        }
        
        for (var i = 0; i < this.lyrics.length; i++) {
            container.append('<div class="lyrics-line" data-index="' + i + '">' + this.lyrics[i].text + '</div>');
        }
    };
    
    MusicPlayer.prototype.updateLyrics = function() {
        if (this.lyrics.length === 0) return;
        
        var currentTime = this.audio.currentTime;
        var newIndex = -1;
        
        for (var i = 0; i < this.lyrics.length; i++) {
            if (i === this.lyrics.length - 1 || 
                (this.lyrics[i].time <= currentTime && this.lyrics[i + 1].time > currentTime)) {
                newIndex = i;
                break;
            }
        }
        
        if (newIndex >= 0) {
            var shouldUpdateHighlight = newIndex !== this.currentLyricIndex;
            
            if (shouldUpdateHighlight) {
                this.currentLyricIndex = newIndex;
                $('.lyrics-line').removeClass('active');
                $('.lyrics-line[data-index="' + newIndex + '"]').addClass('active');
            }
            
            var container = $('.lyrics-display');
            var activeLine = $('.lyrics-line.active');
            
            if (container.length && activeLine.length && container[0].clientHeight > 0) {
                var lineOffsetTop = activeLine[0].offsetTop;
                var containerHeight = container[0].clientHeight;
                var lineHeight = activeLine[0].offsetHeight;
                var currentScrollTop = container[0].scrollTop;
                
                var isVisible = (lineOffsetTop >= currentScrollTop && 
                               lineOffsetTop + lineHeight <= currentScrollTop + containerHeight);
                
                if (!isVisible || shouldUpdateHighlight) {
                    var scrollTop = lineOffsetTop - containerHeight / 2 + lineHeight / 2;
                    scrollTop = Math.max(0, Math.min(scrollTop, container[0].scrollHeight - containerHeight));
                    container[0].scrollTop = scrollTop;
                }
            }
        }
    };
    
    MusicPlayer.prototype.clearLyrics = function() {
        this.lyrics = [];
        this.currentLyricIndex = -1;
        $('.lyrics-display').html('<div class="lyrics-line">暂无歌词</div>');
    };
    
    MusicPlayer.prototype.updateProgress = function() {
        if (this.audio.duration) {
            var progress = (this.audio.currentTime / this.audio.duration) * 100;
            $('.progress-bar-fill').css('width', progress + '%');
            
            var currentMin = Math.floor(this.audio.currentTime / 60);
            var currentSec = Math.floor(this.audio.currentTime % 60);
            $('.current-time').text(
                (currentMin < 10 ? '0' : '') + currentMin + ':' + 
                (currentSec < 10 ? '0' : '') + currentSec
            );
        }
    };
    
    MusicPlayer.prototype.updateDuration = function() {
        var durationMin = Math.floor(this.audio.duration / 60);
        var durationSec = Math.floor(this.audio.duration % 60);
        $('.duration-time').text(
            (durationMin < 10 ? '0' : '') + durationMin + ':' + 
            (durationSec < 10 ? '0' : '') + durationSec
        );
    };
    
    MusicPlayer.prototype.updatePlayButton = function() {
        var btn = $('#playPauseBtn');
        if (this.isPlaying) {
            btn.html('⏸');
        } else {
            btn.html('▶');
        }
    };
    
    MusicPlayer.prototype.updateMusicList = function() {
        var container = $('.music-list');
        container.empty();
        
        for (var i = 0; i < this.musicList.length; i++) {
            var song = this.musicList[i];
            var isActive = i === this.currentSongIndex;
            var item = '<li class="music-list-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">' +
                '<span class="song-index">' + (i + 1) + '</span>' +
                '<span class="song-name">' + song.title + '</span>' +
                (isActive && this.isPlaying ? '<span class="playing-indicator">▶</span>' : '') +
                '</li>';
            container.append(item);
        }
        
        var self = this;
        $('.music-list-item').off('click').on('click', function() {
            var index = parseInt($(this).data('index'));
            self.loadSong(index);
            self.play();
        });
    };
    
    MusicPlayer.prototype.play = function() {
        if (this.audio && this.audio.src) {
            var self = this;
            this.audio.play().catch(function(error) {
                console.log('播放失败:', error);
            });
        }
    };
    
    MusicPlayer.prototype.pause = function() {
        if (this.audio) {
            this.audio.pause();
        }
    };
    
    MusicPlayer.prototype.togglePlay = function() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    };
    
    MusicPlayer.prototype.prevSong = function() {
        var newIndex = (this.currentSongIndex - 1 + this.musicList.length) % this.musicList.length;
        this.loadSong(newIndex);
        this.play();
    };
    
    MusicPlayer.prototype.nextSong = function() {
        var newIndex = (this.currentSongIndex + 1) % this.musicList.length;
        this.loadSong(newIndex);
        this.play();
    };
    
    return MusicPlayer;
})();

var musicPlayer = null;

function initMusicPlayer() {
    musicPlayer = new MusicPlayer();
}
