$(function() {
    var $animationBtn = $('#animation-btn');
    var $diaryBtn = $('#diary-btn');
    var $musicBtn = $('#music-btn');
    var $main = $('#main');
    var $diarySection = $('#diary-section');
    var $diaryEntries = $('#diary-entries');
    var $musicSection = $('#music-section');

    function initTitleAnimation() {
        var titleText = "人间四季轮番流转，初心炽热始终未改，只是繁华落尽，只剩孤单与清欢...";
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

var FUND_API_BASE = 'https://api.xtwa.org';

function proxyApi(path) {
    return FUND_API_BASE + path;
}

function formatTime(ts) {
    var d = new Date(ts * 1000);
    var pad = function(n) { return n < 10 ? '0' + n : n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
           pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
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
    $('#fund-position-text').text('查询中...');
    $('#fund-update-time').text('');
    $('#fund-chart').hide();

    $.when(
        $.ajax({ url: proxyApi('/api/status'), dataType: 'json', timeout: 15000 }),
        $.ajax({ url: proxyApi('/api/records?limit=37'), dataType: 'json', timeout: 15000 })
    ).done(function(statusRes, recordsRes) {
        var statusData = statusRes[0];
        var recordsData = recordsRes[0];

        if (!statusData || !statusData.ok) {
            $('#fund-position-text').text('获取失败').css('color', '#ff6b6b');
            return;
        }

        $('#fund-total-equity').text(statusData.total_equity != null ? statusData.total_equity.toFixed(2) : '--');
        $('#fund-available-balance').text(statusData.available_balance != null ? statusData.available_balance.toFixed(2) : '--');
        $('#fund-frozen-balance').text(statusData.frozen_balance != null ? statusData.frozen_balance.toFixed(2) : '--');
        $('#fund-unrealized-pnl').text(statusData.unrealized_pnl != null ? statusData.unrealized_pnl.toFixed(2) : '--');

        var pnlEl = $('#fund-unrealized-pnl');
        if (statusData.unrealized_pnl != null) {
            pnlEl.css('color', statusData.unrealized_pnl >= 0 ? '#e74c3c' : '#27ae60');
        }

        var ratioEl = $('#fund-pnl-ratio');
        if (statusData.pnl_ratio_percent != null) {
            ratioEl.text(statusData.pnl_ratio_percent.toFixed(2));
            ratioEl.css('color', statusData.pnl_ratio_percent >= 0 ? '#e74c3c' : '#27ae60');
        } else {
            ratioEl.text('--');
        }

        if (statusData.has_position) {
            var sideText = statusData.position_side === 'long' ? '📈 做多' : '📉 做空';
            $('#fund-position-text').text(sideText + ' ' + statusData.instrument_id + ' | 杠杆' + statusData.leverage + 'x');
            $('#fund-position-text').css('color', statusData.position_side === 'long' ? '#e74c3c' : '#27ae60');
        } else {
            $('#fund-position-text').text('🟢 无投资');
            $('#fund-position-text').css('color', '#27ae60');
        }

        if (statusData.timestamp) {
            $('#fund-update-time').text('更新于 ' + formatTime(statusData.timestamp));
        }

        if (recordsData && recordsData.ok && recordsData.records && recordsData.records.length >= 1) {
            console.log('API返回记录:', JSON.stringify(recordsData.records));
            ensureChartJs(function() {
                renderFundChart(recordsData.records);
            });
        } else {
            var container = $('.fund-chart-container');
            container.find('.fund-chart-loading').remove();
            container.append('<div class="fund-chart-loading">暂无快照数据，明天凌晨4点自动生成</div>');
        }
    }).fail(function() {
        $('#fund-position-text').text('连接失败').css('color', '#ff6b6b');
        $('#fund-total-equity').text('--');
        $('#fund-available-balance').text('--');
        $('#fund-frozen-balance').text('--');
        $('#fund-unrealized-pnl').text('--');
        $('#fund-pnl-ratio').text('--');
    });
}

function renderFundChart(records) {
    try {
        console.log('renderFundChart 开始, records数量:', records.length);

        var data = records.slice();
        console.log('data(最早在前):', JSON.stringify(data));

        var barCount = Math.min(7, data.length);
        console.log('barCount:', barCount);

        // 取最后7条记录（最近7天），数据是"最早在前"排列
        var startIndex = data.length - barCount;

        var labels = [];
        var dailyGrowthData = [];
        var monthlyGrowthData = [];

        for (var i = 0; i < 7; i++) {
            if (i < barCount) {
                var dataIndex = startIndex + i;
                var current = data[dataIndex];
                labels.push(current.snapshot_date ? current.snapshot_date.slice(5) : '--');

                // 日增长率：与前一天比较
                if (dataIndex > 0) {
                    var prev = data[dataIndex - 1];
                    if (prev && prev.available_balance != null && prev.available_balance !== 0) {
                        var dailyRate = ((current.available_balance - prev.available_balance) / prev.available_balance) * 100;
                        dailyGrowthData.push(parseFloat(dailyRate.toFixed(2)));
                    } else {
                        dailyGrowthData.push(0);
                    }
                } else {
                    dailyGrowthData.push(0);
                }

                // 月增长率：与30天前的记录比较
                var monthlyIndex = dataIndex - 30;
                var monthlyRecord = monthlyIndex >= 0 ? data[monthlyIndex] : null;
                if (monthlyRecord && monthlyRecord.available_balance != null && monthlyRecord.available_balance !== 0) {
                    var monthlyRate = ((current.available_balance - monthlyRecord.available_balance) / monthlyRecord.available_balance) * 100;
                    monthlyGrowthData.push(parseFloat(monthlyRate.toFixed(2)));
                } else {
                    monthlyGrowthData.push(0);
                }
            } else {
                labels.push('--');
                dailyGrowthData.push(0);
                monthlyGrowthData.push(0);
            }
        }

        console.log('图表数据:', { labels: labels, daily: dailyGrowthData, monthly: monthlyGrowthData });

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

        window.fundChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '日增长率 (%)',
                        data: dailyGrowthData,
                        backgroundColor: dailyGrowthData.map(function(v) {
                            return v >= 0 ? 'rgba(231, 76, 60, 0.8)' : 'rgba(39, 174, 96, 0.8)';
                        }),
                        borderColor: dailyGrowthData.map(function(v) {
                            return v >= 0 ? 'rgb(231, 76, 60)' : 'rgb(39, 174, 96)';
                        }),
                        borderWidth: 1,
                        borderRadius: 2,
                        barPercentage: 0.4,
                    },
                    {
                        label: '月增长率 (%)',
                        data: monthlyGrowthData,
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgb(52, 152, 219)',
                        borderWidth: 1,
                        borderRadius: 2,
                        barPercentage: 0.4,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 800 },
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
                                var val = context.raw;
                                if (val === null || val === undefined) return context.dataset.label + ': N/A';
                                return context.dataset.label + ': ' + val.toFixed(2) + '%';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 12, family: '微软雅黑' }
                        }
                    },
                    y: {
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        ticks: {
                            font: { size: 12, family: '微软雅黑' },
                            callback: function(value) { return value.toFixed(1) + '%'; }
                        }
                    }
                }
            }
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
