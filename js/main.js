$(function() {
    var $animationBtn = $('#animation-btn');
    var $diaryBtn = $('#diary-btn');
    var $musicBtn = $('#music-btn');
    var $main = $('#main');
    var $diarySection = $('#diary-section');
    var $diaryEntries = $('#diary-entries');
    var $musicSection = $('#music-section');

    function initTitleAnimation() {
        var titleText = "我站在爱心树下，等一个可以把计时归零的人！";
        var $titleContainer = $('#main-title');
        $titleContainer.empty();
        
        for (var i = 0; i < titleText.length; i++) {
            var $charSpan = $('<span class="title-char"></span>');
            $charSpan.text(titleText[i]);
            $titleContainer.append($charSpan);
        }
        
        function animateTitle() {
            var $chars = $('.title-char');
            $chars.css({
                'opacity': 0,
                'filter': 'blur(15px)'
            });
            
            $chars.each(function(index) {
                var $char = $(this);
                setTimeout(function() {
                    $char.css({
                        'opacity': 1,
                        'filter': 'blur(0px)'
                    });
                }, index * 350);
            });
        }
        
        setTimeout(animateTitle, 500);
    }

    initTitleAnimation();
    initMusicPlayer();

    var $fundBtn = $('#fund-btn');
    var $fundSection = $('#fund-section');

    $fundBtn.click(function() {
        $animationBtn.removeClass('active');
        $diaryBtn.removeClass('active');
        $musicBtn.removeClass('active');
        $(this).addClass('active');
        $main.hide();
        $diarySection.hide();
        $musicSection.hide();
        $fundSection.show();

        if (musicPlayer && musicPlayer.desktopLyricsEnabled) {
            $('#desktop-lyrics').addClass('desktop-lyrics-show');
        }

        loadFundData();
    });

    $musicBtn.click(function() {
        $animationBtn.removeClass('active');
        $diaryBtn.removeClass('active');
        $fundBtn.removeClass('active');
        $(this).addClass('active');
        $main.hide();
        $diarySection.hide();
        $fundSection.hide();
        $musicSection.show();
        
        if (musicPlayer && !musicPlayer.isPlaying) {
            musicPlayer.play();
        }

        $('#desktop-lyrics').removeClass('desktop-lyrics-show');
    });

    function loadDiary() {
        $.getJSON('config/diary.json', function(data) {
            $diaryEntries.empty();
            $.each(data, function(index, entry) {
                var entryHtml = '<div class="diary-entry">' +
                    '<div class="diary-entry-header">' +
                    '<h3>' + entry.date + '</h3>';
                
                if (entry.songId && musicPlayer) {
                    var song = musicPlayer.getSongById(entry.songId);
                    if (song) {
                        entryHtml += '<button class="diary-play-btn" data-song-id="' + entry.songId + '" title="播放: ' + song.title + '">🎵 播放 ' + song.title + '</button>';
                    }
                }
                
                entryHtml += '</div>' +
                    '<p class="diary-subtitle">' + (entry.subtitle || '') + '</p>' +
                    '<p>' + entry.content + '</p>';
                
                if (entry.images && entry.images.length > 0) {
                    entryHtml += '<div class="diary-images">';
                    for (var i = 0; i < entry.images.length; i++) {
                        entryHtml += '<img src="' + entry.images[i] + '" class="diary-image" alt="日记图片">';
                    }
                    entryHtml += '</div>';
                }

                if (entry.douyinUrl) {
                    var douyinMatch = entry.douyinUrl.match(/(video|note)\/(\d+)/);
                    if (douyinMatch) {
                        var douyinType = douyinMatch[1];
                        var typeLabel = douyinType === 'note' ? '图文' : '视频';
                        entryHtml += '<div class="diary-douyin-embed" data-douyin-url="' + entry.douyinUrl + '" data-douyin-type="' + douyinType + '">' +
                            '<a href="' + entry.douyinUrl + '" target="_blank" class="douyin-embed-card">' +
                            '<div class="douyin-embed-icon">▶</div>' +
                            '<div class="douyin-embed-info">' +
                            '<span class="douyin-embed-label">正在加载' + typeLabel + '信息...</span>' +
                            '<span class="douyin-embed-hint">抖音' + typeLabel + '</span>' +
                            '</div>' +
                            '</a>' +
                            '</div>';
                    }
                }
                
                entryHtml += '</div>';
                $diaryEntries.append(entryHtml);
            });

            $diaryEntries.off('click', '.diary-play-btn').on('click', '.diary-play-btn', function() {
                var songId = $(this).data('song-id');
                if (musicPlayer && songId) {
                    musicPlayer.loadSongById(songId);
                }
            });

            $diaryEntries.find('[data-douyin-url]').each(function() {
                var $embed = $(this);
                var url = $embed.data('douyin-url');
                var douyinType = $embed.data('douyin-type') || 'video';
                var typeLabel = douyinType === 'note' ? '图文' : '视频';
                var $label = $embed.find('.douyin-embed-label');
                var $hint = $embed.find('.douyin-embed-hint');
                var proxyUrl = 'https://wild-tree-2dbf.68208932.workers.dev/?url=' + encodeURIComponent(url);
                fetch(proxyUrl)
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        if (data && data.data) {
                            var desc = data.data.desc || '';
                            var author = data.data.author ? data.data.author.nickname : '';
                            if (desc) $label.text(desc);
                            if (author) $hint.text('@' + author);
                            return;
                        }
                        if (data && data.error) {
                            console.warn('Worker error:', data);
                        }
                        $label.text('查看抖音' + typeLabel);
                        $hint.text('点此跳转抖音查看 ↗');
                    })
                    .catch(function(err) {
                        console.warn('Fetch error:', err);
                        $label.text('查看抖音' + typeLabel);
                        $hint.text('点此跳转抖音查看 ↗');
                    });
            });

        }).fail(function() {
            $diaryEntries.html('<p style="text-align:center;color:#666;">加载日记失败，请确保config/diary.json文件存在</p>');
        });
    }

    loadDiary();

    $animationBtn.click(function() {
        $(this).addClass('active');
        $diaryBtn.removeClass('active');
        $musicBtn.removeClass('active');
        $fundBtn.removeClass('active');
        $main.show();
        $diarySection.hide();
        $musicSection.hide();
        $fundSection.hide();

        $('#desktop-lyrics').removeClass('desktop-lyrics-show');
    });

    $diaryBtn.click(function() {
        $(this).addClass('active');
        $animationBtn.removeClass('active');
        $musicBtn.removeClass('active');
        $fundBtn.removeClass('active');
        $main.hide();
        $diarySection.show();
        $musicSection.hide();
        $fundSection.hide();
        
        if (musicPlayer && musicPlayer.desktopLyricsEnabled) {
            $('#desktop-lyrics').addClass('desktop-lyrics-show');
        }
        
        $diaryEntries.animate({
            scrollTop: $diaryEntries[0].scrollHeight
        }, 'slow');
    });
});

