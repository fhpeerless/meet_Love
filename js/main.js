$(function() {
    var $animationBtn = $('#animation-btn');
    var $diaryBtn = $('#diary-btn');
    var $musicBtn = $('#music-btn');
    var $main = $('#main');
    var $diarySection = $('#diary-section');
    var $diaryEntries = $('#diary-entries');
    var $musicSection = $('#music-section');

    function initTitleAnimation() {
        var titleText = "不知道再等谁，但我的心依然慢慢凋落了......";
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
    });

    function loadDiary() {
        $.getJSON('config/diary.json', function(data) {
            $diaryEntries.empty();
            $.each(data, function(index, entry) {
                var entryHtml = '<div class="diary-entry">' +
                    '<h3>' + entry.date + '</h3>' +
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
    });

    $diaryBtn.click(function() {
        $(this).addClass('active');
        $animationBtn.removeClass('active');
        $musicBtn.removeClass('active');
        $main.hide();
        $diarySection.show();
        $musicSection.hide();
        
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

    var textChars = "请和我交往吧".split("");
    var fallingDOMTexts = [];
    var textSpawnTimer = 0;
    var currentCharIndex = 0;
    var container = document.getElementById('falling-texts-container');

    function startFallingTexts() {
        setInterval(function() {
            textSpawnTimer++;
            if (textSpawnTimer >= 30) {
                textSpawnTimer = 0;
                var charIndex = currentCharIndex;
                currentCharIndex = (currentCharIndex + 1) % textChars.length;
                
                var textEl = document.createElement('div');
                textEl.className = 'falling-text';
                textEl.textContent = textChars[charIndex];
                
                var positions = [];
                for (var i = 0; i < textChars.length; i++) {
                    positions.push((window.innerWidth / (textChars.length + 1)) * (i + 1));
                }
                var baseX = positions[charIndex];
                var x = baseX + (Math.random() - 0.5) * 80;
                var y = -100 - Math.random() * 50;
                var speedY = 1.5 + Math.random() * 1.5;
                var speedX = (Math.random() - 0.5) * 0.3;
                var rotation = (Math.random() - 0.5) * 0.3;
                var rotationSpeed = (Math.random() - 0.5) * 0.02;
                
                textEl.style.left = x + 'px';
                textEl.style.top = y + 'px';
                
                container.appendChild(textEl);
                
                fallingDOMTexts.push({
                    element: textEl,
                    x: x,
                    y: y,
                    speedY: speedY,
                    speedX: speedX,
                    rotation: rotation,
                    rotationSpeed: rotationSpeed
                });
            }
            
            for (var i = fallingDOMTexts.length - 1; i >= 0; i--) {
                var ft = fallingDOMTexts[i];
                ft.y += ft.speedY;
                ft.x += ft.speedX;
                ft.rotation += ft.rotationSpeed;
                
                ft.element.style.top = ft.y + 'px';
                ft.element.style.left = ft.x + 'px';
                ft.element.style.transform = 'rotate(' + ft.rotation + 'rad)';
                
                if (ft.y > window.innerHeight + 100) {
                    ft.element.remove();
                    fallingDOMTexts.splice(i, 1);
                }
            }
        }, 25);
    }

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
            num: 700,
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
        do {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        tree.snapshot("p1", 240, 0, 610, 680);
        while (tree.move("p1", -50, 0)) {
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
        foot.draw();
        tree.snapshot("p2", -50, 0, 610, 680);

        canvas.parent().css("background", "url(" + tree.toDataURL('image/png') + ")");
        canvas.css("background", "#ffc0cb");
        $await(Jscex.Async.sleep(300));
        canvas.css("background", "none");
    }));

    var jumpAnimate = eval(Jscex.compile("async", function () {
        var ctx = tree.ctx;
        var frameCount = 0;
        var showHeartPhotos = false;
        while (true) {
            tree.ctx.clearRect(0, 0, width, height);
            tree.jump();
            foot.draw();
            
            frameCount++;
            if (frameCount > 100 && !showHeartPhotos) {
                showHeartPhotos = true;
            }
            
            if (showHeartPhotos && window.fallingImages) {
                tree.drawHeartPhotos(window.fallingImages);
            }
            
            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2026, 02, 27);
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
        startFallingTexts();

        $await(jumpAnimate());
    }));

    runAsync().start();
})();
