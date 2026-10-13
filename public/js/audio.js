/**
 * Hệ thống âm thanh Procedural Web Audio API
 * Tự động tổng hợp âm thanh đua xe chân thực, không cần tải bất kỳ file mp3 ngoài nào.
 */
class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.engineOsc = null;
        this.engineGain = null;
        this.isEngineRunning = false;
        this.driftOsc = null;
        this.driftGain = null;
        this.isDrifting = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopEngine();
            this.stopDrift();
        }
        return this.muted;
    }

    // Tiếng gầm rú động cơ xe
    startEngine() {
        if (this.muted || this.isEngineRunning) return;
        this.init();

        try {
            // Oscillator 1: Tần số rung động cơ chính (sawtooth)
            this.engineOsc = this.ctx.createOscillator();
            this.engineOsc.type = 'sawtooth';
            this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

            // Filter cắt tần số cao tạo độ trầm ấm cho bô xe
            this.engineFilter = this.ctx.createBiquadFilter();
            this.engineFilter.type = 'lowpass';
            this.engineFilter.frequency.setValueAtTime(350, this.ctx.currentTime);

            // Gain âm lượng
            this.engineGain = this.ctx.createGain();
            this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

            this.engineOsc.connect(this.engineFilter);
            this.engineFilter.connect(this.engineGain);
            this.engineGain.connect(this.ctx.destination);

            this.engineOsc.start();
            this.isEngineRunning = true;
        } catch (e) {
            console.warn("Audio init deferred", e);
        }
    }

    updateEngine(speed, maxSpeed, isAccelerating) {
        if (!this.isEngineRunning || this.muted || !this.ctx) return;
        const ratio = Math.max(0, Math.min(1, speed / (maxSpeed || 200)));
        const targetFreq = 45 + ratio * 130 + (isAccelerating ? 25 : 0);
        const targetVol = 0.05 + ratio * 0.12;

        const t = this.ctx.currentTime;
        this.engineOsc.frequency.setTargetAtTime(targetFreq, t, 0.08);
        this.engineFilter.frequency.setTargetAtTime(320 + ratio * 600, t, 0.08);
        this.engineGain.gain.setTargetAtTime(targetVol, t, 0.08);
    }

    stopEngine() {
        if (this.engineOsc) {
            try {
                this.engineOsc.stop();
                this.engineOsc.disconnect();
            } catch (e) {}
            this.engineOsc = null;
            this.isEngineRunning = false;
        }
    }

    // Tiếng rít lốp khi drift hoặc cua gắt
    startDrift() {
        if (this.muted || this.isDrifting || !this.ctx) return;
        try {
            const bufferSize = this.ctx.sampleRate * 0.2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            this.driftNode = this.ctx.createBufferSource();
            this.driftNode.buffer = buffer;
            this.driftNode.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
            filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

            this.driftGain = this.ctx.createGain();
            this.driftGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

            this.driftNode.connect(filter);
            filter.connect(this.driftGain);
            this.driftGain.connect(this.ctx.destination);

            this.driftNode.start();
            this.isDrifting = true;
        } catch (e) {}
    }

    stopDrift() {
        if (this.driftNode) {
            try {
                this.driftNode.stop();
                this.driftNode.disconnect();
            } catch (e) {}
            this.driftNode = null;
            this.isDrifting = false;
        }
    }

    // Tiếng phun lửa Nitro
    playNitro() {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.4);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        } catch (e) {}
    }

    // Tiếng va chạm mạnh (Crash / Húc chướng ngại vật)
    playCrash() {
        if (this.muted) return;
        this.init();
        try {
            // White noise burst
            const bufferSize = this.ctx.sampleRate * 0.35;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(400, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start();
        } catch (e) {}
    }

    // Tiếng nhặt vật phẩm / Boost pad
    playPickup(isBoost = false) {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';

            const startFreq = isBoost ? 440 : 587.33; // A4 or D5
            const endFreq = isBoost ? 880 : 1174.66;  // A5 or D6

            osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.2);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.25);
        } catch (e) {}
    }

    // Tiếng đếm ngược 3... 2... 1... GO!
    playCountdown(isGo = false) {
        if (this.muted) return;
        this.init();
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';

            const freq = isGo ? 1200 : 600;
            const duration = isGo ? 0.45 : 0.2;

            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    // Tiếng vỗ tay / Chiến thắng
    playVictory() {
        if (this.muted) return;
        this.init();
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

                    osc.connect(gain);
                    gain.connect(this.ctx.destination);

                    osc.start();
                    osc.stop(this.ctx.currentTime + 0.35);
                } catch (e) {}
            }, idx * 120);
        });
    }
}

window.sound = new SoundManager();