(function () {
    var canvas = $('#canvas');

    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    var width = canvas.width();
    var height = canvas.height();

    canvas.attr("width", width);
    canvas.attr("height", height);

    var fallingPhotos = [
        "https://note.youdao.com/yws/api/personal/file/WEB590105f1a9d07ac686e941d38cdad971?method=download&inline=true&shareKey=60cbe361e727d561d2425f3fd26b3cf1",
        "https://note.youdao.com/yws/api/personal/file/WEB726ae6fa64eed5a096d10745a5fc99ac?method=download&inline=true&shareKey=0db2aab9fa92b3d2066a676f7ba3ca31",
        "falling-photos/3.jpg",
        "falling-photos/4.jpg",
        "falling-photos/5.jpg"
    ];
    
    var loadedImages = [];
    var imagesLoaded = 0;
    
    fallingPhotos.forEach(function(src, index) {
        var img = new Image();
        img.onload = function() {
            imagesLoaded++;
        };
        img.src = src;
        loadedImages.push(img);
    });
    
    window.fallingImages = loadedImages;

    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(190, 26, 37)",
            scale: 2
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 520,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 5,
            speed: 10,
        }
    }

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;

    // ===== 爱心树果实系统 =====
    var FRUIT_TOTAL = 520;

    var sproutHeartColors = [
        '#FFB6C1', '#FFC0CB', '#FFDAB9', '#E6E6FA', '#D8BFD8',
        '#DDA0DD', '#F0E68C', '#FFFACD', '#E0F0FF', '#B0E0E6',
        '#98FB98', '#AFEEEE', '#FFE4E1', '#F5DEB3', '#FFF5EE',
        '#F0FFF0', '#F5F5DC', '#FFE4B5', '#FFD700', '#FFA07A'
    ];

    function getDayOfYear(month, day) {
        var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var doy = 0;
        for (var i = 0; i < month - 1; i++) {
            doy += daysInMonth[i];
        }
        doy += day;
        return doy;
    }

    function getDaysBetween(md1, md2) {
        var m1 = Math.floor(md1 / 100);
        var d1 = md1 % 100;
        var m2 = Math.floor(md2 / 100);
        var d2 = md2 % 100;
        return getDayOfYear(m2, d2) - getDayOfYear(m1, d1);
    }

    function getSproutHeartCount(md) {
        if (md >= 310 && md < 320) {
            var daysSince = getDaysBetween(310, md);
            return Math.min(20, (daysSince + 1) * 2);
        }
        return 0;
    }

    function getTreeState() {
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();
        var md = month * 100 + day;

        if (md >= 1226 || md < 302) {
            return { state: 'DORMANT', label: '休眠中', fruitCount: 0, yellowCount: 0, yellowRatio: 0, sproutCount: 0 };
        }
        if (md >= 302 && md < 310) {
            return { state: 'AWAKENING', label: '苏醒中', fruitCount: 0, yellowCount: 0, yellowRatio: 0, sproutCount: 0 };
        }
        if (md >= 310 && md < 320) {
            var sproutCount = getSproutHeartCount(md);
            return { state: 'SPROUTING', label: '发芽中 (' + sproutCount + '/20)', fruitCount: 0, yellowCount: 0, yellowRatio: 0, sproutCount: sproutCount };
        }
        if (md >= 320 && md < 815) {
            var daysSince = getDaysBetween(320, md);
            var totalDays = getDaysBetween(320, 815);
            var fruitCount = Math.min(FRUIT_TOTAL, Math.round(1 + (daysSince * (FRUIT_TOTAL - 1) / totalDays)));
            return { state: 'GROWING', label: '结果中 (' + fruitCount + '/' + FRUIT_TOTAL + ')', fruitCount: fruitCount, yellowCount: 0, yellowRatio: 0, sproutCount: 0 };
        }
        if (md >= 815 && md < 902) {
            return { state: 'STABLE', label: '结果完毕 (' + FRUIT_TOTAL + '颗)', fruitCount: FRUIT_TOTAL, yellowCount: 0, yellowRatio: 0, sproutCount: 0 };
        }
        if (md >= 902 && md < 1006) {
            var daysSince = getDaysBetween(902, md);
            var totalDays = getDaysBetween(902, 1006);
            var yellowCount = Math.min(FRUIT_TOTAL, Math.round(1 + (daysSince * (FRUIT_TOTAL - 1) / totalDays)));
            var yellowRatio = yellowCount / FRUIT_TOTAL;
            return { state: 'RIPENING', label: '成熟中 (' + yellowCount + '/' + FRUIT_TOTAL + ')', fruitCount: FRUIT_TOTAL, yellowCount: yellowCount, yellowRatio: yellowRatio, sproutCount: 0 };
        }
        if (md >= 1006 && md < 1101) {
            return { state: 'RIPE', label: '已熟透', fruitCount: FRUIT_TOTAL, yellowCount: FRUIT_TOTAL, yellowRatio: 1, sproutCount: 0 };
        }
        if (md >= 1101 && md < 1226) {
            var daysSince = getDaysBetween(1101, md);
            var totalDays = getDaysBetween(1101, 1226);
            var remaining = Math.max(0, Math.round(FRUIT_TOTAL * (1 - daysSince / totalDays)));
            return { state: 'FALLING', label: '果实掉落 (' + remaining + '/' + FRUIT_TOTAL + ')', fruitCount: remaining, yellowCount: remaining, yellowRatio: 1, sproutCount: 0 };
        }
        return { state: 'DORMANT', label: '休眠中', fruitCount: 0, yellowCount: 0, yellowRatio: 0, sproutCount: 0 };
    }

    function generateSproutHeartPositions(count, figure, width, height) {
        var positions = [];
        var r = 240;
        var centerX = width / 2;
        var centerY = height / 2 + 30;
        var attempts = 0;
        while (positions.length < count && attempts < 5000) {
            var x = random(centerX - 200, centerX + 200);
            var y = random(centerY - 150, centerY + 150);
            if (inheart(x - centerX, centerY - y, r)) {
                var colors = sproutHeartColors;
                positions.push({
                    x: x,
                    y: y,
                    color: colors[positions.length % colors.length]
                });
            }
            attempts++;
        }
        return positions;
    }

    function updateProgressBar(state) {
        var now = new Date();
        var dayOfYear = getDayOfYear(now.getMonth() + 1, now.getDate());
        var percent = (dayOfYear / 365) * 100;
        $('#progress-bar-fill').css('width', percent + '%');
        $('#progress-bar-thumb').css('left', percent + '%');
        $('#progress-bar-state').text(state.label).css('left', percent + '%');
    }

    updateProgressBar(getTreeState());
    var initialState = getTreeState();
    tree.bloomLimit = initialState.fruitCount;
    tree.ripeMode = initialState.state === 'RIPE' || initialState.state === 'FALLING';
    tree.yellowRatio = initialState.yellowRatio;

    if (initialState.state === 'SPROUTING') {
        var positions = generateSproutHeartPositions(initialState.sproutCount, tree.seed.heart.figure, width, height);
        tree.clearSproutHearts();
        for (var si = 0; si < positions.length; si++) {
            tree.addSproutHeart(new Point(positions[si].x, positions[si].y), 0.22, positions[si].color);
        }
    }

    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        var maxBlooms = tree.bloomLimit;
        var released = 0;
        do {
            var batch = Math.min(2, maxBlooms - released);
            if (batch > 0) {
                tree.flower(batch);
                released += batch;
            }
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower() && released < maxBlooms);
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        tree.snapshot("p1", 240, 0, 610, 680);
        while (tree.move("p1", -20, 0)) {
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
        foot.draw();
        tree.snapshot("p2", -20, 0, 610, 680);

        canvas.parent().css({"background": "url(" + tree.toDataURL('image/png') + ") no-repeat center", "background-color": "#ffc0cb"});
        canvas.css("background", "#ffc0cb");
        $await(Jscex.Async.sleep(300));
        canvas.css("background", "none");
    }));

    var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        var currentState = getTreeState();
        var frameCount = 0;
        while (true) {
            ctx.clearRect(0, 0, width, height);
            tree.jump();
            foot.draw();

            if (currentState.state === 'SPROUTING') {
                tree.drawSproutHearts();
            }

            frameCount++;
            if (frameCount % 40 === 0) {
                var prevState = currentState;
                currentState = getTreeState();
                tree.bloomLimit = currentState.fruitCount;
                tree.ripeMode = currentState.state === 'RIPE' || currentState.state === 'FALLING';
                tree.yellowRatio = currentState.yellowRatio;
                updateProgressBar(currentState);

                if (currentState.state === 'SPROUTING') {
                    if (prevState.state !== 'SPROUTING' || currentState.sproutCount !== prevState.sproutCount) {
                        var positions = generateSproutHeartPositions(currentState.sproutCount, tree.seed.heart.figure, width, height);
                        tree.clearSproutHearts();
                        for (var si = 0; si < positions.length; si++) {
                            tree.addSproutHeart(new Point(positions[si].x, positions[si].y), 0.22, positions[si].color);
                        }
                    }
                } else {
                    if (prevState.state === 'SPROUTING') {
                        tree.clearSproutHearts();
                    }
                }
            }

            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2016, 02, 27);
        together.setHours(0);
        together.setMinutes(0);
        together.setSeconds(0);
        together.setMilliseconds(0);

        var photos = [
        "https://note.youdao.com/yws/api/personal/file/WEB590105f1a9d07ac686e941d38cdad971?method=download&inline=true&shareKey=60cbe361e727d561d2425f3fd26b3cf1",
        "https://note.youdao.com/yws/api/personal/file/WEB726ae6fa64eed5a096d10745a5fc99ac?method=download&inline=true&shareKey=0db2aab9fa92b3d2066a676f7ba3ca31",
            "photos/3.jpg",
            "photos/4.jpg",
            "photos/5.jpg"
        ];

        $("#code").show();
        $("#clock-box").fadeIn(500);

        var photoIndex = 0;
        var $img = $("#current-photo");

        var showPhoto = function() {
            if (photoIndex < photos.length) {
                $img.attr("src", photos[photoIndex]);
                $img.fadeIn(500);
                photoIndex++;
            } else {
                photoIndex = 0;
            }
        };

        showPhoto();
        setInterval(function() {
            $img.fadeOut(500, function() {
                showPhoto();
            });
        }, 3000);

        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();

        $await(jumpAnimate());
    }));

    runAsync().start();
})();

