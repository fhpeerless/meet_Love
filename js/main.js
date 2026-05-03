$(function() {
    var $animationBtn = $('#animation-btn');
    var $diaryBtn = $('#diary-btn');
    var $musicBtn = $('#music-btn');
    var $main = $('#main');
    var $diarySection = $('#diary-section');
    var $diaryEntries = $('#diary-entries');
    var $musicSection = $('#music-section');

    function initTitleAnimation() {
        var titleText = "没有在等什么，但我的心开始慢慢飘落...";
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

    $musicBtn.click(function() {
        $animationBtn.removeClass('active');
        $diaryBtn.removeClass('active');
        $(this).addClass('active');
        $main.hide();
        $diarySection.hide();
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
                
                entryHtml += '</div>';
                $diaryEntries.append(entryHtml);
            });

            $diaryEntries.off('click', '.diary-play-btn').on('click', '.diary-play-btn', function() {
                var songId = $(this).data('song-id');
                if (musicPlayer && songId) {
                    musicPlayer.loadSongById(songId);
                }
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
        $main.show();
        $diarySection.hide();
        $musicSection.hide();

        $('#desktop-lyrics').removeClass('desktop-lyrics-show');
    });

    $diaryBtn.click(function() {
        $(this).addClass('active');
        $animationBtn.removeClass('active');
        $musicBtn.removeClass('active');
        $main.hide();
        $diarySection.show();
        $musicSection.hide();
        
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
