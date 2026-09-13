(function() {
    var container = document.getElementById('butterfly-container');

    // 蝴蝶身上的文字 = 当前页面的「分类 · 模块」；只在切换后显示一次（4 秒后自动淡出）
    var VIEW_LABELS = [
        { selector: '#animation-btn', text: '首页 · 爱心树' },
        { selector: '#diary-btn', text: '生活 · 日记' },
        { selector: '#fund-btn', text: '理财 · 爱心储罐' },
        { selector: '#music-btn', text: '娱乐 · 音乐播放器' }
    ];
    var LABEL_SHOW_MS = 4000;   // 「分类 · 模块」显示时长
    var INTRO_SHOW_MS = 2500;   // 「你好！我是小花」「我的投资战绩是」各自显示时长
    var CHIP_SHOW_MS = 4000;    // 最后显示一条「字段 + 数值」的时长
    var INTRO_LINES = ['你好！我是小花', '我的投资战绩是']; // 公布战绩前的开场白
    var currentLabel = VIEW_LABELS[0].text;
    var labelTimer = null;
    var labelSeq = 0;
    var chipIndex = 0;          // 账户信息轮播到第几条（多的下次切换再显示）

    // 账户信息：baba 对外接口（实时），失败时回退仓库里的每日快照
    var FUND_API = 'https://baba.xtwa.org/public/fund';
    var FUND_HISTORY = './data/fund-history.json';

    // 每条都是「字段 + 数值」一起，不拆开（拆开看效果不好）
    function fundChips(d) {
        if (!d) return [];
        var chips = [];
        var n = function(v) { return v == null ? '--' : Number(v).toFixed(2); };
        if (d.total_amount != null) chips.push('总金额 ' + n(d.total_amount));
        if (d.total_profit_pct != null) {
            chips.push('总盈亏 ' + (d.total_profit_pct > 0 ? '+' : '') + n(d.total_profit_pct) + '%');
        }
        if (d.open_count != null) chips.push('投资 ' + d.open_count + ' 笔');
        return chips;
    }

    function fetchFundChips(cb) {
        var settled = false;
        var finish = function(c) { if (settled) return; settled = true; cb(c || []); };
        setTimeout(function() { finish([]); }, 6000); // 兜底：6 秒拿不到就不显示
        (async function() {
            try {
                var r = await fetch(FUND_API);
                var d = await r.json();
                if (d && d.ok) return finish(fundChips(d));
            } catch (e) {}
            try {
                var r2 = await fetch(FUND_HISTORY + '?t=' + Date.now());
                var d2 = await r2.json();
                finish(fundChips(d2 && d2.current));
            } catch (e2) {
                finish([]);
            }
        })();
    }

    var butterflies = [];
    var maxButterflies = 1;
    var spawnInterval = 5000;
    var W = window.innerWidth;
    var H = window.innerHeight;

    window.addEventListener('resize', function() {
        W = window.innerWidth;
        H = window.innerHeight;
    });

    function createButterflyElement() {
        var el = document.createElement('div');
        el.className = 'butterfly butterfly-glow';
        el.innerHTML =
            '<div class="butterfly-inner">' +
                '<div class="butterfly-head">' +
                    '<div class="butterfly-antenna butterfly-antenna-left"></div>' +
                    '<div class="butterfly-antenna butterfly-antenna-right"></div>' +
                    '<div class="butterfly-eye butterfly-eye-left"></div>' +
                    '<div class="butterfly-eye butterfly-eye-right"></div>' +
                '</div>' +
                '<div class="butterfly-wing-container">' +
                    '<div class="butterfly-wing-side butterfly-wing-left">' +
                        '<div class="butterfly-wing-upper"></div>' +
                        '<div class="butterfly-wing-lower"></div>' +
                    '</div>' +
                    '<div class="butterfly-wing-side butterfly-wing-right">' +
                        '<div class="butterfly-wing-upper"></div>' +
                        '<div class="butterfly-wing-lower"></div>' +
                    '</div>' +
                '</div>' +
                '<div class="butterfly-body-line">' +
                    '<div class="butterfly-legs">' +
                        '<div class="butterfly-leg"></div>' +
                        '<div class="butterfly-leg"></div>' +
                        '<div class="butterfly-leg"></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="butterfly-poem"></div>';
        return el;
    }

    function normalizeAngle(a) {
        while (a > 180) a -= 360;
        while (a < -180) a += 360;
        return a;
    }

    var BOUNDARY_MARGIN = 150;
    var BOUNDARY_FORCE = 0.12;

    function applyBoundaryForce(butterfly) {
        var fx = 0, fy = 0;

        if (butterfly.x < BOUNDARY_MARGIN) {
            var ratio = 1 - butterfly.x / BOUNDARY_MARGIN;
            fx += BOUNDARY_FORCE * ratio * ratio;
        }
        if (butterfly.x > W - BOUNDARY_MARGIN) {
            var ratio = 1 - (W - butterfly.x) / BOUNDARY_MARGIN;
            fx -= BOUNDARY_FORCE * ratio * ratio;
        }
        if (butterfly.y < BOUNDARY_MARGIN) {
            var ratio = 1 - butterfly.y / BOUNDARY_MARGIN;
            fy += BOUNDARY_FORCE * ratio * ratio;
        }
        if (butterfly.y > H - BOUNDARY_MARGIN) {
            var ratio = 1 - (H - butterfly.y) / BOUNDARY_MARGIN;
            fy -= BOUNDARY_FORCE * ratio * ratio;
        }

        if (fx !== 0 || fy !== 0) {
            var forceAngle = Math.atan2(fy, fx);
            var angleDiff = forceAngle - butterfly.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            butterfly.angle += angleDiff * 0.15;

            butterfly.x += fx;
            butterfly.y += fy;
        }

        butterfly.x = Math.max(30, Math.min(W - 30, butterfly.x));
        butterfly.y = Math.max(30, Math.min(H - 30, butterfly.y));
    }

    function Butterfly() {
        this.el = createButterflyElement();
        this.x = Math.random() * W;
        this.y = Math.random() * H * 0.5 + 50;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.8 + Math.random() * 0.6;
        this.baseSpeed = this.speed;
        this.wanderAngle = this.angle;
        this.wanderRate = 0.3 + Math.random() * 0.4;
        this.wanderStrength = 0.6 + Math.random() * 0.4;
        this.flapPhase = Math.random() * Math.PI * 2;
        this.flapFreq = 0.008 + Math.random() * 0.004;
        this.flapFreqTarget = this.flapFreq;
        this.bobAmplitude = 0.4 + Math.random() * 0.3;
        this.state = 'wandering';
        this.stateTimer = 0;
        this.restDuration = 15000 + Math.random() * 10000;
        this.wanderDuration = 4000 + Math.random() * 6000;
        this.directionChangeTimer = 0;
        this.directionChangeInterval = 800 + Math.random() * 2000;
        this.scale = 1.8 + Math.random() * 0.4;
        this.headingAngle = this.angle * 180 / Math.PI + 90;
        this.headingAngleTarget = this.headingAngle;
        this.landingX = 0;
        this.landingY = 0;
        this.approachAngle = 0;
        this.approachRadius = 0;
        this.circling = false;
        this.wingMaxAngle = 70;
        this.wingMinScaleX = 0.3;
        this.wingMaxAngleTarget = 70;
        this.wingMinScaleXTarget = 0.3;
        this.prevX = this.x;
        this.prevY = this.y;
        this.moveSpeed = 0;
        this.particles = [];
        this.particleTimer = 0;
        this.particleColors = ['#ff69b4', '#ffb6c1', '#ff1493', '#ffd700', '#87ceeb', '#dda0dd', '#ff6347', '#7fffd4'];

        this.el.querySelector('.butterfly-poem').textContent = currentLabel;
        container.appendChild(this.el);
    }

    Butterfly.prototype.updateHeading = function() {
        if (this.state === 'resting') return;

        var targetDeg = this.angle * 180 / Math.PI + 90;
        targetDeg = normalizeAngle(targetDeg);
        this.headingAngleTarget = normalizeAngle(this.headingAngleTarget);

        var diff = normalizeAngle(targetDeg - this.headingAngleTarget);
        this.headingAngleTarget += diff;
        this.headingAngleTarget = normalizeAngle(this.headingAngleTarget);

        var lerpRate;
        if (this.state === 'approaching' && this.circling) {
            lerpRate = 0.008;
        } else if (this.state === 'taking_off') {
            lerpRate = 0.01;
        } else {
            lerpRate = 0.03;
        }

        var headingDiff = normalizeAngle(this.headingAngleTarget - this.headingAngle);
        this.headingAngle += headingDiff * lerpRate;
        this.headingAngle = normalizeAngle(this.headingAngle);
    };

    Butterfly.prototype.update = function(dt) {
        var dx = this.x - this.prevX;
        var dy = this.y - this.prevY;
        this.moveSpeed = Math.sqrt(dx * dx + dy * dy);
        this.prevX = this.x;
        this.prevY = this.y;

        var speedRatio = Math.min(this.moveSpeed / 2.0, 1.0);

        if (this.state === 'resting') {
            this.flapFreqTarget = 0.003;
            this.wingMaxAngleTarget = 30;
            this.wingMinScaleXTarget = 0.7;
        } else {
            this.flapFreqTarget = 0.004 + speedRatio * 0.012;
            this.wingMaxAngleTarget = 30 + speedRatio * 40;
            this.wingMinScaleXTarget = 0.7 - speedRatio * 0.4;
        }
        this.flapFreq += (this.flapFreqTarget - this.flapFreq) * 0.03;
        this.wingMaxAngle += (this.wingMaxAngleTarget - this.wingMaxAngle) * 0.03;
        this.wingMinScaleX += (this.wingMinScaleXTarget - this.wingMinScaleX) * 0.03;
        this.flapPhase += this.flapFreq * dt;

        switch (this.state) {
            case 'wandering':
                this.updateWandering(dt);
                break;
            case 'approaching':
                this.updateApproaching(dt);
                break;
            case 'resting':
                this.updateResting(dt);
                break;
            case 'taking_off':
                this.updateTakingOff(dt);
                break;
        }

        if (this.state !== 'resting') {
            applyBoundaryForce(this);
        }

        this.updateHeading();
        this.updateParticles(dt);
        this.render();
    };

    Butterfly.prototype.updateWandering = function(dt) {
        this.stateTimer += dt;
        this.directionChangeTimer += dt;

        if (this.directionChangeTimer >= this.directionChangeInterval) {
            this.directionChangeTimer = 0;
            this.directionChangeInterval = 600 + Math.random() * 2500;
            this.wanderAngle += (Math.random() - 0.5) * Math.PI * 0.8;
        }

        this.wanderAngle += (Math.random() - 0.5) * this.wanderRate * dt * 0.01;
        this.angle += (this.wanderAngle - this.angle) * 0.03;

        var bob = Math.sin(this.flapPhase) * this.bobAmplitude;
        var glideDip = -Math.abs(Math.sin(this.flapPhase * 0.5)) * 0.15;

        this.speed = this.baseSpeed + Math.sin(this.flapPhase * 0.7) * 0.3;

        this.x += Math.cos(this.angle) * this.speed + Math.sin(this.flapPhase * 1.3) * 0.2;
        this.y += Math.sin(this.angle) * this.speed * 0.5 + bob + glideDip;

        if (this.stateTimer > this.wanderDuration && Math.random() < 0.01) {
            this.startApproaching();
        }
    };

    Butterfly.prototype.startApproaching = function() {
        this.state = 'approaching';
        this.stateTimer = 0;
        this.landingX = BOUNDARY_MARGIN + Math.random() * (W - BOUNDARY_MARGIN * 2);
        this.landingY = BOUNDARY_MARGIN + Math.random() * (H - BOUNDARY_MARGIN * 2);
        this.approachRadius = 30 + Math.random() * 20;
        this.approachAngle = Math.random() * Math.PI * 2;
        this.circling = false;
    };

    Butterfly.prototype.updateApproaching = function(dt) {
        this.stateTimer += dt;

        var dx = this.landingX - this.x;
        var dy = this.landingY - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.approachRadius * 1.5) {
            var targetAngle = Math.atan2(dy, dx);
            var angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.angle += angleDiff * 0.06;

            this.speed = this.baseSpeed * 1.2;
            var bob = Math.sin(this.flapPhase) * this.bobAmplitude * 0.7;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed * 0.6 + bob;
        } else {
            this.circling = true;
            this.approachAngle += 0.025 * dt * 0.1;

            var targetX = this.landingX + Math.cos(this.approachAngle) * this.approachRadius;
            var targetY = this.landingY + Math.sin(this.approachAngle) * this.approachRadius * 0.5;

            var toDx = targetX - this.x;
            var toDy = targetY - this.y;
            this.angle = Math.atan2(toDy, toDx);

            this.approachRadius *= 0.99;

            this.speed = this.baseSpeed * 0.7;
            var bob = Math.sin(this.flapPhase) * this.bobAmplitude * 0.4;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed * 0.5 + bob;

            if (this.approachRadius < 5) {
                this.state = 'resting';
                this.stateTimer = 0;
                this.el.classList.add('resting');
                this.speed = 0;
                this.x = this.landingX;
                this.y = this.landingY;
            }
        }
    };

    Butterfly.prototype.updateResting = function(dt) {
        this.stateTimer += dt;

        if (this.stateTimer >= this.restDuration) {
            this.state = 'taking_off';
            this.stateTimer = 0;
            this.el.classList.remove('resting');
        }
    };

    Butterfly.prototype.updateTakingOff = function(dt) {
        this.stateTimer += dt;

        this.angle = -Math.PI * 0.5 + (Math.random() - 0.5) * Math.PI * 0.6;
        this.speed = this.baseSpeed * (this.stateTimer / 800);
        this.speed = Math.min(this.speed, this.baseSpeed);

        var bob = Math.sin(this.flapPhase) * this.bobAmplitude;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + bob - 0.5;

        if (this.stateTimer > 800) {
            this.state = 'wandering';
            this.stateTimer = 0;
            this.wanderDuration = 4000 + Math.random() * 6000;
            this.directionChangeTimer = 0;
        }
    };

    Butterfly.prototype.updateParticles = function(dt) {
        this.particleTimer += dt;

        var spawnRate = this.state === 'resting' ? 200 : 80;
        if (this.particleTimer >= spawnRate) {
            this.particleTimer = 0;
            this.spawnParticle();
        }

        for (var i = this.particles.length - 1; i >= 0; i--) {
            var p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                p.el.remove();
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.01;
            var lifeRatio = p.life / p.maxLife;
            p.el.style.left = p.x + 'px';
            p.el.style.top = p.y + 'px';
            p.el.style.opacity = lifeRatio;
            p.el.style.transform = 'scale(' + lifeRatio + ')';
        }
    };

    Butterfly.prototype.spawnParticle = function() {
        var el = document.createElement('div');
        el.className = 'butterfly-particle';
        var color = this.particleColors[Math.floor(Math.random() * this.particleColors.length)];
        el.style.background = color;
        el.style.boxShadow = '0 0 4px ' + color;

        var wingContainer = this.el.querySelector('.butterfly-wing-container');
        var rect = wingContainer.getBoundingClientRect();
        var containerRect = container.getBoundingClientRect();

        var px = rect.left - containerRect.left + Math.random() * rect.width;
        var py = rect.top - containerRect.top + Math.random() * rect.height;

        el.style.left = px + 'px';
        el.style.top = py + 'px';
        container.appendChild(el);

        var maxLife = 800 + Math.random() * 600;
        this.particles.push({
            el: el,
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -0.3 - Math.random() * 0.5,
            life: maxLife,
            maxLife: maxLife
        });
    };

    Butterfly.prototype.render = function() {
        this.el.style.left = this.x + 'px';
        this.el.style.top = this.y + 'px';
        this.el.style.transform = 'scale(' + this.scale + ')';

        var inner = this.el.querySelector('.butterfly-inner');
        inner.style.transform = 'rotate(' + this.headingAngle + 'deg)';

        var wingAngle = Math.sin(this.flapPhase) * 0.5 + 0.5;
        var rotateY = wingAngle * this.wingMaxAngle;
        var scaleXVal = 1 - wingAngle * (1 - this.wingMinScaleX);

        var leftWing = this.el.querySelector('.butterfly-wing-left');
        var rightWing = this.el.querySelector('.butterfly-wing-right');
        if (leftWing) {
            leftWing.style.transform = 'rotateY(' + rotateY + 'deg) scaleX(' + scaleXVal + ')';
        }
        if (rightWing) {
            rightWing.style.transform = 'rotateY(' + (-rotateY) + 'deg) scaleX(' + scaleXVal + ')';
        }
    };

    function spawnButterfly() {
        if (butterflies.length < maxButterflies) {
            butterflies.push(new Butterfly());
        }
    }

    function eachPoem(fn) {
        var poems = container.querySelectorAll('.butterfly-poem');
        for (var i = 0; i < poems.length; i++) fn(poems[i]);
    }

    function showPoem(text) {
        eachPoem(function(el) {
            el.textContent = text;
            el.classList.add('show');
        });
    }

    function hidePoem() {
        eachPoem(function(el) {
            el.classList.remove('show');
        });
    }

    // 切换分类/模块时，蝴蝶依次说：分类·模块 →「你好！我是小花」→「我的投资战绩是」→ 一条「字段+数值」
    // 每次切换只走一遍，中途再次切换会作废上一轮；没说完的字段下次切换接着显示
    function showLabelOnce(text) {
        var seq = ++labelSeq;
        currentLabel = text;
        if (labelTimer) {
            clearTimeout(labelTimer);
            labelTimer = null;
        }

        // 先去取账户数据（和开场白并行，等轮到它时基本已就绪）
        var chips = null;
        fetchFundChips(function(list) { chips = list; });

        var steps = [text].concat(INTRO_LINES);
        var step = 0;

        function showNext() {
            if (seq !== labelSeq) return;
            if (step < steps.length) {
                var cur = steps[step];
                var ms = step === 0 ? LABEL_SHOW_MS : INTRO_SHOW_MS;
                step++;
                showPoem(cur);
                labelTimer = setTimeout(showNext, ms);
                return;
            }
            // 最后一步：一条「字段 + 数值」（剩下的下次切换再显示）
            var tries = 0;
            (function showChip() {
                if (seq !== labelSeq) return;
                if (!chips) {
                    if (tries++ < 6) {
                        labelTimer = setTimeout(showChip, 500);
                    } else {
                        hidePoem();
                    }
                    return;
                }
                if (!chips.length) {
                    hidePoem();
                    return;
                }
                var chip = chips[chipIndex % chips.length];
                chipIndex++;
                showPoem(chip);
                labelTimer = setTimeout(function() {
                    if (seq !== labelSeq) return;
                    hidePoem();
                }, CHIP_SHOW_MS);
            })();
        }

        showNext();
    }

    for (var vi = 0; vi < VIEW_LABELS.length; vi++) {
        (function(cfg) {
            var btn = document.querySelector(cfg.selector);
            if (!btn) return;
            btn.addEventListener('click', function() {
                showLabelOnce(cfg.text);
            });
        })(VIEW_LABELS[vi]);
    }

    spawnButterfly();

    var lastTime = Date.now();
    function animate() {
        var now = Date.now();
        var dt = now - lastTime;
        lastTime = now;
        if (dt > 100) dt = 16;

        for (var i = 0; i < butterflies.length; i++) {
            butterflies[i].update(dt);
        }

        requestAnimationFrame(animate);
    }
    animate();
})();