// ===== 爱心储罐数据源 =====
// 1) baba 程序对外只读接口（实时）：https://baba.xtwa.org/public/fund
// 2) 仓库每日快照：./data/fund-history.json（GitHub 工作流每天 04:00 写入，作为兜底 + 增长率来源）
var FUND_API_BASE = 'https://baba.xtwa.org';
var FUND_HISTORY_URL = './data/fund-history.json';

// 版本号取自 index.html 里 main.js 的 ?v=xxx：
// 页面上显示的版本 = 浏览器实际加载的那份 main.js 的版本，可用来确认有没有吃到旧缓存。
var FUND_PAGE_VERSION = (function() {
    var el = document.currentScript || document.querySelector('script[src*="main.js"]');
    var m = el && el.src ? el.src.match(/[?&]v=([^&]+)/) : null;
    return m ? m[1] : '';
})();

$(function() {
    if (FUND_PAGE_VERSION) $('#fund-version').text('v' + FUND_PAGE_VERSION);
});

function proxyApi(path) {
    return FUND_API_BASE + path;
}

var _chartJsLoading = false;

function ensureChartJs(callback) {
    if (typeof Chart !== 'undefined') {
        callback();
        return;
    }
    if (_chartJsLoading) {
        setTimeout(function() { ensureChartJs(callback); }, 500);
        return;
    }
    _chartJsLoading = true;
    var urls = [
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.7/chart.umd.min.js'
    ];
    var tryLoad = function(index) {
        if (index >= urls.length) {
            var container = document.querySelector('.fund-chart-container');
            if (container) {
                container.insertAdjacentHTML('beforeend',
                    '<div class="fund-chart-loading">图表库加载失败，请检查网络连接</div>');
            }
            return;
        }
        var script = document.createElement('script');
        script.src = urls[index];
        script.onload = function() {
            _chartJsLoading = false;
            callback();
        };
        script.onerror = function() {
            tryLoad(index + 1);
        };
        document.head.appendChild(script);
    };
    tryLoad(0);
}

