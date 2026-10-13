/**
 * Turbo Clash 2P - Core Game Engine
 * Xử lý đồ họa Canvas 60 FPS, vật lý đua xe, chướng ngại vật đồng bộ và hiệu ứng.
 */

// Hàm sinh số ngẫu nhiên có Seed (để 2 người chơi có đường đua giống hệt nhau)
class SeededRandom {
    constructor(seed = 12345) {
        this.seed = seed % 2147483647;
        if (this.seed <= 0) this.seed += 2147483646;
    }
    next() {
        this.seed = (this.seed * 16807) % 2147483647;
        return (this.seed - 1) / 2147483646;
    }
    range(min, max) {
        return min + this.next() * (max - min);
    }
    choice(arr) {
        return arr[Math.floor(this.next() * arr.length)];
    }
}

class RacingGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.running = false;
        this.levelIndex = 0; // 0-based
        this.levelConfig = null;
        this.seed = 12345;

        // Trạng thái xe bản thân (Local Car)
        this.car = {
            id: 'p1',
            name: 'Tay đua 1',
            color: '#ff3344',
            x: 0,           // Vị trí ngang (-roadWidth/2 tới +roadWidth/2)
            y: 0,           // Quãng đường đã chạy (mét)
            speed: 0,       // Tốc độ hiện tại (km/h)
            maxSpeed: 180,
            accel: 85,
            brake: 120,
            friction: 25,
            steerSpeed: 320,
            angle: 0,       // Góc xoay
            nitro: 100,     // Phần trăm Nitro
            isNitro: false,
            health: 100,    // Độ bền xe
            slipTimer: 0,   // Đếm ngược mất lái do vệt dầu
            spinAngle: 0,
            finished: false,
            finishTime: 0
        };

        // Trạng thái đối thủ (Opponent Car qua Socket)
        this.opponent = {
            id: 'p2',
            name: 'Tay đua 2',
            color: '#00d2ff',
            x: 60,
            y: 0,
            speed: 0,
            angle: 0,
            nitro: 100,
            health: 100,
            targetX: 60,
            targetY: 0,
            targetSpeed: 0,
            targetAngle: 0,
            finished: false
        };

        // Danh sách phím bấm
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            nitro: false
        };

        // Cảm biến nghiêng điện thoại (Gyroscope)
        this.gyroEnabled = false;
        this.gyroTilt = 0;

        // Đường đua và Chướng ngại vật
        this.obstacles = [];
        this.trackLength = 1200;
        this.roadWidth = 480;

        // Hiệu ứng hạt (Particles & FX)
        this.particles = [];
        this.skidMarks = [];
        this.cameraShake = 0;
        this.screenFlash = null;
        this.lightningTimer = 0;

        // Bộ đếm thời gian
        this.startTime = 0;
        this.elapsedTime = 0;
        this.countdownValue = 0;
        this.countdownActive = false;

        // Vòng lặp gửi Socket
        this.lastSocketSync = 0;
        this.syncInterval = 1000 / 30; // 30Hz

        this.init();
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.setupKeyboard();
        this.setupTouchControls();
        this.setupSocketListeners();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = true;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = true;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'Space') {
                this.keys.nitro = true;
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = false;
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'Space') this.keys.nitro = false;
        });
    }

    setupTouchControls() {
        // Hỗ trợ cảm ứng trên điện thoại (Touch buttons)
        const bindTouch = (btnId, keyName) => {
            const btn = document.getElementById(btnId);
            if (!btn) return;

            const handleStart = (e) => {
                e.preventDefault();
                this.keys[keyName] = true;
                btn.classList.add('active');
                if (navigator.vibrate) navigator.vibrate(20);
                window.sound.init();
            };

            const handleEnd = (e) => {
                e.preventDefault();
                this.keys[keyName] = false;
                btn.classList.remove('active');
            };

            btn.addEventListener('touchstart', handleStart, { passive: false });
            btn.addEventListener('touchend', handleEnd, { passive: false });
            btn.addEventListener('touchcancel', handleEnd, { passive: false });
            btn.addEventListener('mousedown', handleStart);
            btn.addEventListener('mouseup', handleEnd);
            btn.addEventListener('mouseleave', handleEnd);
        };

        bindTouch('btnSteerLeft', 'left');
        bindTouch('btnSteerRight', 'right');
        bindTouch('btnGas', 'up');
        bindTouch('btnBrake', 'down');
        bindTouch('btnNitro', 'nitro');

        // Lắng nghe nghiêng điện thoại (Gyro)
        window.addEventListener('deviceorientation', (e) => {
            if (this.gyroEnabled && e.gamma !== null) {
                // Gamma: nghiêng trái sang phải (-90 đến +90)
                this.gyroTilt = Math.max(-1, Math.min(1, e.gamma / 25));
            }
        });
    }

    setupSocketListeners() {
        // Nhận dữ liệu cập nhật từ đối thủ
        window.socketClient.onOpponentUpdate = (data) => {
            this.opponent.targetX = data.x;
            this.opponent.targetY = data.y;
            this.opponent.targetSpeed = data.speed;
            this.opponent.targetAngle = data.angle;
            this.opponent.nitro = data.nitro;
            this.opponent.health = data.health;
        };

        // Nhận sự kiện đếm ngược bắt đầu màn đua
        window.socketClient.onCountdown = (data) => {
            this.startLevelCountdown(data.level, data.levelSeed);
        };

        // Nhận sự kiện chuyển màn chơi tiếp theo
        window.socketClient.onLevelChanged = (data) => {
            this.prepareLevel(data.level, data.levelSeed);
            if (window.ui) window.ui.onLevelChanged(data);
        };

        // Nhận sự kiện hiệu ứng từ đối thủ (va chạm, nitro)
        window.socketClient.onGameEvent = (data) => {
            if (data.event === 'crash') {
                this.createSparks(this.opponent.x, this.opponent.y, '#38bdf8', 20);
            } else if (data.event === 'nitro') {
                this.createNitroFlame(this.opponent.x, this.opponent.y, true);
            }
        };

        // Nhận tin nhắn emote nhanh
        window.socketClient.onChatEmote = (data) => {
            if (window.ui) window.ui.showEmoteBubble(data.playerId, data.emote);
        };
    }

    // Thiết lập dữ liệu cho Level
    prepareLevel(levelNum, seed) {
        this.levelIndex = Math.max(0, Math.min(9, levelNum - 1));
        this.levelConfig = window.GAME_LEVELS[this.levelIndex];
        this.seed = seed || 12345;
        this.trackLength = this.levelConfig.distance;
        this.roadWidth = this.levelConfig.roadWidth;

        const isP1 = (window.socketClient.playerId === 'p1');
        this.car.id = window.socketClient.playerId || 'p1';
        this.car.color = isP1 ? '#ff3344' : '#00d2ff';
        this.car.name = isP1 ? 'Bạn (Đỏ)' : 'Bạn (Xanh)';
        this.car.x = isP1 ? -60 : 60;
        this.car.y = 0;
        this.car.speed = 0;
        this.car.angle = 0;
        this.car.nitro = 100;
        this.car.health = 100;
        this.car.slipTimer = 0;
        this.car.finished = false;
        this.car.finishTime = 0;
        this.car.maxSpeed = this.levelConfig.speedLimit;

        this.opponent.id = isP1 ? 'p2' : 'p1';
        this.opponent.color = isP1 ? '#00d2ff' : '#ff3344';
        this.opponent.name = isP1 ? 'Đối thủ (Xanh)' : 'Đối thủ (Đỏ)';
        this.opponent.x = isP1 ? 60 : -60;
        this.opponent.y = 0;
        this.opponent.targetX = this.opponent.x;
        this.opponent.targetY = 0;
        this.opponent.speed = 0;
        this.opponent.finished = false;

        this.particles = [];
        this.skidMarks = [];
        this.generateObstacles();

        if (window.ui) {
            window.ui.updateHUDLevel(this.levelConfig);
        }
    }

    // Sinh chướng ngại vật đồng bộ bằng SeededRandom
    generateObstacles() {
        this.obstacles = [];
        const rng = new SeededRandom(this.seed);
        const count = this.levelConfig.obstacleCount;
        const totalDist = this.trackLength;
        const spacing = (totalDist - 250) / count;

        // Danh sách trọng số loại chướng ngại vật
        const obsPool = [];
        this.levelConfig.obstacles.forEach(o => {
            for (let i = 0; i < o.weight; i++) {
                obsPool.push(o.type);
            }
        });

        for (let i = 0; i < count; i++) {
            const y = 140 + i * spacing + rng.range(-spacing * 0.3, spacing * 0.3);
            const laneWidth = this.roadWidth / this.levelConfig.lanes;
            const laneIdx = Math.floor(rng.range(0, this.levelConfig.lanes));
            const x = -this.roadWidth / 2 + laneIdx * laneWidth + laneWidth / 2 + rng.range(-15, 15);
            const type = rng.choice(obsPool);

            const obs = {
                id: i,
                type: type,
                x: x,
                y: y,
                width: 38,
                height: 52,
                speed: 0,
                color: '#f59e0b',
                lane: laneIdx,
                collected: false
            };

            // Đặc tính từng loại
            if (type === 'car_civilian') {
                obs.width = 38;
                obs.height = 68;
                obs.speed = rng.range(50, 95); // Xe dân sự chạy chậm
                obs.color = rng.choice(['#eab308', '#f8fafc', '#10b981', '#a855f7']);
            } else if (type === 'police') {
                obs.width = 40;
                obs.height = 70;
                obs.speed = rng.range(90, 130);
                obs.color = '#1e3a8a';
            } else if (type === 'boulder') {
                obs.width = 46;
                obs.height = 46;
                obs.rollX = rng.range(-1, 1);
            } else if (type === 'oil_slick') {
                obs.width = 54;
                obs.height = 54;
            } else if (type === 'sand_trap' || type === 'water_puddle') {
                obs.width = 65;
                obs.height = 50;
            } else if (type === 'barrier') {
                obs.width = 62;
                obs.height = 24;
            } else if (type === 'spike_strip') {
                obs.width = 70;
                obs.height = 18;
            } else if (type === 'boost_pad') {
                obs.width = 44;
                obs.height = 50;
            } else if (type === 'nitro_pickup' || type === 'wrench_pickup') {
                obs.width = 30;
                obs.height = 30;
            }

            this.obstacles.push(obs);
        }
    }

    // Đếm ngược 3... 2... 1... GO!
    startLevelCountdown(levelNum, seed) {
        this.prepareLevel(levelNum, seed);
        this.running = true;
        this.countdownActive = true;
        this.countdownValue = 3;

        if (window.ui) window.ui.showGameScreen();
        window.sound.playCountdown(false);

        const countTimer = setInterval(() => {
            this.countdownValue--;
            if (this.countdownValue > 0) {
                window.sound.playCountdown(false);
            } else if (this.countdownValue === 0) {
                window.sound.playCountdown(true);
                this.startTime = Date.now();
                window.sound.startEngine();
            } else {
                clearInterval(countTimer);
                this.countdownActive = false;
            }
        }, 1000);

        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    // Vòng lặp chính của Game (Game Loop - 60 FPS)
    gameLoop(timestamp) {
        if (!this.running) return;

        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000 || 0.016);
        this.lastTime = timestamp;

        this.update(dt);
        this.render();

        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        if (!this.countdownActive && !this.car.finished) {
            this.elapsedTime = (Date.now() - this.startTime) / 1000;
        }

        // Cập nhật vị trí mượt (Lerp) của đối thủ
        this.opponent.x += (this.opponent.targetX - this.opponent.x) * 12 * dt;
        this.opponent.y += (this.opponent.targetY - this.opponent.y) * 12 * dt;
        this.opponent.speed += (this.opponent.targetSpeed - this.opponent.speed) * 10 * dt;
        this.opponent.angle += (this.opponent.targetAngle - this.opponent.angle) * 12 * dt;

        if (!this.countdownActive && !this.car.finished) {
            this.updatePlayerPhysics(dt);
            this.updateObstacles(dt);
            this.checkCollisions();
        }

        this.updateParticles(dt);

        // Giảm rung màn hình (Camera Shake)
        if (this.cameraShake > 0) {
            this.cameraShake = Math.max(0, this.cameraShake - 15 * dt);
        }

        // Đồng bộ dữ liệu qua Socket
        const now = performance.now();
        if (now - this.lastSocketSync >= this.syncInterval) {
            this.lastSocketSync = now;
            window.socketClient.sendState(
                this.car.x,
                this.car.y,
                this.car.speed,
                this.car.angle,
                this.car.nitro,
                this.car.health
            );
        }

        // Cập nhật âm thanh động cơ
        window.sound.updateEngine(this.car.speed, this.car.maxSpeed, this.keys.up);

        // Cập nhật HUD
        if (window.ui) {
            window.ui.updateHUD(this.car, this.opponent, this.trackLength, this.elapsedTime);
        }
    }

    // Xử lý vật lý tay đua
    updatePlayerPhysics(dt) {
        const car = this.car;

        // 1. Kiểm tra trạng thái Nitro
        const wantNitro = this.keys.nitro && car.nitro > 0 && car.speed > 30;
        if (wantNitro && !car.isNitro) {
            car.isNitro = true;
            window.sound.playNitro();
            window.socketClient.sendEvent('nitro');
            if (navigator.vibrate) navigator.vibrate(50);
        } else if (!wantNitro) {
            car.isNitro = false;
        }

        if (car.isNitro) {
            car.nitro = Math.max(0, car.nitro - 25 * dt);
            this.createNitroFlame(car.x, car.y, false);
        } else {
            // Nạp lại Nitro từ từ
            car.nitro = Math.min(100, car.nitro + 3.5 * dt);
        }

        // Giới hạn tốc độ theo Nitro và Thời tiết
        let currentMaxSpeed = car.maxSpeed;
        if (car.isNitro) currentMaxSpeed += 55;

        // Giảm bám đường nếu dính bão/mưa (Level 8)
        const isSlippery = (this.levelConfig.theme.weather === 'storm');
        const grip = isSlippery ? 0.7 : 1.0;

        // 2. Tăng ga / Phanh
        let accelForce = 0;
        if (car.slipTimer > 0) {
            // Đang bị xoay xe do trượt vệt dầu
            car.slipTimer -= dt;
            car.spinAngle += 15 * dt;
            accelForce = -car.friction * 1.5;
            this.createSmoke(car.x, car.y);
            window.sound.startDrift();
        } else {
            car.spinAngle = 0;
            if (this.keys.up) {
                accelForce = (car.accel + (car.isNitro ? 80 : 0)) * grip;
            } else if (this.keys.down) {
                accelForce = -car.brake;
            } else {
                accelForce = -car.friction;
            }
        }

        car.speed += accelForce * dt;
        car.speed = Math.max(0, Math.min(currentMaxSpeed, car.speed));

        // 3. Đánh lái (Bẻ cua)
        let steerDir = 0;
        if (this.keys.left) steerDir -= 1;
        if (this.keys.right) steerDir += 1;
        if (this.gyroEnabled && Math.abs(this.gyroTilt) > 0.1) {
            steerDir = this.gyroTilt;
        }

        if (car.slipTimer <= 0 && Math.abs(steerDir) > 0 && car.speed > 5) {
            const steerFactor = (car.speed / car.maxSpeed) * 0.7 + 0.3;
            car.x += steerDir * car.steerSpeed * steerFactor * dt;
            car.angle = steerDir * 0.22;

            if (car.speed > 130 && Math.abs(steerDir) > 0.8) {
                window.sound.startDrift();
                this.addSkidMark(car.x, car.y);
            } else {
                window.sound.stopDrift();
            }
        } else {
            car.angle *= 0.85;
            window.sound.stopDrift();
        }

        // Lực ly tâm của khúc cua (Curvature Force)
        const curve = this.getCurvatureAt(car.y);
        car.x -= curve * (car.speed / car.maxSpeed) * 160 * dt;

        // Ranh giới lề đường (Giảm tốc nếu ra khỏi đường)
        const halfRoad = this.roadWidth / 2;
        if (Math.abs(car.x) > halfRoad) {
            car.speed = Math.max(0, car.speed - 90 * dt); // Đâm cỏ / cát
            this.createSmoke(car.x, car.y, '#22c55e');
            car.x = Math.max(-halfRoad - 40, Math.min(halfRoad + 40, car.x));
        }

        // 4. Tiến quãng đường (y)
        // Đổi km/h sang mét/giây: (km/h) / 3.6
        const speedMps = car.speed / 3.6;
        car.y += speedMps * dt;

        // 5. Kiểm tra Cán Đích (Finish Line)
        if (car.y >= this.trackLength && !car.finished) {
            car.finished = true;
            car.finishTime = this.elapsedTime;
            window.sound.playVictory();
            window.socketClient.sendFinish(car.finishTime);
        }
    }

    // Cập nhật chướng ngại vật di động (xe dân sự, đá lăn)
    updateObstacles(dt) {
        for (const obs of this.obstacles) {
            if (obs.type === 'car_civilian' || obs.type === 'police') {
                obs.y += (obs.speed / 3.6) * dt;
            } else if (obs.type === 'boulder' && obs.rollX) {
                obs.x += obs.rollX * 35 * dt;
                const halfRoad = this.roadWidth / 2 - 20;
                if (obs.x < -halfRoad || obs.x > halfRoad) {
                    obs.rollX = -obs.rollX;
                }
            }
        }
    }

    // Kiểm tra va chạm giữa Xe của bạn và Chướng ngại vật
    checkCollisions() {
        const car = this.car;
        if (car.finished) return;

        const carW = 36;
        const carH = 65;

        for (const obs of this.obstacles) {
            if (obs.collected) continue;

            const dx = Math.abs(car.x - obs.x);
            const dy = Math.abs(car.y - obs.y);

            if (dx < (carW + obs.width) * 0.45 && dy < (carH + obs.height) * 0.45) {
                this.handleObstacleHit(obs);
            }
        }
    }

    // Xử lý khi va chạm từng loại chướng ngại vật
    handleObstacleHit(obs) {
        const car = this.car;

        switch (obs.type) {
            case 'cone':
                car.speed = Math.max(20, car.speed - 30);
                this.createSparks(obs.x, obs.y, '#f59e0b', 12);
                window.sound.playCrash();
                obs.collected = true;
                break;

            case 'car_civilian':
            case 'police':
            case 'barrier':
            case 'boulder':
                // Va chạm mạnh
                car.speed = Math.max(10, car.speed * 0.35);
                car.health = Math.max(10, car.health - 20);
                this.cameraShake = 0.4;
                this.createSparks(car.x, car.y, '#ef4444', 30);
                window.sound.playCrash();
                window.socketClient.sendEvent('crash');
                if (navigator.vibrate) navigator.vibrate([80, 40, 100]);
                obs.collected = true;
                break;

            case 'oil_slick':
                if (car.slipTimer <= 0) {
                    car.slipTimer = 1.3; // Mất lái 1.3 giây
                    car.speed *= 0.8;
                    window.sound.playCrash();
                    if (window.ui) window.ui.showToast('⚠️ Dính vệt dầu! Mất lái!', 'warning');
                }
                break;

            case 'sand_trap':
                car.speed = Math.max(30, car.speed - 70 * 0.05);
                this.createSmoke(car.x, car.y, '#fde68a');
                break;

            case 'water_puddle':
                car.speed *= 0.85;
                this.createSmoke(car.x, car.y, '#67e8f9');
                break;

            case 'pothole':
                car.speed = Math.max(20, car.speed - 45);
                car.health = Math.max(10, car.health - 12);
                this.cameraShake = 0.25;
                window.sound.playCrash();
                obs.collected = true;
                break;

            case 'spike_strip':
                car.speed = Math.max(15, car.speed * 0.3);
                car.health = Math.max(5, car.health - 25);
                this.cameraShake = 0.35;
                window.sound.playCrash();
                if (window.ui) window.ui.showToast('🛑 Dính bẫy đinh! Xe bị hãm tốc!', 'error');
                obs.collected = true;
                break;

            case 'fire_hazard':
                car.speed *= 0.4;
                car.health = Math.max(5, car.health - 30);
                this.cameraShake = 0.5;
                this.createSparks(car.x, car.y, '#f97316', 40);
                window.sound.playCrash();
                obs.collected = true;
                break;

            case 'boost_pad':
                car.speed = Math.min(car.maxSpeed + 70, car.speed + 60);
                car.nitro = Math.min(100, car.nitro + 25);
                this.createNitroFlame(car.x, car.y, false);
                window.sound.playPickup(true);
                if (navigator.vibrate) navigator.vibrate(40);
                obs.collected = true;
                break;

            case 'nitro_pickup':
                car.nitro = Math.min(100, car.nitro + 50);
                this.createSparks(car.x, car.y, '#00d2ff', 15);
                window.sound.playPickup(false);
                if (window.ui) window.ui.showToast('🚀 Nhặt được bình Nitro!', 'success');
                obs.collected = true;
                break;

            case 'wrench_pickup':
                car.health = Math.min(100, car.health + 40);
                this.createSparks(car.x, car.y, '#22c55e', 15);
                window.sound.playPickup(false);
                if (window.ui) window.ui.showToast('🔧 Đã sửa chữa phục hồi xe!', 'success');
                obs.collected = true;
                break;
        }
    }

    // Lấy độ uốn lượn của đường đua tại vị trí mét y
    getCurvatureAt(y) {
        if (!this.levelConfig) return 0;
        const freq = 0.008;
        return Math.sin(y * freq) * this.levelConfig.curveIntensity;
    }

    // ================= HIỆU ỨNG HẠT (PARTICLES) =================
    createSparks(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 200 + 50;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color,
                life: 1.0,
                decay: Math.random() * 2.5 + 1.5
            });
        }
    }

    createSmoke(x, y, color = '#cbd5e1') {
        this.particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y - 25,
            vx: (Math.random() - 0.5) * 30,
            vy: -Math.random() * 40 - 20,
            size: Math.random() * 8 + 6,
            color,
            life: 0.8,
            decay: 1.2
        });
    }

    createNitroFlame(x, y, isOpponent = false) {
        const color = isOpponent ? '#38bdf8' : '#a855f7';
        for (let i = 0; i < 4; i++) {
            this.particles.push({
                x: x + (i % 2 === 0 ? -12 : 12),
                y: y - 35,
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 120 - 80,
                size: Math.random() * 6 + 4,
                color,
                life: 0.45,
                decay: 2.5
            });
        }
    }

    addSkidMark(x, y) {
        this.skidMarks.push({ x: x - 12, y, life: 3.0 });
        this.skidMarks.push({ x: x + 12, y, life: 3.0 });
        if (this.skidMarks.length > 120) {
            this.skidMarks.splice(0, 2);
        }
    }

    updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        for (let i = this.skidMarks.length - 1; i >= 0; i--) {
            this.skidMarks[i].life -= dt * 0.4;
            if (this.skidMarks[i].life <= 0) {
                this.skidMarks.splice(i, 1);
            }
        }
    }

    // ================= VẼ GAME LÊN CANVAS (RENDERING) =================
    render() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        ctx.clearRect(0, 0, w, h);

        // Hiệu ứng rung màn hình
        ctx.save();
        if (this.cameraShake > 0) {
            const shakeAmt = this.cameraShake * 16;
            ctx.translate((Math.random() - 0.5) * shakeAmt, (Math.random() - 0.5) * shakeAmt);
        }

        const cameraY = this.car.y;
        const screenCenterX = w / 2;
        const carScreenY = h * 0.75; // Vị trí xe của bạn nằm ở 75% chiều cao màn hình

        // 1. Vẽ nền cỏ / đất & Bầu trời Parallax
        this.renderBackground(ctx, w, h, cameraY);

        // 2. Vẽ Đường đua (Road)
        this.renderRoad(ctx, w, h, cameraY, screenCenterX, carScreenY);

        // 3. Vẽ Vết trượt bánh (Skid marks)
        this.renderSkidMarks(ctx, cameraY, screenCenterX, carScreenY);

        // 4. Vẽ Chướng ngại vật và Cán đích
        this.renderObstacles(ctx, cameraY, screenCenterX, carScreenY);

        // 5. Vẽ Xe Đối Thủ (Opponent)
        this.renderCar(ctx, this.opponent, cameraY, screenCenterX, carScreenY, true);

        // 6. Vẽ Xe Của Bạn (Player)
        this.renderCar(ctx, this.car, cameraY, screenCenterX, carScreenY, false);

        // 7. Vẽ Hạt hiệu ứng (Particles)
        this.renderParticles(ctx, cameraY, screenCenterX, carScreenY);

        // 8. Vẽ Hiệu ứng Thời tiết (Mưa, Sương mù, Bão cát, v.v.)
        this.renderWeatherOverlay(ctx, w, h);

        ctx.restore();

        // 9. Vẽ Đếm ngược nếu có
        if (this.countdownActive) {
            this.renderCountdown(ctx, w, h);
        }
    }

    renderBackground(ctx, w, h, cameraY) {
        const theme = this.levelConfig.theme;

        // Bầu trời
        const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        skyGrad.addColorStop(0, theme.skyColor);
        skyGrad.addColorStop(1, theme.horizonColor);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, w, h * 0.4);

        // Đồi núi ở chân trời (Parallax)
        ctx.fillStyle = theme.grassStripe;
        ctx.beginPath();
        const hillOffset = (cameraY * 0.05) % w;
        ctx.moveTo(0, h * 0.4);
        for (let x = 0; x <= w; x += 40) {
            const hillY = h * 0.35 + Math.sin((x + hillOffset) * 0.015) * 20;
            ctx.lineTo(x, hillY);
        }
        ctx.lineTo(w, h * 0.4);
        ctx.closePath();
        ctx.fill();

        // Nền cỏ hai bên đường
        ctx.fillStyle = theme.grassColor;
        ctx.fillRect(0, h * 0.4, w, h * 0.6);
    }

    renderRoad(ctx, w, h, cameraY, screenCenterX, carScreenY) {
        const theme = this.levelConfig.theme;
        const roadW = this.roadWidth;
        const halfRoad = roadW / 2;
        const stripeStep = 40; // Bước vạch kẻ đường (mét)

        // Phối cảnh đường: Vẽ các đoạn đường từ dưới lên trên
        const viewAhead = 900; // Nhìn xa 900 mét
        const startY = Math.floor((cameraY - 50) / stripeStep) * stripeStep;
        const endY = cameraY + viewAhead;

        for (let y = startY; y < endY; y += stripeStep) {
            const screenY1 = carScreenY - (y - cameraY);
            const screenY2 = carScreenY - (y + stripeStep - cameraY);
            if (screenY1 > h + 50 || screenY2 < -50) continue;

            const curve1 = this.getRoadCenterAt(y, cameraY);
            const curve2 = this.getRoadCenterAt(y + stripeStep, cameraY);

            const x1 = screenCenterX + curve1;
            const x2 = screenCenterX + curve2;

            // Màu mặt đường
            ctx.fillStyle = theme.roadColor;
            ctx.beginPath();
            ctx.moveTo(x1 - halfRoad, screenY1);
            ctx.lineTo(x1 + halfRoad, screenY1);
            ctx.lineTo(x2 + halfRoad, screenY2);
            ctx.lineTo(x2 - halfRoad, screenY2);
            ctx.closePath();
            ctx.fill();

            // Gờ lề đường (Curb rumble strips) đỏ/trắng hoặc neon
            const isStripe = (Math.floor(y / stripeStep) % 2 === 0);
            const curbCol = isStripe ? theme.curbColor1 : theme.curbColor2;
            ctx.fillStyle = curbCol;

            // Gờ trái
            ctx.fillRect(x1 - halfRoad - 12, screenY2, 12, screenY1 - screenY2);
            // Gờ phải
            ctx.fillRect(x1 + halfRoad, screenY2, 12, screenY1 - screenY2);

            // Vạch kẻ làn đường (Lanes)
            if (isStripe) {
                const laneW = roadW / this.levelConfig.lanes;
                ctx.fillStyle = theme.roadStripe;
                for (let l = 1; l < this.levelConfig.lanes; l++) {
                    const laneX = x1 - halfRoad + l * laneW;
                    ctx.fillRect(laneX - 2, screenY2, 4, (screenY1 - screenY2) * 0.6);
                }
            }
        }

        // Vẽ Vạch Đích (Finish Line Arch)
        if (this.trackLength >= cameraY - 50 && this.trackLength <= cameraY + viewAhead) {
            const finishScreenY = carScreenY - (this.trackLength - cameraY);
            const curve = this.getRoadCenterAt(this.trackLength, cameraY);
            const fx = screenCenterX + curve;

            // Vạch kẻ ô cờ vua caro đen trắng
            const checkW = 20;
            const checkCount = Math.floor(roadW / checkW);
            for (let c = 0; c < checkCount; c++) {
                ctx.fillStyle = (c % 2 === 0) ? '#ffffff' : '#000000';
                ctx.fillRect(fx - halfRoad + c * checkW, finishScreenY - 14, checkW, 14);
                ctx.fillStyle = (c % 2 === 1) ? '#ffffff' : '#000000';
                ctx.fillRect(fx - halfRoad + c * checkW, finishScreenY, checkW, 14);
            }

            // Cổng chào ĐÍCH (FINISH ARCH)
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(fx - halfRoad - 18, finishScreenY - 70, 16, 80);
            ctx.fillRect(fx + halfRoad + 2, finishScreenY - 70, 16, 80);
            ctx.fillRect(fx - halfRoad - 18, finishScreenY - 75, roadW + 36, 18);

            ctx.fillStyle = '#000000';
            ctx.font = 'bold 16px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🏁 FINISH LINE 🏁', fx, finishScreenY - 61);
        }
    }

    getRoadCenterAt(y, cameraY) {
        const curve = this.getCurvatureAt(y);
        const dist = y - cameraY;
        return curve * dist * 0.35;
    }

    renderSkidMarks(ctx, cameraY, screenCenterX, carScreenY) {
        for (const s of this.skidMarks) {
            const sy = carScreenY - (s.y - cameraY);
            const curve = this.getRoadCenterAt(s.y, cameraY);
            const sx = screenCenterX + curve + s.x;

            ctx.fillStyle = `rgba(15, 23, 42, ${Math.max(0, s.life * 0.35)})`;
            ctx.fillRect(sx - 3, sy - 4, 6, 8);
        }
    }

    renderObstacles(ctx, cameraY, screenCenterX, carScreenY) {
        for (const obs of this.obstacles) {
            if (obs.collected) continue;

            const sy = carScreenY - (obs.y - cameraY);
            if (sy < -60 || sy > this.height + 60) continue;

            const curve = this.getRoadCenterAt(obs.y, cameraY);
            const sx = screenCenterX + curve + obs.x;

            this.drawObstacle(ctx, obs, sx, sy);
        }
    }

    drawObstacle(ctx, obs, sx, sy) {
        ctx.save();
        ctx.translate(sx, sy);

        switch (obs.type) {
            case 'cone':
                // Chóp nón giao thông cam
                ctx.fillStyle = '#ea580c';
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2);
                ctx.lineTo(obs.width / 2, obs.height / 2);
                ctx.lineTo(-obs.width / 2, obs.height / 2);
                ctx.closePath();
                ctx.fill();
                // Vạch trắng phản quang
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-obs.width / 3, -4, obs.width * 0.66, 6);
                break;

            case 'car_civilian':
                // Xe dân sự đi đường
                this.drawCarBody(ctx, obs.color, obs.width, obs.height, 0, 'CIVILIAN');
                break;

            case 'police':
                // Xe cảnh sát nhấp nháy đèn xanh đỏ
                this.drawCarBody(ctx, '#0f172a', obs.width, obs.height, 0, 'POLICE');
                const flash = (Math.floor(Date.now() / 150) % 2 === 0);
                ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
                ctx.fillRect(-10, -5, 8, 8);
                ctx.fillStyle = flash ? '#3b82f6' : '#ef4444';
                ctx.fillRect(2, -5, 8, 8);
                break;

            case 'oil_slick':
                // Vệt dầu đen bóng loang lổ
                ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case 'barrier':
                // Rào chắn sọc chéo đỏ trắng
                ctx.fillStyle = '#dc2626';
                ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
                ctx.fillStyle = '#ffffff';
                for (let i = -obs.width / 2; i < obs.width / 2; i += 16) {
                    ctx.fillRect(i, -obs.height / 2, 8, obs.height);
                }
                break;

            case 'sand_trap':
                ctx.fillStyle = 'rgba(217, 119, 6, 0.75)';
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'water_puddle':
                ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'boulder':
                // Hòn đá núi
                ctx.fillStyle = '#78716c';
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#a8a29e';
                ctx.beginPath();
                ctx.arc(-4, -4, obs.width / 3, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'pothole':
                ctx.fillStyle = '#020617';
                ctx.beginPath();
                ctx.ellipse(0, 0, obs.width / 2, obs.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                break;

            case 'spike_strip':
                ctx.fillStyle = '#475569';
                ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
                ctx.fillStyle = '#e2e8f0';
                for (let i = -obs.width / 2 + 4; i < obs.width / 2 - 4; i += 8) {
                    ctx.fillRect(i, -obs.height / 2 - 4, 3, 6);
                }
                break;

            case 'boost_pad':
                // Tấm đệm tăng tốc mũi tên Neon
                ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
                ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
                ctx.fillStyle = '#10b981';
                ctx.beginPath();
                ctx.moveTo(0, -obs.height / 2 + 4);
                ctx.lineTo(obs.width / 2 - 4, obs.height / 2 - 4);
                ctx.lineTo(-obs.width / 2 + 4, obs.height / 2 - 4);
                ctx.closePath();
                ctx.fill();
                break;

            case 'nitro_pickup':
                // Bình Nitro phát sáng
                ctx.fillStyle = '#00d2ff';
                ctx.fillRect(-10, -14, 20, 28);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-5, -17, 10, 4);
                ctx.fillStyle = '#0f172a';
                ctx.font = 'bold 9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('N2O', 0, 4);
                break;

            case 'wrench_pickup':
                // Cờ lê sửa chữa
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(-4, -14, 8, 28);
                ctx.fillRect(-10, -14, 20, 8);
                break;

            case 'fire_hazard':
                // Vết lửa dung nham
                ctx.fillStyle = '#f97316';
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(0, 0, obs.width / 3, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    renderCar(ctx, car, cameraY, screenCenterX, carScreenY, isOpponent) {
        const sy = carScreenY - (car.y - cameraY);
        // Nếu ngoài màn hình quá xa thì bỏ qua vẽ
        if (sy < -120 || sy > this.height + 120) return;

        const curve = this.getRoadCenterAt(car.y, cameraY);
        const sx = screenCenterX + curve + car.x;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate((car.angle || 0) + (car.spinAngle || 0));

        // Vẽ bóng xe trên mặt đường
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(3, 4, 22, 36, 0, 0, Math.PI * 2);
        ctx.fill();

        // Vẽ thân xe thể thao sắc nét
        this.drawCarBody(ctx, car.color, 40, 72, car.angle, car.id);

        // Đèn hậu phanh khi phanh
        if (!isOpponent && this.keys.down) {
            ctx.fillStyle = '#ff0000';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 12;
            ctx.fillRect(-14, 32, 8, 4);
            ctx.fillRect(6, 32, 8, 4);
            ctx.shadowBlur = 0;
        }

        // Đèn pha phía trước
        ctx.fillStyle = 'rgba(255, 255, 200, 0.4)';
        ctx.beginPath();
        ctx.moveTo(-12, -36);
        ctx.lineTo(-28, -120);
        ctx.lineTo(-4, -120);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(12, -36);
        ctx.lineTo(4, -120);
        ctx.lineTo(28, -120);
        ctx.closePath();
        ctx.fill();

        // Nhãn tên người chơi trên nóc xe
        ctx.rotate(-((car.angle || 0) + (car.spinAngle || 0))); // Giữ text thẳng đứng
        ctx.fillStyle = isOpponent ? '#00d2ff' : '#ff3344';
        ctx.font = 'bold 12px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(car.name, 0, -48);
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    // Vẽ chi tiết xe thể thao (Canvas 2D Vector)
    drawCarBody(ctx, mainColor, w, h, angle, tag) {
        const halfW = w / 2;
        const halfH = h / 2;

        // Bánh xe (4 bánh cao su đen)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-halfW - 3, -halfH + 8, 6, 16);
        ctx.fillRect(halfW - 3, -halfH + 8, 6, 16);
        ctx.fillRect(-halfW - 3, halfH - 24, 6, 16);
        ctx.fillRect(halfW - 3, halfH - 24, 6, 16);

        // Khung thân xe
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.roundRect(-halfW, -halfH, w, h, 10);
        ctx.fill();

        // Sọc đua thể thao dọc nắp capo (Racing stripes)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -halfH, 6, h);

        // Kính chắn gió trước & sau (Windshields)
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-halfW + 5, -halfH + 16, w - 10, 16, 4);
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(-halfW + 6, halfH - 22, w - 12, 12, 3);
        ctx.fill();

        // Mui nóc xe
        ctx.fillStyle = mainColor;
        ctx.beginPath();
        ctx.roundRect(-halfW + 6, -halfH + 30, w - 12, 20, 4);
        ctx.fill();

        // Cánh gió đuôi thể thao (Rear Spoiler)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(-halfW + 2, halfH - 4, w - 4, 6);
    }

    renderParticles(ctx, cameraY, screenCenterX, carScreenY) {
        for (const p of this.particles) {
            const sy = carScreenY - (p.y - cameraY);
            const curve = this.getRoadCenterAt(p.y, cameraY);
            const sx = screenCenterX + curve + p.x;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath();
            ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }

    renderWeatherOverlay(ctx, w, h) {
        const weather = this.levelConfig.theme.weather;

        if (weather === 'rain' || weather === 'storm') {
            // Hiệu ứng giọt mưa rơi
            ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)';
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 70; i++) {
                const rx = Math.random() * w;
                const ry = Math.random() * h;
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(rx - 8, ry + 24);
                ctx.stroke();
            }

            // Sấm chớp giật sáng ngẫu nhiên
            if (weather === 'storm' && Math.random() < 0.015) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.fillRect(0, 0, w, h);
            }
        } else if (weather === 'fog') {
            // Sương mù đêm
            ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
            ctx.fillRect(0, 0, w, h);
        } else if (weather === 'sandstorm') {
            // Bão cát vàng
            ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
            ctx.fillRect(0, 0, w, h);
        } else if (weather === 'inferno') {
            // Tàn tro đỏ bay
            ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.fillRect(0, 0, w, h);
        }
    }

    renderCountdown(ctx, w, h) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = 'bold 96px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.countdownValue > 0) {
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 24;
            ctx.fillText(this.countdownValue, w / 2, h / 2);
        } else {
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 30;
            ctx.fillText('GO !', w / 2, h / 2);
        }
        ctx.restore();
    }

    pauseForOpponent() {
        if (this.car.speed > 0) {
            this.car.speed = 0;
        }
    }
}

window.RacingGame = RacingGame;
