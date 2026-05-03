(function(window){

    function random(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    function bezier(cp, t) {  
        var p1 = cp[0].mul((1 - t) * (1 - t));
        var p2 = cp[1].mul(2 * t * (1 - t));
        var p3 = cp[2].mul(t * t); 
        return p1.add(p2).add(p3);
    }  

    function inheart(x, y, r) {
        // x^2+(y-(x^2)^(1/3))^2 = 1
        // http://www.wolframalpha.com/input/?i=x%5E2%2B%28y-%28x%5E2%29%5E%281%2F3%29%29%5E2+%3D+1
        var z = ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) * ((x / r) * (x / r) + (y / r) * (y / r) - 1) - (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
        return z < 0;
    }

    Point = function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Point.prototype = {
        clone: function() {
            return new Point(this.x, this.y);
        },
        add: function(o) {
            p = this.clone();
            p.x += o.x;
            p.y += o.y;
            return p;
        },
        sub: function(o) {
            p = this.clone();
            p.x -= o.x;
            p.y -= o.y;
            return p;
        },
        div: function(n) {
            p = this.clone();
            p.x /= n;
            p.y /= n;
            return p;
        },
        mul: function(n) {
            p = this.clone();
            p.x *= n;
            p.y *= n;
            return p;
        }
    }

    Heart = function() {
        // x = 16 sin^3 t
        // y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t
        // http://www.wolframalpha.com/input/?i=x+%3D+16+sin%5E3+t%2C+y+%3D+(13+cos+t+-+5+cos+2t+-+2+cos+3t+-+cos+4t)
        var points = [], x, y, t;
        for (var i = 10; i < 30; i += 0.2) {
            t = i / Math.PI;
            x = 16 * Math.pow(Math.sin(t), 3);
            y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
            points.push(new Point(x, y));
        }
        this.points = points;
        this.length = points.length;
    }
    Heart.prototype = {
        get: function(i, scale) {
            return this.points[i].mul(scale || 1);
        }
    }

    Seed = function(tree, point, scale, color) {
        this.tree = tree;

        var scale = scale || 1
        var color = color || '#FF0000';

        this.heart = {
            point  : point,
            scale  : scale,
            color  : color,
            figure : new Heart(),
        }

        this.cirle = {
            point  : point,
            scale  : scale,
            color  : color,
            radius : 5,
        }
    }
    Seed.prototype = {
        draw: function() {
            this.drawHeart();
        },
        addPosition: function(x, y) {
            this.cirle.point = this.cirle.point.add(new Point(x, y));
        },
        canMove: function() {
            return this.cirle.point.y < (this.tree.height + 20); 
        },
        move: function(x, y) {
            this.clear();
            this.drawCirle();
            this.addPosition(x, y);
        },
        canScale: function() {
            return this.heart.scale > 0.2;
        },
        setHeartScale: function(scale) {
            this.heart.scale *= scale;
        },
        scale: function(scale) {
            this.clear();
            this.drawCirle();
            this.drawHeart();
            this.setHeartScale(scale);
        },
        drawHeart: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < heart.figure.length; i++) {
                var p = heart.figure.get(i, scale);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawCirle: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, color = cirle.color, 
                scale = cirle.scale, radius = cirle.radius;
            ctx.save();
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.beginPath();
            ctx.moveTo(0, 0);
    	    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },
        drawText: function() {
            var ctx = this.tree.ctx, heart = this.heart;
            var point = heart.point, color = heart.color, 
                scale = heart.scale;
            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.translate(point.x, point.y);
            ctx.scale(scale, scale);
            ctx.moveTo(0, 0);
    	    ctx.lineTo(15, 15);
    	    ctx.lineTo(60, 15);
            ctx.stroke();

            ctx.moveTo(0, 0);
            ctx.scale(0.75, 0.75);
            ctx.font = "12px 微软雅黑,Verdana"; // 字号肿么没有用? (ˉ(∞)ˉ)
            ctx.fillText("click here", 23, 16);
            ctx.restore();
        },
        clear: function() {
            var ctx = this.tree.ctx, cirle = this.cirle;
            var point = cirle.point, scale = cirle.scale, radius = 26;
            var w = h = (radius * scale);
            ctx.clearRect(point.x - w, point.y - h, 4 * w, 4 * h);
        },
        hover: function(x, y) {
            var ctx = this.tree.ctx;
            var pixel = ctx.getImageData(x, y, 1, 1);
            return pixel.data[3] == 255
        }
    }

    Footer = function(tree, width, height, speed) {
        this.tree = tree;
        this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
        this.width = width;
        this.height = height;
        this.speed = speed || 2;
        this.length = 0;
    }
    Footer.prototype = {
        draw: function() {
            var ctx = this.tree.ctx, point = this.point;
            var len = this.length / 2;

            ctx.save();
            ctx.strokeStyle = 'rgb(35, 31, 32)';
            ctx.lineWidth = this.height;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.translate(point.x, point.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
    	    ctx.lineTo(len, 0);
    	    ctx.lineTo(-len, 0);
            ctx.stroke();
            ctx.restore();

            if (this.length < this.width) {
                this.length += this.speed;
            }
        }
    }

    Tree = function(canvas, width, height, opt) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = width;
        this.height = height;
        this.opt = opt || {};

        this.record = {};
        this.yellowRatio = 0;
        this.sproutHearts = [];
        
        this.initSeed();
        this.initFooter();
        this.initBranch();
        this.initBloom();
    }
    Tree.prototype = {
        drawText: function() {
        },
        drawSun: function() {
            var ctx = this.ctx;
            var sunX = this.width - 100;
            var sunY = 80;
            var sunRadius = 50;
            
            ctx.save();
            
            var gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius * 3);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
            gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunRadius * 3, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(sunX, sunY, sunRadius, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.restore();
        },
        initSeed: function() {
            var seed = this.opt.seed || {};
            var x = seed.x || this.width / 2;
            var y = seed.y || this.height / 2;
            var point = new Point(x, y);
            var color = seed.color || '#FF0000';
            var scale = seed.scale || 1;

            this.seed = new Seed(this, point, scale, color);
        },

        initFooter: function() {
            var footer = this.opt.footer || {};
            var width = footer.width || this.width;
            var height = footer.height || 5;
            var speed = footer.speed || 2;
            this.footer = new Footer(this, width, height, speed);
        },

        initBranch: function() {
            var branchs = this.opt.branch || []
            this.branchs = [];
            this.addBranchs(branchs);
        },

        initBloom: function() {
            var bloom = this.opt.bloom || {};
            var cache = [],
                num = bloom.num || 500, 
                width = bloom.width || this.width,
                height = bloom.height || this.height,
                figure = this.seed.heart.figure;
            var r = 240, x, y;
            for (var i = 0; i < num; i++) {
                cache.push(this.createBloom(width, height, r, figure));
            }
            this.blooms = [];
            this.bloomsCache = cache;
        },

        toDataURL: function(type) {
            return this.canvas.toDataURL(type);
        },

        draw: function(k) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k];
            if (!rec) {
                return ;
            }
            var point = rec.point,
                image = rec.image;

            ctx.save();
            ctx.putImageData(image, point.x, point.y);
        	ctx.restore();
        },

        addBranch: function(branch) {
        	this.branchs.push(branch);
        },

        addBranchs: function(branchs){
            var s = this, b, p1, p2, p3, r, l, c;
        	for (var i = 0; i < branchs.length; i++) {
                b = branchs[i];
                p1 = new Point(b[0], b[1]);
                p2 = new Point(b[2], b[3]);
                p3 = new Point(b[4], b[5]);
                r = b[6];
                l = b[7];
                c = b[8]
                s.addBranch(new Branch(s, p1, p2, p3, r, l, c)); 
            }
        },

        removeBranch: function(branch) {
            var branchs = this.branchs;
        	for (var i = 0; i < branchs.length; i++) {
        		if (branchs[i] === branch) {
        			branchs.splice(i, 1);
                }
            }
        },

        canGrow: function() {
            return !!this.branchs.length;
        },
        grow: function() {
            var branchs = this.branchs;
    	    for (var i = 0; i < branchs.length; i++) {
                var branch = branchs[i];
                if (branch) {
                    branch.grow();
                }
            }
        },

        addBloom: function (bloom) {
            this.blooms.push(bloom);
        },

        removeBloom: function (bloom) {
            var blooms = this.blooms;
            for (var i = 0; i < blooms.length; i++) {
                if (blooms[i] === bloom) {
                    blooms.splice(i, 1);
                }
            }
        },

        createBloom: function(width, height, radius, figure, color, alpha, angle, scale, place, speed, image) {
            var x, y;
            var treeColors = [
                '#FFB6A0',  // 蜜桃粉
                '#FFB7D5',  // 樱花粉
                '#E84393',  // 火龙果玫红
                '#4A7CFF',  // 宝蓝色
                '#FF7F50',  // 珊瑚橙
    
                '#A3D858',  // 牛油果亮绿
                '#50C878',  // 翡翠绿
                '#E60012'   // 正大红
            ];
            color = color || this.fruitColor;
            if (!color) {
                if (this.ripeMode) {
                    var h = random(45, 65);
                    var s = random(0.6, 0.9);
                    var v = random(0.85, 1.0);
                    var c = v * s;
                    var x1 = c * (1 - Math.abs(((h / 60) % 2) - 1));
                    var m = v - c;
                    var r, g, b;
                    if (h < 60) { r = c; g = x1; b = 0; }
                    else if (h < 120) { r = x1; g = c; b = 0; }
                    else if (h < 180) { r = 0; g = c; b = x1; }
                    else if (h < 240) { r = 0; g = x1; b = c; }
                    else if (h < 300) { r = x1; g = 0; b = c; }
                    else { r = c; g = 0; b = x1; }
                    color = 'rgb(' + Math.round((r + m) * 255) + ',' + Math.round((g + m) * 255) + ',' + Math.round((b + m) * 255) + ')';
                } else if (this.yellowRatio > 0) {
                    if (Math.random() < this.yellowRatio) {
                        h = random(45, 65);
                        s = random(0.6, 0.9);
                        v = random(0.85, 1.0);
                        c = v * s;
                        x1 = c * (1 - Math.abs(((h / 60) % 2) - 1));
                        m = v - c;
                        if (h < 60) { r = c; g = x1; b = 0; }
                        else if (h < 120) { r = x1; g = c; b = 0; }
                        else if (h < 180) { r = 0; g = c; b = x1; }
                        else if (h < 240) { r = 0; g = x1; b = c; }
                        else if (h < 300) { r = x1; g = 0; b = c; }
                        else { r = c; g = 0; b = x1; }
                        color = 'rgb(' + Math.round((r + m) * 255) + ',' + Math.round((g + m) * 255) + ',' + Math.round((b + m) * 255) + ')';
                    } else {
                        color = treeColors[random(0, treeColors.length - 1)];
                    }
                } else {
                    color = treeColors[random(0, treeColors.length - 1)];
                }
            }
            while (true) {
                x = random(20, width - 20);
                y = random(20, height - 20);
                if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
                    return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed, image);
                }
            }
        },
        
        canFlower: function() {
            return !!this.blooms.length;
        }, 
        flower: function(num) {
            var s = this, blooms = s.bloomsCache.splice(0, num);
            for (var i = 0; i < blooms.length; i++) {
                s.addBloom(blooms[i]);
            }
            blooms = s.blooms;
            for (var j = 0; j < blooms.length; j++) {
                blooms[j].flower();
            }
        },

        snapshot: function(k, x, y, width, height) {
            var ctx = this.ctx;
            var image = ctx.getImageData(x, y, width, height); 
            this.record[k] = {
                image: image,
                point: new Point(x, y),
                width: width,
                height: height
            }
        },
        setSpeed: function(k, speed) {
            this.record[k || "move"].speed = speed;
        },
        move: function(k, x, y) {
            var s = this, ctx = s.ctx;
            var rec = s.record[k || "move"];
            var point = rec.point,
                image = rec.image,
                speed = rec.speed || 10,
                width = rec.width,
                height = rec.height; 

            if (x < 0) {
                i = point.x - speed > x ? point.x - speed : x;
            } else {
                i = point.x + speed < x ? point.x + speed : x;
            }
            if (y < 0) {
                j = point.y - speed > y ? point.y - speed : y;
            } else {
                j = point.y + speed < y ? point.y + speed : y;
            }

            ctx.save();
            ctx.clearRect(point.x, point.y, width, height);
            ctx.putImageData(image, i, j);
        	ctx.restore();

            rec.point = new Point(i, j);
            rec.speed = speed * 0.95;

            if (rec.speed < 2) {
                rec.speed = 2;
            }
            if (x < 0) {
                return i > x || j < y;
            }
            return i < x || j < y;
        },

        jump: function() {
            var s = this, blooms = s.blooms;
            var limit = s.bloomLimit;
            if (limit === 0) {
                s.blooms = [];
                return;
            }
            if (blooms.length) {
                for (var i = blooms.length - 1; i >= 0; i--) {
                    blooms[i].jump();
                }
            }
            limit = limit || Infinity;
            if ((blooms.length && blooms.length < 3) || !blooms.length) {
                var bloom = this.opt.bloom || {},
                    width = bloom.width || this.width,
                    height = bloom.height || this.height,
                    figure = this.seed.heart.figure;
                var r = 240, x, y;
                for (var i = 0; i < random(1,2); i++) {
                    if (blooms.length >= limit) break;
                    var randomImage = window.fallingImages ? window.fallingImages[Math.floor(Math.random() * window.fallingImages.length)] : null;
                    blooms.push(this.createBloom(random(400, 600), random(200, 500), r, figure, null, 1, null, 1, new Point(random(600,1200), 720), random(200,300), randomImage));
                }
            }
        },

        drawSproutHearts: function() {
            var s = this, ctx = s.ctx, figure = this.seed.heart.figure;
            for (var i = 0; i < s.sproutHearts.length; i++) {
                var h = s.sproutHearts[i];
                ctx.save();
                ctx.globalAlpha = 0.9;
                ctx.translate(h.point.x, h.point.y);
                ctx.scale(h.scale, h.scale);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (var j = 0; j < figure.length; j++) {
                    var p = figure.get(j);
                    ctx.lineTo(p.x, -p.y);
                }
                ctx.closePath();
                ctx.fillStyle = h.color;
                ctx.shadowColor = h.color;
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.restore();
            }
        },

        addSproutHeart: function(point, scale, color) {
            this.sproutHearts.push({
                point: point,
                scale: scale || 0.25,
                color: color || '#FFB6C1'
            });
        },

        clearSproutHearts: function() {
            this.sproutHearts = [];
        },

        drawHeartPhotos: function(images) {
            var s = this, ctx = s.ctx;
            var centerX = s.width / 2 - 280;
            var centerY = s.height / 2 - 50;
            var scale = 0.6;
            
            var positions = [
                { x: -100, y: -70, angle: -15 },
                { x: 100, y: -70, angle: 15 },
                { x: 0, y: 50, angle: 5 },
                { x: -150, y: 20, angle: -20 },
                { x: 150, y: 20, angle: 20 }
            ];
            
            ctx.save();
            
            ctx.beginPath();
            for (var i = 0; i < s.seed.heart.figure.length; i++) {
                var p = s.seed.heart.figure.get(i, 220);
                if (i === 0) {
                    ctx.moveTo(centerX + p.x, centerY - p.y);
                } else {
                    ctx.lineTo(centerX + p.x, centerY - p.y);
                }
            }
            ctx.closePath();
            ctx.clip();
            
            for (var i = 0; i < positions.length && i < images.length; i++) {
                var pos = positions[i];
                var img = images[i];
                
                if (img && img.complete && img.naturalWidth > 0) {
                    ctx.save();
                    ctx.translate(centerX + pos.x * scale, centerY + pos.y * scale);
                    ctx.rotate(pos.angle * Math.PI / 180);
                    
                    var imgSize = 100 * scale;
                    ctx.drawImage(img, -imgSize/2, -imgSize/2, imgSize, imgSize);
                    
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(-imgSize/2, -imgSize/2, imgSize, imgSize);
                    
                    ctx.restore();
                }
            }
            
            ctx.restore();
        }
    }

    Branch = function(tree, point1, point2, point3, radius, length, branchs) {
        this.tree = tree;
        this.point1 = point1;
        this.point2 = point2;
        this.point3 = point3;
        this.radius = radius;
        this.length = length || 100;    
        this.len = 0;
        this.t = 1 / (this.length - 1);   
        this.branchs = branchs || [];
    }

    Branch.prototype = {
        grow: function() {
            var s = this, p; 
            if (s.len <= s.length) {
                p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
                s.draw(p);
                s.len += 1;
                s.radius *= 0.97;
            } else {
                s.tree.removeBranch(s);
                s.tree.addBranchs(s.branchs);
            }
        },
        draw: function(p) {
            var s = this;
            var ctx = s.tree.ctx;
            ctx.save();
        	ctx.beginPath();
            ctx.globalAlpha = 0.7;
        	ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 8;
        	ctx.moveTo(p.x, p.y);
        	ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
        	ctx.closePath();
        	ctx.fill();
        	ctx.restore();
        }
    }

    Bloom = function(tree, point, figure, color, alpha, angle, scale, place, speed, image) {
        this.tree = tree;
        this.point = point;
        this.color = color || 'rgb(255,' + random(0, 255) + ',' + random(0, 255) + ')';
        this.alpha = alpha || random(0.3, 1);
        this.angle = angle || 0;
        this.scale = scale || 0.1;
        this.place = place;
        this.speed = speed;
        this.image = image || null;

        this.figure = figure;
    }
    Bloom.prototype = {
        setFigure: function(figure) {
            this.figure = figure;
        },
        flower: function() {
            var s = this;
            s.draw();
            s.scale += 0.1;
            if (s.scale > 1) {
                s.tree.removeBloom(s);
            }
        },
        draw: function() {
            var s = this, ctx = s.tree.ctx, figure = s.figure;

            ctx.save();
            ctx.globalAlpha = s.alpha;
            ctx.translate(s.point.x, s.point.y);
            ctx.scale(s.scale, s.scale);
            ctx.rotate(s.angle);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            for (var i = 0; i < figure.length; i++) {
                var p = figure.get(i);
                ctx.lineTo(p.x, -p.y);
            }
            ctx.closePath();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 3;
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 10;
            ctx.stroke();
            
            if (s.image) {
                ctx.clip();
                var imgSize = 60;
                ctx.drawImage(s.image, -imgSize/2, -imgSize/2, imgSize, imgSize);
            } else {
                ctx.fillStyle = s.color;
                ctx.shadowBlur = 0;
                ctx.fill();
            }
            ctx.restore();
        },
        jump: function() {
            var s = this, height = s.tree.height;

            if (s.point.x < -20 || s.point.y > height + 20) {
                s.tree.removeBloom(s);
            } else {
                s.draw();
                s.point = s.place.sub(s.point).div(s.speed).add(s.point);
                s.angle += 0.05;
                s.speed -= 1;
            }
        }
    }

    window.random = random;
    window.bezier = bezier;
    window.Point = Point;
    window.inheart = inheart;
    window.Tree = Tree;

})(window);