function loadFundData() {
    $('#fund-position-text').text('查询中...').css('color', '');
    $('#fund-update-time').text('');
    $('#fund-chart').hide();

    // 实时接口与仓库每日快照同时请求：实时优先，快照兜底
    var live = null, hist = null, pending = 2;
    var done = function() {
        if (--pending > 0) return;
        renderFundData(live, hist);
    };
    $.ajax({ url: proxyApi('/public/fund'), dataType: 'json', timeout: 10000 })
        .done(function(d) { if (d && d.ok) live = d; })
        .always(done);
    $.ajax({ url: FUND_HISTORY_URL + '?t=' + Date.now(), dataType: 'json', timeout: 10000 })
        .done(function(d) { hist = d; })
        .always(done);
}

// 每日快照去重（同一天只保留最后一条）并按日期升序
function dedupeDaily(list) {
    var out = [], index = {};
    (list || []).forEach(function(d) {
        if (!d || !d.date || d.total == null) return;
        if (index[d.date] != null) { out[index[d.date]] = d; return; }
        index[d.date] = out.length;
        out.push(d);
    });
    out.sort(function(a, b) { return a.date < b.date ? -1 : 1; });
    return out;
}

// 按仓库保存的每日总金额汇总出每月总金额（取当月所有快照的平均值）
function buildMonthlyRecords(daily) {
    var byMonth = {};
    daily.forEach(function(d) {
        if (!d || !d.date || d.total == null) return;
        var m = d.date.slice(0, 7);
        if (!byMonth[m]) byMonth[m] = { sum: 0, count: 0 };
        byMonth[m].sum += Number(d.total);
        byMonth[m].count += 1;
    });
    return Object.keys(byMonth).sort().map(function(m) {
        return { snapshot_month: m, equity: byMonth[m].sum / byMonth[m].count };
    });
}

