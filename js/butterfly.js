(function() {
    var container = document.getElementById('butterfly-container');
    var poemLines = ['红豆生南国', '春来发几枝', '愿君多采撷', '此物最相思'];
    var globalPoemIndex = 0;
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
        this.restDuration = 3000 + Math.random() * 5000;
        this.wanderDuration = 4000 + Math.random() * 6000;
        this.directionChangeTimer = 0;
        this.directionChangeInterval = 800 + Math.random() * 2000;
        this.poemLine = poemLines[globalPoemIndex];
        this.poemIndex = globalPoemIndex;
        globalPoemIndex = (globalPoemIndex + 1) % poemLines.length;
        this.scale = 1.8 + Math.random() * 0.4;
        this.bodyTilt = 0;
        this.targetBodyTilt = 0;
        this.landingX = 0;
        this.landingY = 0;
        this.approachAngle = 0;
        this.approachRadius = 0;
        this.circling = false;

        this.el.querySelector('.butterfly-poem').textContent = this.poemLine;
        container.appendChild(this.el);
    }

    Butterfly.prototype.update = function(dt) {
        if (this.state === 'resting') {
            this.flapFreqTarget = 0.003;
        } else {
            this.flapFreqTarget = 0.008 + Math.random() * 0.004;
        }
        this.flapFreq += (this.flapFreqTarget - this.flapFreq) * 0.02;
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

        this.targetBodyTilt = Math.sin(this.angle) * 15;
        this.bodyTilt += (this.targetBodyTilt - this.bodyTilt) * 0.05;

        if (this.x < 60) { this.x = 60; this.wanderAngle = 0; this.angle += 0.15; }
        if (this.x > W - 60) { this.x = W - 60; this.wanderAngle = Math.PI; this.angle -= 0.15; }
        if (this.y < 60) { this.y = 60; this.wanderAngle = Math.PI * 0.5; this.angle += 0.1; }
        if (this.y > H - 80) { this.y = H - 80; this.wanderAngle = -Math.PI * 0.5; this.angle -= 0.1; }

        if (this.stateTimer > this.wanderDuration && Math.random() < 0.01) {
            this.startApproaching();
        }
    };

    Butterfly.prototype.startApproaching = function() {
        this.state = 'approaching';
        this.stateTimer = 0;
        this.landingX = 120 + Math.random() * (W - 240);
        this.landingY = H * 0.3 + Math.random() * (H * 0.4);
        this.approachRadius = 60 + Math.random() * 40;
        this.approachAngle = Math.random() * Math.PI * 2;
        this.circling = false;
    };

    Butterfly.prototype.updateApproaching = function(dt) {
        this.stateTimer += dt;

        var dx = this.landingX - this.x;
        var dy = this.landingY - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.approachRadius * 2.5) {
            var targetAngle = Math.atan2(dy, dx);
            var angleDiff = targetAngle - this.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.angle += angleDiff * 0.04;

            this.speed = this.baseSpeed * 1.2;
            var bob = Math.sin(this.flapPhase) * this.bobAmplitude * 0.7;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed * 0.6 + bob;
        } else {
            this.circling = true;
            this.approachAngle += 0.025 * dt * 0.06;

            var targetX = this.landingX + Math.cos(this.approachAngle) * this.approachRadius;
            var targetY = this.landingY + Math.sin(this.approachAngle) * this.approachRadius * 0.5;

            var toDx = targetX - this.x;
            var toDy = targetY - this.y;
            this.angle = Math.atan2(toDy, toDx);

            this.approachRadius *= 0.998;

            this.speed = this.baseSpeed * 0.7;
            var bob = Math.sin(this.flapPhase) * this.bobAmplitude * 0.4;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed * 0.5 + bob;

            if (this.approachRadius < 8) {
                this.state = 'resting';
                this.stateTimer = 0;
                this.el.classList.add('resting');
                this.speed = 0;
                this.x = this.landingX;
                this.y = this.landingY;
            }
        }

        this.targetBodyTilt = Math.sin(this.angle) * 20;
        this.bodyTilt += (this.targetBodyTilt - this.bodyTilt) * 0.05;
    };

    Butterfly.prototype.updateResting = function(dt) {
        this.stateTimer += dt;

        this.bodyTilt += (0 - this.bodyTilt) * 0.05;

        if (this.stateTimer >= this.restDuration) {
            this.state = 'taking_off';
            this.stateTimer = 0;
            this.el.classList.remove('resting');
            this.poemIndex = (this.poemIndex + 1) % poemLines.length;
            this.poemLine = poemLines[this.poemIndex];
            this.el.querySelector('.butterfly-poem').textContent = this.poemLine;
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

        this.targetBodyTilt = Math.sin(this.angle) * 15;
        this.bodyTilt += (this.targetBodyTilt - this.bodyTilt) * 0.05;

        if (this.stateTimer > 800) {
            this.state = 'wandering';
            this.stateTimer = 0;
            this.wanderDuration = 4000 + Math.random() * 6000;
            this.directionChangeTimer = 0;
        }
    };

    Butterfly.prototype.render = function() {
        var dir = Math.cos(this.angle) >= 0 ? 1 : -1;
        var innerScaleX = this.scale * dir;
        this.el.style.left = this.x + 'px';
        this.el.style.top = this.y + 'px';
        this.el.style.transform = 'scaleY(' + this.scale + ')';
        var inner = this.el.querySelector('.butterfly-inner');
        inner.style.transform = 'scaleX(' + innerScaleX + ') rotate(' + (this.bodyTilt * dir) + 'deg)';

        var isResting = this.state === 'resting';
        var maxAngle = isResting ? 30 : 70;
        var minScaleX = isResting ? 0.7 : 0.3;
        var wingAngle = Math.sin(this.flapPhase) * 0.5 + 0.5;
        var rotateY = wingAngle * maxAngle;
        var scaleXVal = 1 - wingAngle * (1 - minScaleX);

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
