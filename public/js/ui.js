/**
 * Quản lý Giao diện Người dùng (Lobby, HUD, Mini-map, Kết quả & QR Code)
 */
class UIManager {
    constructor() {
        this.currentScreen = 'lobby';
        this.myPlayerId = null;
        this.totalLevels = 10;
        this.init();
    }

    init() {
        this.bindEvents();
        this.detectDevice();
        this.setupLANInfo();
        this.setupSocketCallbacks();
    }

    setupSocketCallbacks() {
        window.socketClient.onLevelFinish = (data) => {
            const modal = document.getElementById('finishModal');
            const title = document.getElementById('finishTitle');
            const details = document.getElementById('finishDetails');
            const nextBtn = document.getElementById('btnNextLevel');

            const p1Time = data.finishTimes.p1 ? `${data.finishTimes.p1.toFixed(2)}s` : 'Chưa xong';
            const p2Time = data.finishTimes.p2 ? `${data.finishTimes.p2.toFixed(2)}s` : 'Chưa xong';

            const p1Score = data.scores.p1 || 0;
            const p2Score = data.scores.p2 || 0;

            title.innerText = `🏁 HOÀN THÀNH LEVEL ${data.level}! 🏁`;
            details.innerHTML = `
                <div style="background: rgba(30,41,59,0.7); border-radius: 10px; padding: 12px; margin-bottom: 12px; text-align: left;">
                    <p style="margin-bottom: 8px;"><strong>🏎️ Tay đua 1 (Đỏ):</strong> ${p1Time} &bull; Điểm: <span style="color: var(--neon-red); font-weight: bold;">${p1Score}</span></p>
                    <p><strong>🏎️ Tay đua 2 (Xanh):</strong> ${p2Time} &bull; Điểm: <span style="color: var(--neon-blue); font-weight: bold;">${p2Score}</span></p>
                </div>
            `;

            if (data.isLastLevel) {
                nextBtn.innerText = 'XEM LỄ TRAO CÚP VÔ ĐỊCH 🏆';
            } else {
                nextBtn.innerText = `TIẾP TỤC LEVEL ${data.level + 1} ⏩`;
            }

            modal.style.display = 'flex';
        };
    }

    getInviteUrl(roomCode = null) {
        const code = roomCode || (document.getElementById('roomInput') ? document.getElementById('roomInput').value.trim() : 'ROOM-1') || 'ROOM-1';
        return `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(code)}`;
    }

    detectDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
        const deviceSelect = document.getElementById('deviceType');
        if (deviceSelect) {
            deviceSelect.value = isMobile ? 'Mobile' : 'PC';
        }
        const touchControls = document.getElementById('touchControls');
        if (touchControls) {
            touchControls.style.display = isMobile ? 'flex' : 'none';
        }

        // Kiểm tra tham số URL ?room=...
        const urlParams = new URLSearchParams(window.location.search);
        const roomParam = urlParams.get('room');
        const roleBadgeText = document.getElementById('roleBadgeText');
        const roleBadgeSub = document.getElementById('roleBadgeSub');
        const nameInput = document.getElementById('nameInput');
        const roomInput = document.getElementById('roomInput');
        const btnJoin = document.getElementById('btnJoin');