// 币种名只显示首字母：'空 MRVL / 空 MSTR' -> '空 M / 空 M'
function shortDirections(text) {
    if (!text) return text;
    return String(text).split('/').map(function(part) {
        var s = part.trim();
        if (!s) return s;
        var bits = s.split(/\s+/);
        if (bits.length >= 2) {
            bits[bits.length - 1] = bits[bits.length - 1].charAt(0);
            return bits.join(' ');
        }
        return s.charAt(0);
    }).join(' / ');
}

function renderFundData(live, hist) {
    var snap = live || (hist && hist.current) || null;

    if (!snap) {
        $('#fund-position-text').text('连接失败').css('color', '#ff6b6b');
        $('#fund-total-equity').text('--');
        $('#fund-available-balance').text('--');
        $('#fund-open-count').text('--');
        $('#fund-unrealized-pnl').text('--');
        $('#fund-pnl-ratio').text('--');
        return;
    }

    function num(v) { return v == null ? '--' : Number(v).toFixed(2); }

    // 缓存到页面：其它组件（如蝴蝶）直接读这份数据，不再重复请求接口
    window.__fundSnapshot = snap;

    // 总权益 -> 总金额（接口 total_amount）
    $('#fund-total-equity').text(num(snap.total_amount));
    // 可用余额
    $('#fund-available-balance').text(num(snap.available));
    // 投资数 -> 当前持仓总数（接口 open_count）
    $('#fund-open-count').text(snap.open_count == null ? '--' : snap.open_count);
    // 未实现盈亏
    $('#fund-unrealized-pnl')
        .text(num(snap.unrealized_pnl))
        .css('color', snap.unrealized_pnl == null ? '' : (snap.unrealized_pnl >= 0 ? '#e74c3c' : '#27ae60'));
    // 总盈亏（接口 total_profit_pct）
    $('#fund-pnl-ratio')
        .text(num(snap.total_profit_pct))
        .css('color', snap.total_profit_pct == null ? '' : (snap.total_profit_pct >= 0 ? '#e74c3c' : '#27ae60'));

    // 趋势状态 -> 当前持仓的所有方向（接口 direction_text）
    var pos = snap.positions || [];
    if (snap.open_count > 0 && snap.direction_text) {
        var allShort = pos.length > 0 && pos.every(function(p) { return p.short; });
        $('#fund-position-text').text('投资中 ' + shortDirections(snap.direction_text)).css('color', allShort ? '#27ae60' : '#e74c3c');
    } else {
        $('#fund-position-text').text('🟢 无投资').css('color', '#27ae60');
    }

    if (live && live.time) {
        $('#fund-update-time').text('实时更新于 ' + live.time);
    } else if (hist && hist.updated_at) {
        $('#fund-update-time').text('快照 ' + hist.updated_at);
    }

    // 图表：用仓库保存的每日总金额，前端算出日/月增长率
    var daily = dedupeDaily(hist && hist.daily);
    var records = daily.map(function(d) { return { snapshot_date: d.date, equity: d.total }; });
    var container = $('.fund-chart-container');
    container.find('.fund-chart-loading').remove();

    if (records.length >= 1) {
        ensureChartJs(function() {
            renderFundChart(records, { ok: true, records: buildMonthlyRecords(daily) });
        });
    } else {
        container.append('<div class="fund-chart-loading">暂无快照数据，每天凌晨4点自动生成</div>');
    }
}

