/**
 * Quản lý kết nối Socket và đồng bộ thời gian thực
 */
class SocketClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.playerId = null;
        this.roomId = null;
        this.isHost = false;
        this.ping = 0;
        this.pingTimer = null;
        this.onStateChange = null;
        this.onOpponentUpdate = null;
        this.onCountdown = null;
        this.onLevelFinish = null;
        this.onLevelChanged = null;
        this.onGameEvent = null;
        this.onChatEmote = null;
        this.players = [];
    }

    connect(customHost = null) {
        return new Promise((resolve, reject) => {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            let wsUrl;
            if (customHost) {
                wsUrl = (customHost.startsWith('ws://') || customHost.startsWith('wss://'))
                    ? customHost
                    : `${protocol}//${customHost}/ws`;
            } else {
                const host = window.location.host || 'localhost:8000';
                wsUrl = `${protocol}//${host}/ws`;
            }

            console.log(`[Socket] Đang kết nối tới ${wsUrl}...`);

            try {
                this.ws = new WebSocket(wsUrl);
            } catch (err) {
                return reject(err);
            }

            this.ws.onopen = () => {
                this.connected = true;
                console.log("[Socket] Đã kết nối thành công!");
                this.startPing();
                resolve();
            };

            this.ws.onmessage = (event) => {
                this.handleMessage(event.data);
            };

            this.ws.onclose = () => {
                this.connected = false;
                this.stopPing();
                console.warn("[Socket] Mất kết nối máy chủ");
                if (window.ui) {
                    window.ui.showToast("Mất kết nối máy chủ! Đang thử kết nối lại...", "error");
                }
            };

            this.ws.onerror = (err) => {
                console.error("[Socket] Lỗi:", err);
                reject(err);
            };
        });
    }

    startPing() {
        this.stopPing();
        this.pingTimer = setInterval(() => {
            if (this.connected && this.ws.readyState === WebSocket.OPEN) {
                this.send({
                    type: 'ping',
                    clientTime: Date.now()
                });
            }
        }, 2000);
    }

    stopPing() {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    send(data) {
        if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }

    joinRoom(roomId, playerName, deviceType, preferHost = false) {
        this.send({
            type: 'join',
            room: roomId,
            name: playerName,
            device: deviceType,
            preferHost: preferHost
        });
    }

    toggleReady() {
        this.send({ type: 'toggle_ready' });
    }

    sendState(x, y, speed, angle, nitro, health) {
        this.send({
            type: 'update_state',
            x,
            y,
            speed,
            angle,
            nitro,
            health
        });
    }

    sendEvent(eventName, payload = {}) {
        this.send({
            type: 'event',
            event: eventName,
            payload
        });
    }

    sendFinish(time) {
        this.send({
            type: 'finish_level',
            time
        });
    }

    requestNextLevel() {
        this.send({ type: 'request_next_level' });
    }

    restartGame() {
        this.send({ type: 'restart_game' });
    }

    jumpLevel(targetLevel) {
        this.send({
            type: 'jump_level',
            targetLevel
        });
    }

    sendEmote(emote) {
        this.send({
            type: 'chat_emote',
            emote
        });
    }

    handleMessage(raw) {
        try {
            const data = JSON.parse(raw);
            const type = data.type;

            if (type === 'pong') {
                const now = Date.now();
                this.ping = Math.max(1, Math.round((now - data.clientTime) / 2));
                if (window.ui) window.ui.updatePing(this.ping);
                return;
            }

            if (type === 'joined') {
                this.playerId = data.playerId;
                this.roomId = data.roomId;
                this.isHost = (this.playerId === 'p1');
                this.players = data.players || [];
                if (window.ui) {
                    window.ui.onRoomJoined(data);
                }
                return;
            }

            if (type === 'player_joined') {
                this.players = data.players || [];
                if (window.ui) {
                    window.ui.onPlayerUpdate(this.players);
                    window.ui.showToast(`${data.player.name} đã vào phòng!`, 'info');
                }
                return;
            }

            if (type === 'ready_status') {
                this.players = data.players || [];
                if (window.ui) {
                    window.ui.onPlayerUpdate(this.players);
                }
                return;
            }

            if (type === 'countdown_start') {
                this.players = data.players || [];
                if (this.onCountdown) this.onCountdown(data);
                return;
            }

            if (type === 'opponent_state') {
                if (this.onOpponentUpdate) this.onOpponentUpdate(data);
                return;
            }

            if (type === 'game_event') {
                if (this.onGameEvent) this.onGameEvent(data);
                return;
            }

            if (type === 'player_finished') {
                if (window.ui) {
                    window.ui.onPlayerFinishSingle(data);
                }
                return;
            }

            if (type === 'all_finished') {
                if (this.onLevelFinish) this.onLevelFinish(data);
                return;
            }

            if (type === 'level_changed') {
                this.players = data.players || [];
                if (this.onLevelChanged) this.onLevelChanged(data);
                return;
            }

            if (type === 'game_completed') {
                if (window.ui) window.ui.showGrandChampion(data);
                return;
            }

            if (type === 'game_restarted') {
                this.players = data.players || [];
                if (this.onLevelChanged) this.onLevelChanged(data);
                return;
            }

            if (type === 'player_left') {
                this.players = data.players || [];
                if (window.ui) {
                    window.ui.onPlayerUpdate(this.players);
                    window.ui.showToast(`Người chơi ${data.name} đã rời phòng.`, 'warning');
                }
                if (window.game) {
                    window.game.pauseForOpponent();
                }
                return;
            }

            if (type === 'chat_emote') {
                if (this.onChatEmote) this.onChatEmote(data);
                return;
            }

            if (type === 'error') {
                alert(data.message || 'Lỗi từ máy chủ');
                return;
            }
        } catch (e) {
            console.error("[Socket] Message parsing error:", e);
        }
    }
}

window.socketClient = new SocketClient();
