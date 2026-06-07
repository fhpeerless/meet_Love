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
        $.ajax({ url: proxyApi('/api/records?limit=7'), dataType: 'json', timeout: 15000 }),
        $.ajax({ url: proxyApi('/api/monthly-records?limit=7'), dataType: 'json', timeout: 15000 })
    ).done(function(statusRes, recordsRes, monthlyRes) {
        var statusData = statusRes[0];
        var recordsData = recordsRes[0];
        var monthlyData = monthlyRes[0];

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
            var sideText = statusData.position_side === 'long' ? '方向多' : '方向空';
            $('#fund-position-text').text('投资中 ' + sideText + ' | ' + statusData.leverage + '倍速');
            $('#fund-position-text').css('color', statusData.position_side === 'long' ? '#e74c3c' : '#27ae60');
        } else {
            $('#fund-position-text').text('🟢 无投资');
            $('#fund-position-text').css('color', '#27ae60');
        }

        if (statusData.timestamp) {
            $('#fund-update-time').text('更新于 ' + formatTime(statusData.timestamp));
        }

        if (recordsData && recordsData.ok && recordsData.records && recordsData.records.length >= 1) {
            console.log('API返回日记录:', JSON.stringify(recordsData.records));
            console.log('API返回月记录:', JSON.stringify(monthlyData));
            ensureChartJs(function() {
                renderFundChart(recordsData.records, monthlyData);
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

        // ===== 第1部分: 近7天日增长率 (索引 0-6) =====
        var labels = ['近7天', '', '', '', '', '', ''];
        var dailyGrowthValues = [];
        var dailyGrowthData = [];
        var monthlyGrowthValues = [];
        var monthlyGrowthData = [];

        var barCount = Math.min(7, dailyData.length);
        var startIndex = dailyData.length - barCount;

        for (var i = 0; i < 7; i++) {
            if (i < barCount) {
                var dataIndex = startIndex + i;
                var current = dailyData[dataIndex];
                labels[i] = formatDate(current.snapshot_date);

                // 直接使用后端预计算的日增长率
                var dailyVal = parseFloat((current.daily_growth_rate || 0).toFixed(2));
                dailyGrowthValues.push(dailyVal);
                dailyGrowthData.push(Math.abs(dailyVal));

                // 月数据集对应位置填null（不显示柱子）
                monthlyGrowthValues.push(null);
                monthlyGrowthData.push(null);
            } else {
                labels[i] = '--';
                dailyGrowthValues.push(0);
                dailyGrowthData.push(0);
                monthlyGrowthValues.push(null);
                monthlyGrowthData.push(null);
            }
        }

        // ===== 第2部分: 近7月月增长率 (索引 7-13) =====
        var monthCount = Math.min(7, monthlyData.length);
        for (var i = 0; i < 7; i++) {
            if (i < monthCount) {
                var currentMonth = monthlyData[i];
                var monthLabel = (currentMonth.snapshot_month ? parseInt(currentMonth.snapshot_month.slice(5)) + '月' : '--');
                labels.push(monthLabel);

                // 日数据集对应位置填null（不显示柱子）
                dailyGrowthValues.push(null);
                dailyGrowthData.push(null);

                // 直接使用后端预计算的月增长率
                var monthlyVal = parseFloat((currentMonth.monthly_growth_rate || 0).toFixed(2));
                monthlyGrowthValues.push(monthlyVal);
                monthlyGrowthData.push(Math.abs(monthlyVal));
            } else {
                labels.push('--');
                dailyGrowthValues.push(null);
                dailyGrowthData.push(null);
                monthlyGrowthValues.push(0);
                monthlyGrowthData.push(0);
            }
        }

        console.log('图表标签:', labels);
        console.log('日增长率:', dailyGrowthValues);
        console.log('月增长率:', monthlyGrowthValues);

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

        // 柱形上方显示实际带符号数值的自定义插件
        var datalabelsPlugin = {
            id: 'datalabels',
            afterDatasetsDraw: function(chart) {
                var ctx = chart.ctx;
                ctx.save();
                ctx.font = 'bold 11px 微软雅黑';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                chart.data.datasets.forEach(function(dataset, dsIndex) {
                    var meta = chart.getDatasetMeta(dsIndex);
                    if (!meta || !meta.data) return;

                    // 获取原始带符号的值
                    var values;
                    if (dsIndex === 0) {
                        values = dailyGrowthValues;
                    } else if (dsIndex === 1) {
                        values = monthlyGrowthValues;
                    } else {
                        return;
                    }

                    meta.data.forEach(function(bar, index) {
                        if (values[index] === undefined || values[index] === null) return;
                        var displayVal = values[index];
                        // 柱形图按绝对值绘制，数值标签显示在柱顶
                        var barTop = bar.y;
                        var color = displayVal >= 0 ? '#e74c3c' : '#27ae60';
                        ctx.fillStyle = color;
                        ctx.fillText(displayVal.toFixed(2) + '%', bar.x, barTop - 4);
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

                // 手动绘制 x 轴刻度标签（隐藏默认刻度，自定义绘制以精确对齐每个柱形）
                var labels = chart.data.labels;
                ctx.font = '10px 微软雅黑';
                ctx.textBaseline = 'top';
                ctx.fillStyle = '#666';
                var tickY = chartArea.bottom + 6;

                // 计算柱形在分组中的偏移量
                // 在 grouped bar 中，dataset 0（日）在左边，dataset 1（月）在右边
                var catWidth = xScale.getPixelForValue(1) - xScale.getPixelForValue(0);
                // categoryPercentage 默认 0.8，barPercentage=0.4
                var barOffset = catWidth * 0.8 / 4; // 分组宽度的一半再一半

                for (var i = 0; i < labels.length; i++) {
                    var x = xScale.getPixelForValue(i);
                    // 前7个（日增长率）对应 dataset 0，在分组左侧
                    if (i < 7) {
                        x -= barOffset;
                    } else {
                        // 后7个（月增长率）对应 dataset 1，在分组右侧
                        x += barOffset;
                    }
                    ctx.textAlign = 'center';
                    ctx.fillText(labels[i], x, tickY);
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
                ctx.fillText('— 近7个月 —', monthCenterX, labelY);

                ctx.restore();
            }
        };

        window.fundChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '日变化量 (%)',
                        data: dailyGrowthData,
                        backgroundColor: dailyGrowthValues.map(function(v) {
                            return v === null ? 'transparent' : (v >= 0 ? 'rgba(231, 76, 60, 0.8)' : 'rgba(39, 174, 96, 0.8)');
                        }),
                        borderColor: dailyGrowthValues.map(function(v) {
                            return v === null ? 'transparent' : (v >= 0 ? 'rgb(231, 76, 60)' : 'rgb(39, 174, 96)');
                        }),
                        borderWidth: 1,
                        borderRadius: 2,
                        barPercentage: 0.4,
                    },
                    {
                        label: '月变化量 (%)',
                        data: monthlyGrowthData,
                        backgroundColor: monthlyGrowthValues.map(function(v) {
                            return v === null ? 'transparent' : (v >= 0 ? 'rgba(231, 76, 60, 0.45)' : 'rgba(39, 174, 96, 0.45)');
                        }),
                        borderColor: monthlyGrowthValues.map(function(v) {
                            return v === null ? 'transparent' : (v >= 0 ? 'rgba(231, 76, 60, 0.9)' : 'rgba(39, 174, 96, 0.9)');
                        }),
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
                layout: {
                    padding: { bottom: 30 }
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
                                var dsIndex = context.datasetIndex;
                                var idx = context.dataIndex;
                                var valuesArr = dsIndex === 0 ? dailyGrowthValues : monthlyGrowthValues;
                                var val = valuesArr ? valuesArr[idx] : context.raw;
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
                            display: false
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0,0,0,0.06)' },
                        ticks: {
                            stepSize: 5,
                            font: { size: 12, family: '微软雅黑' },
                            callback: function(value) { return value.toFixed(0) + '%'; }
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