function renderFundChart(records, monthlyRecords) {
    try {
        console.log('renderFundChart 开始, 日记录数:', records.length, '月记录数:', monthlyRecords ? monthlyRecords.records.length : 0);

        var dailyData = records.slice();
        var monthlyData = monthlyRecords && monthlyRecords.ok ? monthlyRecords.records : [];

        // ===== 格式化日期辅助函数 =====
        function formatDate(dateStr) {
            if (!dateStr) return '--';
            var parts = dateStr.split('-');
            if (parts.length >= 3) {
                return parseInt(parts[1]) + '/' + parseInt(parts[2]);
            }
            return dateStr;
        }

        // ===== 计算日增长率（后端不返回，前端根据 equity 计算）=====
        for (var di = dailyData.length - 1; di >= 0; di--) {
            if (di === 0) {
                dailyData[di].daily_growth_rate = 0;
            } else {
                var prevEq = dailyData[di - 1].equity;
                var currEq = dailyData[di].equity;
                dailyData[di].daily_growth_rate = prevEq !== 0 ? ((currEq - prevEq) / prevEq) * 100 : 0;
            }
        }

        // ===== 计算月增长率 ====
        for (var mi = monthlyData.length - 1; mi >= 0; mi--) {
            if (mi === 0) {
                monthlyData[mi].monthly_growth_rate = 0;
            } else {
                var prevEq = monthlyData[mi - 1].equity;
                var currEq = monthlyData[mi].equity;
                monthlyData[mi].monthly_growth_rate = prevEq !== 0 ? ((currEq - prevEq) / prevEq) * 100 : 0;
            }
        }

        // ===== 组装 14 个分类：前 7 个为“近7天”，后 7 个为“近7个月” =====
        // 每个分类下并排两根柱子：增长率柱 + 金额柱
        // 竖轴单位：1 金币 / 1%，两者共用同一根竖轴
        var labels = [];
        var growthValues = [];   // 带符号的增长率(%)，用于柱顶文字
        var growthData = [];     // 柱形高度按绝对值绘制
        var totalValues = [];    // 当日总额 / 当月平均总额(金币)

        // ===== 第1部分: 近7天 (索引 0-6) =====
        var dayCount = Math.min(7, dailyData.length);
        var startIndex = dailyData.length - dayCount;

        for (var i = 0; i < 7; i++) {
            if (i < dayCount) {
                var current = dailyData[startIndex + i];
                var dailyVal = parseFloat((current.daily_growth_rate || 0).toFixed(2));
                var dayTotal = current.equity == null ? null : Number(current.equity);

                labels.push(formatDate(current.snapshot_date));
                growthValues.push(dailyVal);
                growthData.push(Math.abs(dailyVal));
                totalValues.push(dayTotal);
            } else {
                labels.push('--');
                growthValues.push(null);
                growthData.push(null);
                totalValues.push(null);
            }
        }

        // ===== 第2部分: 近7个月 (索引 7-13) =====
        var monthCount = Math.min(7, monthlyData.length);
        for (var j = 0; j < 7; j++) {
            if (j < monthCount) {
                var currentMonth = monthlyData[j];
                var monthlyVal = parseFloat((currentMonth.monthly_growth_rate || 0).toFixed(2));
                var monthTotal = currentMonth.equity == null ? null : Number(currentMonth.equity);
                var monthLabel = currentMonth.snapshot_month ? parseInt(currentMonth.snapshot_month.slice(5)) + '月' : '--';

                labels.push(monthLabel);
                growthValues.push(monthlyVal);
                growthData.push(Math.abs(monthlyVal));
                totalValues.push(monthTotal);
            } else {
                labels.push('--');
                growthValues.push(null);
                growthData.push(null);
                totalValues.push(null);
            }
        }

        console.log('图表标签:', labels);
        console.log('增长率(%):', growthValues);
        console.log('金额(金币):', totalValues);

        var canvas = document.getElementById('fund-chart');
        console.log('Canvas元素:', canvas);
        if (!canvas) {
            console.error('Canvas元素未找到!');
            return;
        }

        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        canvas.style.width = canvas.offsetWidth + 'px';
        canvas.style.height = canvas.offsetHeight + 'px';

        var ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Canvas上下文获取失败!');
            return;
        }

        if (window.fundChart) {
            window.fundChart.destroy();
        }

        console.log('Chart对象可用:', typeof Chart);

        // 依据柱子宽度自适应字号：文字宽度随柱子一起缩放
        // 视口放大/缩小时柱子会变宽/变窄，字号同步变化才能保证数值的显示宽度始终等于柱宽
        function fitLabelFont(ctx, text, barWidth, baseSize) {
            var size = baseSize;
            if (barWidth && barWidth > 0) {
                ctx.font = 'bold ' + baseSize + 'px 微软雅黑';
                var w = ctx.measureText(text).width;
                if (w > 0) {
                    // 目标：文字宽度约为柱宽的 90%，柱子越细字号越小
                    size = baseSize * (barWidth * 0.9) / w;
                }
            }
            // 下限 7px 保证小视口下仍可辨认，超出柱宽的部分交给 fillText 的 maxWidth 压缩
            size = Math.max(7, Math.min(22, size));
            ctx.font = 'bold ' + size.toFixed(1) + 'px 微软雅黑';
            return size;
        }

        // 柱形上方显示各自数值的自定义插件：增长率柱显示百分比，金额柱显示金额
        var datalabelsPlugin = {
            id: 'datalabels',
            afterDatasetsDraw: function(chart) {
                var ctx = chart.ctx;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                chart.data.datasets.forEach(function(dataset, dsIndex) {
                    var meta = chart.getDatasetMeta(dsIndex);
                    if (!meta || !meta.data) return;

                    meta.data.forEach(function(bar, index) {
                        var text, color, baseSize;
                        if (dsIndex === 0) {
                            // 增长率柱：显示带符号百分比
                            var gv = growthValues[index];
                            if (gv === null || gv === undefined) return;
                            text = gv.toFixed(2) + '%';
                            color = gv >= 0 ? '#e74c3c' : '#27ae60';
                            baseSize = 11;
                        } else if (dsIndex === 1) {
                            // 金额柱：显示实际金额(金币)，下降时文字同步转灰
                            var tv = totalValues[index];
                            if (tv === null || tv === undefined) return;
                            text = tv.toFixed(2);
                            color = isTotalDown(index) ? '#7f8c8d' : '#2980b9';
                            baseSize = 10;
                        } else {
                            return;
                        }
                        ctx.fillStyle = color;
                        // 字号随柱子宽度缩放，使数值的显示宽度与柱子保持一致
                        var fontSize = fitLabelFont(ctx, text, bar.width, baseSize);
                        // 柱形按绝对值向上绘制，数值标签显示在柱顶
                        var labelY = bar.y - Math.max(3, fontSize * 0.35);
                        if (bar.width > 0) {
                            // maxWidth 兜底：柱子再细也不会让数值超出柱宽
                            ctx.fillText(text, bar.x, labelY, bar.width);
                        } else {
                            ctx.fillText(text, bar.x, labelY);
                        }
                    });
                });

                ctx.restore();
            }
        };

        // 分隔线和分区标签插件（含自定义刻度标签绘制）
        var sectionPlugin = {
            id: 'sectionLabels',
            afterDraw: function(chart) {
                var ctx = chart.ctx;
                var chartArea = chart.chartArea;
                var xScale = chart.scales.x;

                if (!xScale || !chartArea) return;

                // 计算第7根和第8根柱子中间的X坐标
                var separatorX = (xScale.getPixelForValue(6) + xScale.getPixelForValue(7)) / 2;
                if (!separatorX) return;

                ctx.save();

                // 绘制垂直虚线分隔线
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(separatorX, chartArea.top);
                ctx.lineTo(separatorX, chartArea.bottom);
                ctx.stroke();
                ctx.setLineDash([]);

                // 手动绘制 x 轴刻度标签（隐藏默认刻度，每个分类居中于一对柱子下方）
                var labels = chart.data.labels;
                ctx.font = '10px 微软雅黑';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#666';
                var tickY = chartArea.bottom + 6;

                for (var i = 0; i < labels.length; i++) {
                    ctx.textAlign = 'center';
                    ctx.fillText(labels[i], xScale.getPixelForValue(i), tickY);
                }

                // 计算"近7天"标签位置（第1-7根柱子中间）
                var dayStartX = xScale.getPixelForValue(0);
                var dayEndX = xScale.getPixelForValue(6);
                var dayCenterX = dayStartX + (dayEndX - dayStartX) / 2;

                // 计算"近7个月"标签位置（第8-14根柱子中间）
                var monthStartX = xScale.getPixelForValue(7);
                var monthEndX = xScale.getPixelForValue(13);
                var monthCenterX = monthStartX + (monthEndX - monthStartX) / 2;

                // 在X轴下方绘制分区标签
                var labelY = chartArea.bottom + 30;
                ctx.font = 'bold 12px 微软雅黑';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#666';
                ctx.fillText('— 近7天 —', dayCenterX, labelY);
                ctx.fillText('— 近7个月均值 —', monthCenterX, labelY);

                ctx.restore();
            }
        };

        // 金额柱使用斜纹填充，与实心的增长率柱形成明显的样式区别
        // 蓝色：现期数值不低于基期；灰色：现期数值比基期下降
        function makeStripePattern(fill, stroke) {
            var pc = document.createElement('canvas');
            pc.width = 8;
            pc.height = 8;
            var pctx = pc.getContext('2d');
            pctx.fillStyle = fill;
            pctx.fillRect(0, 0, 8, 8);
            pctx.strokeStyle = stroke;
            pctx.lineWidth = 2;
            pctx.beginPath();
            pctx.moveTo(-2, 2); pctx.lineTo(2, -2);
            pctx.moveTo(0, 8); pctx.lineTo(8, 0);
            pctx.moveTo(6, 10); pctx.lineTo(10, 6);
            pctx.stroke();
            return ctx.createPattern(pc, 'repeat');
        }
        var totalPatternUp = makeStripePattern('rgba(52, 152, 219, 0.5)', 'rgba(41, 128, 185, 0.9)');
        var totalPatternDown = makeStripePattern('rgba(160, 160, 160, 0.45)', 'rgba(110, 110, 110, 0.9)');

        // 现期金额是否比基期下降（基期取上一个周期，即增长率为负）
        function isTotalDown(index) {
            var gv = growthValues[index];
            return gv !== null && gv !== undefined && gv < 0;
        }

        window.fundChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '增长率 (%)',
                        data: growthData,
                        backgroundColor: growthValues.map(function(v) {
                            return v === null ? 'transparent' : (v >= 0 ? 'rgba(231, 76, 60, 0.85)' : 'rgba(39, 174, 96, 0.85)');
                        }),
                        borderColor: growthValues.map(function(v) {
                            return v === null ? 'transparent' : (v >= 0 ? 'rgb(231, 76, 60)' : 'rgb(39, 174, 96)');
                        }),
                        borderWidth: 1,
                        borderRadius: 3,
                        // 同一分类下两根柱子紧挨着，不留缝隙
                        categoryPercentage: 0.5,
                        barPercentage: 1.0,
                    },
                    {
                        label: '金额 (金币)',
                        data: totalValues,
                        backgroundColor: totalValues.map(function(v, idx) {
                            if (v === null || v === undefined) return 'transparent';
                            return isTotalDown(idx) ? totalPatternDown : totalPatternUp;
                        }),
                        borderColor: totalValues.map(function(v, idx) {
                            if (v === null || v === undefined) return 'transparent';
                            return isTotalDown(idx) ? 'rgba(110, 110, 110, 0.9)' : 'rgba(41, 128, 185, 0.9)';
                        }),
                        borderWidth: 1,
                        borderRadius: 3,
                        categoryPercentage: 0.5,
                        barPercentage: 1.0,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 800 },
                layout: {
                    // 底部留白要够：下面还要画 x 轴刻度(约 +6px) 和「— 近7天 —」分区标签(约 +30px)
                    padding: { bottom: 56 }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: { size: 13, family: '微软雅黑' },
                            padding: 15,
                            usePointStyle: true,
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var idx = context.dataIndex;
                                if (context.datasetIndex === 0) {
                                    var gv = growthValues[idx];
                                    if (gv === null || gv === undefined) return '增长率: N/A';
                                    return '增长率: ' + gv.toFixed(2) + '%';
                                }
                                var tv = totalValues[idx];
                                if (tv === null || tv === undefined) return '金额: N/A';
                                var prefix = idx >= 7 ? '月均值: ' : '金额: ';
                                return prefix + tv.toFixed(2) + ' 金币';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            display: false
                        }
                    },
                    y: {
                        // 左竖轴单位：1 金币 / 1%；金额最高 100 金币，增长率最高 100%
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        title: {
                            display: true,
                            text: '增长率(%) / 金额(金币)',
                            color: '#666',
                            font: { size: 11, family: '微软雅黑' }
                        },
                        ticks: {
                            stepSize: 10,
                            font: { size: 12, family: '微软雅黑' }
                        }
                    }
                }
            },
            plugins: [datalabelsPlugin, sectionPlugin]
        });

        console.log('图表创建成功');
        $('#fund-chart').show();

    } catch (e) {
        console.error('柱形图渲染失败:', e);
        var container = $('.fund-chart-container');
        container.find('.fund-chart-loading').remove();
        container.append('<div class="fund-chart-loading">图表加载失败: ' + e.message + '</div>');
    }
}

$(document).on('click', '#fund-refresh-btn', function() {
    loadFundData();
});
