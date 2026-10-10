(function() {
    var context;
    var arr = new Array();
    var starCount = 34;
    var rains = new Array();
    var rainCount = 20;
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;

    function init() {
        var stars = document.getElementById("stars-bg");
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;
        stars.width = windowWidth;
        stars.height = windowHeight;
        context = stars.getContext("2d");
    }

    var Star = function() {
        this.x = windowWidth * Math.random();
        this.y = windowHeight * Math.random();
        this.text = "❤";
        this.color = "#ea80b0";

        this.getColor = function() {
            var _r = Math.random();
            if (_r < 0.5) {
                this.color = "#333";
            } else {
                this.color = "#ea80b0";
            }
        };

        this.init = function() {
            this.getColor();
        };

        this.draw = function() {
            context.fillStyle = this.color;
            context.fillText(this.text, this.x, this.y);
        };
    };

    var MeteorRain = function() {
        this.x = -1;
        this.y = -1;
        this.length = -1;
        this.angle = 30;
        this.width = -1;
        this.height = -1;
        this.speed = 1;
        this.offset_x = -1;
        this.offset_y = -1;
        this.alpha = 1;
        this.color1 = "#ea80b0";
        this.color2 = "";

        this.init = function() {
            this.getPos();
            this.alpha = 1;
            this.getRandomColor();
            var x = Math.random() * 80 + 150;
            this.length = Math.ceil(x);
            this.angle = 30;
            x = Math.random() + 0.5;
            this.speed = Math.ceil(x);
            var cos = Math.cos(this.angle * 3.14 / 180);
            var sin = Math.sin(this.angle * 3.14 / 180);
            this.width = this.length * cos;
            this.height = this.length * sin;
            this.offset_x = this.speed * cos;
            this.offset_y = this.speed * sin;
        };

        this.getRandomColor = function() {
            var a = Math.ceil(255 - 240 * Math.random());
            this.color1 = "rgba(" + a + "," + a + "," + a + ",1)";
            this.color2 = "black";
        };

        this.countPos = function() {
            this.x = this.x - this.offset_x;
            this.y = this.y + this.offset_y;
        };

        this.getPos = function() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
        };

        this.draw = function() {
            context.save();
            context.beginPath();
            context.lineWidth = 1;
            context.globalAlpha = this.alpha;
            var line = context.createLinearGradient(
                this.x, this.y,
                this.x + this.width,
                this.y - this.height
            );
            line.addColorStop(0, "#ea80b0");
            line.addColorStop(0.3, this.color1);
            line.addColorStop(0.6, this.color2);
            context.strokeStyle = line;
            context.moveTo(this.x, this.y);
            context.lineTo(this.x + this.width, this.y - this.height);
            context.closePath();
            context.stroke();
            context.restore();
        };

        this.move = function() {
            var x = this.x + this.width - this.offset_x;
            var y = this.y - this.height;
            context.clearRect(x - 3, y - 3, this.offset_x + 5, this.offset_y + 5);
            this.countPos();
            this.alpha -= 0.002;
            this.draw();
        };
    };

    function playStars() {
        for (var n = 0; n < starCount; n++) {
            arr[n].getColor();
            arr[n].draw();
        }
        setTimeout(playStars, 100);
    }

    function playRains() {
        for (var n = 0; n < rainCount; n++) {
            var rain = rains[n];
            rain.move();
            if (rain.y > window.innerHeight) {
                context.clearRect(rain.x, rain.y - rain.height, rain.width, rain.height);
                rains[n] = new MeteorRain();
                rains[n].init();
            }
        }
        setTimeout(playRains, 2);
    }

    function startBackground() {
        init();

        for (var i = 0; i < starCount; i++) {
            var star = new Star();
            star.init();
            star.draw();
            arr.push(star);
        }

        for (var i = 0; i < rainCount; i++) {
            var rain = new MeteorRain();
            rain.init();
            rain.draw();
            rains.push(rain);
        }

        playStars();
        playRains();
    }

    window.addEventListener('resize', function() {
        init();
        arr = [];
        rains = [];

        for (var i = 0; i < starCount; i++) {
            var star = new Star();
            star.init();
            star.draw();
            arr.push(star);
        }

        for (var i = 0; i < rainCount; i++) {
            var rain = new MeteorRain();
            rain.init();
            rain.draw();
            rains.push(rain);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startBackground);
    } else {
        startBackground();
    }
})();