        if (roomParam) {
            // Tham gia phòng của Máy chủ qua link mời
            if (roomInput) roomInput.value = roomParam.trim().toUpperCase();
            if (roleBadgeText) {
                roleBadgeText.className = 'role-badge guest';
                roleBadgeText.innerText = `⚡ ĐÃ KẾT NỐI VÀO PHÒNG CỦA MÁY CHỦ: ${roomParam.toUpperCase()}`;
            }
            if (roleBadgeSub) {
                roleBadgeSub.innerText = isMobile
                    ? 'Bạn đang truy cập từ Điện thoại. Bạn sẽ là Người chơi 2 (Xe Xanh) đối đầu với Máy chủ.'
                    : 'Bạn đang truy cập qua link mời. Bạn sẽ là Người chơi 2 (Xe Xanh).';
            }
            if (nameInput && !nameInput.value) {
                nameInput.value = isMobile ? 'Tay đua Di động' : 'Người chơi 2 (Xanh)';
            }
            if (btnJoin) {
                btnJoin.innerText = '⚡ VÀO ĐUA CÙNG MÁY CHỦ 🏎️';
            }
        } else if (!isMobile) {
            // Máy tính vào trang web -> Ưu tiên làm MÁY CHỦ
            if (roleBadgeText) {
                roleBadgeText.className = 'role-badge host';
                roleBadgeText.innerText = '👑 ƯU TIÊN MÁY CHỦ (PC) - TỰ ĐỘNG KHỞI TẠO PHÒNG';
            }
            if (roleBadgeSub) {
                roleBadgeSub.innerText = 'Bạn đang dùng Máy tính. Bạn sẽ làm Máy chủ (Xe Đỏ - P1) để người chơi 2 kết nối bằng link tên miền.';
            }
            if (nameInput && !nameInput.value) {
                nameInput.value = 'Chủ Phòng (Đỏ)';
            }
            if (btnJoin) {
                btnJoin.innerText = '👑 KHỞI TẠO MÁY CHỦ & VÀO ĐUA 🏎️';
            }
        } else {
            // Điện thoại vào thẳng không có ?room
            if (roleBadgeText) {
                roleBadgeText.className = 'role-badge guest';
                roleBadgeText.innerText = '📱 THIẾT BỊ DI ĐỘNG (MOBILE)';
            }
            if (roleBadgeSub) {
                roleBadgeSub.innerText = 'Nhập mã phòng hoặc quét mã QR từ màn hình Máy chủ PC để vào đua.';
            }
            if (nameInput && !nameInput.value) {
                nameInput.value = 'Tay đua Di động';
            }
        }
    }

    setupLANInfo() {
        const inviteUrl = this.getInviteUrl();
        const ipDisplay = document.getElementById('lanUrlText');
        if (ipDisplay) {
            ipDisplay.innerText = inviteUrl;
        }

        // Vẽ mã QR để điện thoại quét vào phòng ngay lập tức
        const qrCanvas = document.getElementById('qrCanvas');
        if (qrCanvas && window.renderQRCode) {
            try {
                window.renderQRCode(qrCanvas, inviteUrl, { size: 140 });
            } catch (e) {
                console.warn("QR generation deferred", e);
            }
        }

        // Cập nhật link & QR khi đổi mã phòng
        const roomInput = document.getElementById('roomInput');
        if (roomInput) {
            roomInput.addEventListener('input', () => {
                const newUrl = this.getInviteUrl();
                if (ipDisplay) ipDisplay.innerText = newUrl;
                if (qrCanvas && window.renderQRCode) {
                    try { window.renderQRCode(qrCanvas, newUrl, { size: 140 }); } catch (e) {}
                }
            });
        }
    }

    bindEvents() {
        // Nút Tham gia phòng
        const btnJoin = document.getElementById('btnJoin');
        if (btnJoin) {
            btnJoin.addEventListener('click', () => {
                const room = document.getElementById('roomInput').value.trim() || 'ROOM-1';
                const name = document.getElementById('nameInput').value.trim() || 'Tay đua';
                const device = document.getElementById('deviceType').value;

                btnJoin.disabled = true;
                btnJoin.innerText = 'Đang kết nối...';

                window.socketClient.connect()
                    .then(() => {
                        window.socketClient.joinRoom(room, name, device);
                    })
                    .catch((err) => {
                        alert('Không thể kết nối đến máy chủ Socket! Hãy đảm bảo server.py đang chạy.');
                        btnJoin.disabled = false;
                        btnJoin.innerText = 'VÀO PHÒNG';
                    });
            });
        }

        // Nút Sẵn sàng
        const btnReady = document.getElementById('btnReady');
        if (btnReady) {
            btnReady.addEventListener('click', () => {
                window.sound.init();
                window.socketClient.toggleReady();
            });
        }

        // Nút Bật/Tắt âm thanh
        const btnSound = document.getElementById('btnSound');
        if (btnSound) {
            btnSound.addEventListener('click', () => {
                const muted = window.sound.toggleMute();
                btnSound.innerText = muted ? '🔇 Tắt tiếng' : '🔊 Âm thanh';
                btnSound.classList.toggle('muted', muted);
            });
        }

        // Nút Toàn màn hình (Fullscreen - hữu ích trên điện thoại)
        const btnFullscreen = document.getElementById('btnFullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        // Nút Chuyển Màn tiếp theo (sau khi cán đích)
        const btnNextLevel = document.getElementById('btnNextLevel');
        if (btnNextLevel) {
            btnNextLevel.addEventListener('click', () => {
                window.socketClient.requestNextLevel();
            });
        }

        // Nút Đua lại (Restart)
        const btnRestart = document.getElementById('btnRestart');
        if (btnRestart) {
            btnRestart.addEventListener('click', () => {
                window.socketClient.restartGame();
            });
        }

        // Nút Gửi Emote nhanh
        document.querySelectorAll('.emote-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const emote = btn.getAttribute('data-emote');
                window.socketClient.sendEmote(emote);
                this.showEmoteBubble(this.myPlayerId, emote);
            });
        });

        // Nút copy link ở màn hình đăng nhập
        const btnCopyLink = document.getElementById('btnCopyLink');
        if (btnCopyLink) {
            btnCopyLink.addEventListener('click', () => {
                navigator.clipboard.writeText(this.getInviteUrl());
                this.showToast('Đã sao chép link mời người chơi 2!', 'success');
            });
        }

        // Nút copy link ở phòng chờ
        const btnCopyLobbyLink = document.getElementById('btnCopyLobbyLink');
        if (btnCopyLobbyLink) {
            btnCopyLobbyLink.addEventListener('click', () => {
                const room = document.getElementById('displayRoomCode') ? document.getElementById('displayRoomCode').innerText : 'ROOM-1';
                navigator.clipboard.writeText(this.getInviteUrl(room));
                this.showToast('Đã sao chép link mời người chơi 2!', 'success');
            });
        }

        // Nút chuyển chế độ cảm ứng thủ công
        const btnToggleTouch = document.getElementById('btnToggleTouch');
        if (btnToggleTouch) {
            btnToggleTouch.addEventListener('click', () => {
                const touchControls = document.getElementById('touchControls');
                const isHidden = touchControls.style.display === 'none';
                touchControls.style.display = isHidden ? 'flex' : 'none';
                this.showToast(isHidden ? 'Đã bật phím cảm ứng' : 'Đã ẩn phím cảm ứng', 'info');
            });
        }
    }

    onRoomJoined(data) {
        this.myPlayerId = data.playerId;
        document.getElementById('loginCard').style.display = 'none';
        document.getElementById('lobbyCard').style.display = 'block';
        document.getElementById('displayRoomCode').innerText = data.roomId;

        // Cập nhật link và QR trong phòng chờ để mời người chơi 2
        const lobbyUrl = this.getInviteUrl(data.roomId);
        const lobbyUrlEl = document.getElementById('lobbyInviteUrl');
        if (lobbyUrlEl) {
            lobbyUrlEl.innerText = lobbyUrl;
        }
        const qrLobby = document.getElementById('qrCanvasLobby');
        if (qrLobby && window.renderQRCode) {
            try {
                window.renderQRCode(qrLobby, lobbyUrl, { size: 110 });
            } catch (e) {
                console.warn("Lobby QR failed", e);
            }
        }

        this.onPlayerUpdate(data.players);
        this.renderLevelSelector(data.level);

        const roleName = data.playerId === 'p1' ? '👑 Máy chủ (Xe Đỏ - P1)' : '⚡ Người chơi 2 (Xe Xanh - P2)';
        this.showToast(`Bạn đã vào phòng với tư cách ${roleName}!`, 'success');
    }

    onPlayerUpdate(players) {
        const p1Card = document.getElementById('player1Card');
        const p2Card = document.getElementById('player2Card');
        const readyBtn = document.getElementById('btnReady');
        const lobbyInviteBox = document.getElementById('lobbyInviteBox');

        const p1 = players.find(p => p.id === 'p1');
        const p2 = players.find(p => p.id === 'p2');

        if (lobbyInviteBox) {
            if (p1 && p2) {
                lobbyInviteBox.style.display = 'none';
            } else {
                lobbyInviteBox.style.display = 'flex';
            }
        }

        if (p1) {
            p1Card.classList.remove('empty');
            p1Card.querySelector('.player-name').innerText = p1.name;
            p1Card.querySelector('.player-device').innerText = p1.device === 'Mobile' ? '📱 Điện thoại' : '🖥️ Máy tính';
            p1Card.querySelector('.player-status').innerText = p1.ready ? '✅ ĐÃ SẴN SÀNG' : '⏳ ĐANG CHỜ';
            p1Card.querySelector('.player-status').className = `player-status ${p1.ready ? 'ready' : 'waiting'}`;
        } else {
            p1Card.classList.add('empty');
            p1Card.querySelector('.player-name').innerText = 'Đang chờ Người chơi 1...';
            p1Card.querySelector('.player-device').innerText = '';
            p1Card.querySelector('.player-status').innerText = 'CHƯA VÀO';
        }

        if (p2) {
            p2Card.classList.remove('empty');
            p2Card.querySelector('.player-name').innerText = p2.name;
            p2Card.querySelector('.player-device').innerText = p2.device === 'Mobile' ? '📱 Điện thoại' : '🖥️ Máy tính';
            p2Card.querySelector('.player-status').innerText = p2.ready ? '✅ ĐÃ SẴN SÀNG' : '⏳ ĐANG CHỜ';
            p2Card.querySelector('.player-status').className = `player-status ${p2.ready ? 'ready' : 'waiting'}`;
        } else {
            p2Card.classList.add('empty');
            p2Card.querySelector('.player-name').innerText = 'Đang chờ Người chơi 2...';
            p2Card.querySelector('.player-device').innerText = '';
            p2Card.querySelector('.player-status').innerText = 'CHƯA VÀO';
        }

        // Cập nhật trạng thái nút của bản thân
        const me = players.find(p => p.id === this.myPlayerId);
        if (me && readyBtn) {
            if (me.ready) {
                readyBtn.innerText = 'HỦY SẴN SÀNG';
                readyBtn.classList.add('ready-active');
            } else {
                readyBtn.innerText = 'SẴN SÀNG ĐUA !';
                readyBtn.classList.remove('ready-active');
            }
        }
    }

    renderLevelSelector(currentLevel) {
        const container = document.getElementById('levelList');
        if (!container || !window.GAME_LEVELS) return;

        container.innerHTML = '';
        window.GAME_LEVELS.forEach((lvl) => {
            const btn = document.createElement('button');
            btn.className = `level-pill ${lvl.level === currentLevel ? 'active' : ''}`;
            btn.innerHTML = `<span class="lvl-num">L${lvl.level}</span> <span class="lvl-title">${lvl.title.split(':')[1] || lvl.title}</span>`;
            btn.title = lvl.description;

            btn.addEventListener('click', () => {
                window.socketClient.jumpLevel(lvl.level);
            });
            container.appendChild(btn);
        });
    }

    showGameScreen() {
        this.currentScreen = 'game';
        document.getElementById('lobbyOverlay').style.display = 'none';
        document.getElementById('gameHUD').style.display = 'flex';
        document.getElementById('finishModal').style.display = 'none';
        document.getElementById('championModal').style.display = 'none';
    }

    updateHUDLevel(levelConfig) {
        document.getElementById('hudLevelNum').innerText = `LEVEL ${levelConfig.level} / 10`;
        document.getElementById('hudLevelTitle').innerText = levelConfig.title;
    }

    updateHUD(car, opponent, trackLength, elapsedTime) {
        // Tốc độ số
        const speedVal = Math.round(car.speed);
        document.getElementById('hudSpeedNum').innerText = speedVal;

        // Vạch kim tốc kế (Góc quay từ -120 đến +120 độ)
        const ratio = Math.min(1, speedVal / (car.maxSpeed || 200));
        const gaugeNeedle = document.getElementById('gaugeNeedle');
        if (gaugeNeedle) {
            gaugeNeedle.style.transform = `rotate(${-120 + ratio * 240}deg)`;
        }

        // Cấp số (Gears)
        let gear = 'N';
        if (speedVal > 0) {
            gear = Math.min(6, Math.max(1, Math.ceil(speedVal / 38)));
        }
        document.getElementById('hudGear').innerText = `GEAR: ${gear}`;

        // Thanh Nitro
        const nitroBar = document.getElementById('hudNitroBar');
        if (nitroBar) {
            nitroBar.style.width = `${Math.max(0, Math.min(100, car.nitro))}%`;
        }

        // Thanh Độ bền (Health)
        const healthBar = document.getElementById('hudHealthBar');
        if (healthBar) {
            healthBar.style.width = `${Math.max(0, Math.min(100, car.health))}%`;
            if (car.health < 30) healthBar.style.background = '#ef4444';
            else healthBar.style.background = '#22c55e';
        }

        // Đồng hồ thời gian
        const mins = Math.floor(elapsedTime / 60);
        const secs = (elapsedTime % 60).toFixed(2);
        document.getElementById('hudTimer').innerText = `${mins.toString().padStart(2, '0')}:${secs.padStart(5, '0')}`;

        // Mini-map & Quãng đường đua
        const myProgress = Math.min(100, (car.y / trackLength) * 100);
        const oppProgress = Math.min(100, (opponent.y / trackLength) * 100);

        const myMarker = document.getElementById('miniMyCar');
        const oppMarker = document.getElementById('miniOppCar');
        if (myMarker) myMarker.style.left = `${myProgress}%`;
        if (oppMarker) oppMarker.style.left = `${oppProgress}%`;

        // Khoảng cách giữa 2 xe (Gap)
        const gapMeters = Math.round(car.y - opponent.y);
        const gapDisplay = document.getElementById('hudGap');
        if (gapDisplay) {
            if (gapMeters > 0) {
                gapDisplay.innerHTML = `<span class="gap-ahead">Dẫn trước: +${gapMeters}m</span>`;
            } else if (gapMeters < 0) {
                gapDisplay.innerHTML = `<span class="gap-behind">Sau đối thủ: ${gapMeters}m</span>`;
            } else {
                gapDisplay.innerHTML = `<span>Ngang hàng: 0m</span>`;
            }
        }
    }

    updatePing(ms) {
        const pingEl = document.getElementById('hudPing');
        if (pingEl) {
            pingEl.innerText = `${ms} ms`;
            pingEl.className = ms < 60 ? 'ping-good' : (ms < 140 ? 'ping-ok' : 'ping-bad');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-msg toast-${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    showEmoteBubble(playerId, emote) {
        const bubble = document.createElement('div');
        bubble.className = `emote-bubble ${playerId === 'p1' ? 'p1' : 'p2'}`;
        bubble.innerText = emote;
        document.body.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, 2200);
    }

    onPlayerFinishSingle(data) {
        const isMe = (data.playerId === this.myPlayerId);
        const rankStr = data.rank === 1 ? '🥇 HẠNG 1' : '🥈 HẠNG 2';
        this.showToast(`${isMe ? 'BẠN' : 'ĐỐI THỦ'} ĐÃ VỀ ĐÍCH: ${rankStr} (${data.time.toFixed(2)}s)!`, 'success');
    }

    onLevelChanged(data) {
        document.getElementById('finishModal').style.display = 'none';
        document.getElementById('championModal').style.display = 'none';
        document.getElementById('lobbyOverlay').style.display = 'flex';
        document.getElementById('gameHUD').style.display = 'none';

        this.renderLevelSelector(data.level);
        this.onPlayerUpdate(data.players);
        this.showToast(`Bắt đầu Level ${data.level}! Hãy nhấn SẴN SÀNG để đua tiếp.`, 'info');
    }

    showGrandChampion(data) {
        const modal = document.getElementById('championModal');
        const isWinner = (data.winner === this.myPlayerId);
        document.getElementById('championTitle').innerText = isWinner ? '🏆 BẠN LÀ NHÀ VÔ ĐỊCH GRAND PRIX! 🏆' : '🥈 BẠN ĐẠT Á QUÂN TOÀN DIỆN!';
        document.getElementById('championScores').innerText = `Điểm P1: ${data.scores.p1} | Điểm P2: ${data.scores.p2}`;
        modal.style.display = 'flex';
    }
}

// Bắt đầu khởi tạo sau khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
    window.ui = new UIManager();
    window.game = new RacingGame();
});
