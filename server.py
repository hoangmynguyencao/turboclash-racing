#!/usr/bin/env python3
"""
Turbo Clash 2P - Multiplayer Racing Game Server
Unified Web & WebSocket Server (aiohttp)
Hỗ trợ triển khai Cloud (Render.com) & Chạy nội bộ LAN/Localhost
Đua xe đối kháng 2 người (PC & Điện thoại) qua Socket thời gian thực (10 Levels)
"""

import asyncio
import json
import os
import random
import socket
import sys
from aiohttp import web, WSMsgType

if sys.platform.startswith('win'):
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

PORT = int(os.environ.get('PORT', 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

# ----------------- HÀM TÌM IP LAN (HỖ TRỢ CHẠY NỘI BỘ) -----------------
def get_lan_ips():
    ips = []
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        primary = s.getsockname()[0]
        s.close()
        ips.append(primary)
    except Exception:
        pass

    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if ip not in ips and not ip.startswith('127.'):
                ips.append(ip)
    except Exception:
        pass

    if not ips:
        ips.append('127.0.0.1')
    return ips

# ----------------- MULTIPLAYER ROOM & GAME STATE -----------------
class Room:
    def __init__(self, room_id):
        self.room_id = room_id
        self.players = {}  # { ws: { id, name, device, color, x, y, speed, ... } }
        self.level = 1
        self.max_level = 10
        self.state = 'waiting'  # 'waiting', 'countdown', 'racing', 'level_finished', 'game_over'
        self.level_seed = random.randint(1000, 99999)
        self.finish_times = {}  # { player_id: time_taken }
        self.scores = {'p1': 0, 'p2': 0}
        self.created_at = asyncio.get_event_loop().time()

    def get_player_by_id(self, p_id):
        for ws, p in self.players.items():
            if p['id'] == p_id:
                return ws, p
        return None, None

    def serialize_players(self):
        res = []
        for p in self.players.values():
            res.append({
                'id': p['id'],
                'name': p['name'],
                'device': p.get('device', 'PC'),
                'color': p['color'],
                'carModel': p.get('carModel', 0),
                'ready': p.get('ready', False),
                'x': p.get('x', 0),
                'y': p.get('y', 0),
                'speed': p.get('speed', 0),
                'angle': p.get('angle', 0),
                'nitro': p.get('nitro', 100),
                'health': p.get('health', 100),
                'score': self.scores.get(p['id'], 0),
                'finished': p.get('finished', False),
                'finishTime': self.finish_times.get(p['id'], None)
            })
        return res

rooms = {}

async def broadcast(room, message_dict, exclude_ws=None):
    if not room.players:
        return
    msg = json.dumps(message_dict)
    coros = []
    for ws in list(room.players.keys()):
        if ws != exclude_ws and not ws.closed:
            coros.append(ws.send_str(msg))
    if coros:
        await asyncio.gather(*coros, return_exceptions=True)

# ----------------- WEBSOCKET HANDLER -----------------
async def ws_handler(request):
    ws = web.WebSocketResponse(heartbeat=20.0)
    await ws.prepare(request)

    current_room = None
    player_id = None

    try:
        async for msg in ws:
            if msg.type != WSMsgType.TEXT:
                continue

            try:
                data = json.loads(msg.data)
            except Exception:
                continue

            msg_type = data.get('type')

            # 1. Tham gia phòng (JOIN)
            if msg_type == 'join':
                room_id = (data.get('room') or 'ROOM-1').strip().upper()
                name = (data.get('name') or 'Tay đua').strip()
                device = data.get('device') or 'PC'
                prefer_host = data.get('preferHost', False)

                if room_id not in rooms:
                    rooms[room_id] = Room(room_id)
                room = rooms[room_id]
                current_room = room

                # Kiểm tra số lượng người chơi
                if len(room.players) >= 2:
                    await ws.send_str(json.dumps({
                        'type': 'error',
                        'message': f'Phòng {room_id} đã đủ 2 người chơi! Vui lòng chọn mã phòng khác.'
                    }))
                    continue

                # Xác định P1 hoặc P2 (Ưu tiên PC hoặc người đầu tiên làm P1)
                existing_ids = [p['id'] for p in room.players.values()]
                if 'p1' not in existing_ids:
                    player_id = 'p1'
                else:
                    player_id = 'p2'

                color = '#ff3344' if player_id == 'p1' else '#00d2ff'
                default_name = "Tay đua 1 (Đỏ)" if player_id == 'p1' else "Tay đua 2 (Xanh)"
                if not name or name == 'Tay đua':
                    name = default_name

                room.players[ws] = {
                    'id': player_id,
                    'name': name,
                    'device': device,
                    'color': color,
                    'carModel': 0 if player_id == 'p1' else 1,
                    'ready': False,
                    'x': -60 if player_id == 'p1' else 60,
                    'y': 0,
                    'speed': 0,
                    'angle': 0,
                    'nitro': 100,
                    'health': 100,
                    'finished': False
                }

                print(f"[WS] {name} ({player_id}, {device}) đã kết nối vào phòng {room_id}")

                # Gửi thông tin xác nhận cho người chơi
                await ws.send_str(json.dumps({
                    'type': 'joined',
                    'playerId': player_id,
                    'roomId': room_id,
                    'level': room.level,
                    'levelSeed': room.level_seed,
                    'state': room.state,
                    'players': room.serialize_players()
                }))

                # Báo cho người còn lại trong phòng
                await broadcast(room, {
                    'type': 'player_joined',
                    'player': room.players[ws],
                    'players': room.serialize_players(),
                    'state': room.state
                }, exclude_ws=ws)

            # 2. Báo sẵn sàng (READY / TOGGLE READY)
            elif msg_type == 'toggle_ready':
                if not current_room or ws not in current_room.players:
                    continue
                p = current_room.players[ws]
                p['ready'] = not p.get('ready', False)

                await broadcast(current_room, {
                    'type': 'ready_status',
                    'playerId': p['id'],
                    'ready': p['ready'],
                    'players': current_room.serialize_players()
                })

                # Nếu cả 2 đều sẵn sàng -> đếm ngược bắt đầu màn chơi
                if len(current_room.players) == 2 and all(pl.get('ready', False) for pl in current_room.players.values()):
                    current_room.state = 'countdown'
                    current_room.level_seed = random.randint(1000, 99999)
                    current_room.finish_times = {}
                    for pl in current_room.players.values():
                        pl['finished'] = False
                        pl['x'] = -70 if pl['id'] == 'p1' else 70
                        pl['y'] = 0
                        pl['speed'] = 0
                        pl['angle'] = 0
                        pl['nitro'] = 100
                        pl['health'] = 100

                    await broadcast(current_room, {
                        'type': 'countdown_start',
                        'level': current_room.level,
                        'levelSeed': current_room.level_seed,
                        'players': current_room.serialize_players()
                    })

            # 3. Đồng bộ vị trí và trạng thái xe trong thời gian thực (POSITION UPDATE)
            elif msg_type == 'update_state':
                if not current_room or ws not in current_room.players:
                    continue
                p = current_room.players[ws]
                p['x'] = data.get('x', p['x'])
                p['y'] = data.get('y', p['y'])
                p['speed'] = data.get('speed', p['speed'])
                p['angle'] = data.get('angle', p['angle'])
                p['nitro'] = data.get('nitro', p['nitro'])
                p['health'] = data.get('health', p['health'])

                # Chuyển tiếp trạng thái ngay lập tức cho đối thủ
                await broadcast(current_room, {
                    'type': 'opponent_state',
                    'playerId': p['id'],
                    'x': p['x'],
                    'y': p['y'],
                    'speed': p['speed'],
                    'angle': p['angle'],
                    'nitro': p['nitro'],
                    'health': p['health']
                }, exclude_ws=ws)

            # 4. Va chạm chướng ngại vật hoặc nhặt vật phẩm (EVENT)
            elif msg_type == 'event':
                if not current_room or ws not in current_room.players:
                    continue
                event_name = data.get('event')
                await broadcast(current_room, {
                    'type': 'game_event',
                    'playerId': player_id,
                    'event': event_name,
                    'payload': data.get('payload', {})
                }, exclude_ws=ws)

            # 5. Cán đích Level (LEVEL FINISH)
            elif msg_type == 'finish_level':
                if not current_room or ws not in current_room.players:
                    continue
                p = current_room.players[ws]
                finish_time = float(data.get('time', 0))

                if not p.get('finished', False):
                    p['finished'] = True
                    current_room.finish_times[p['id']] = finish_time
                    rank = len(current_room.finish_times)

                    if rank == 1:
                        current_room.scores[p['id']] = current_room.scores.get(p['id'], 0) + 100
                    else:
                        current_room.scores[p['id']] = current_room.scores.get(p['id'], 0) + 60

                    print(f"[FINISH] {p['name']} ({p['id']}) về đích Level {current_room.level} hạng {rank} ({finish_time:.2f}s)")

                    await broadcast(current_room, {
                        'type': 'player_finished',
                        'playerId': p['id'],
                        'rank': rank,
                        'time': finish_time,
                        'scores': current_room.scores
                    })

                    # Khi cả 2 người đã cán đích
                    if len(current_room.finish_times) >= len(current_room.players):
                        current_room.state = 'level_finished'
                        await broadcast(current_room, {
                            'type': 'all_finished',
                            'level': current_room.level,
                            'finishTimes': current_room.finish_times,
                            'scores': current_room.scores,
                            'isLastLevel': (current_room.level >= current_room.max_level)
                        })

            # 6. Chuyển sang Level tiếp theo (NEXT LEVEL)
            elif msg_type == 'request_next_level':
                if not current_room:
                    continue
                if current_room.level < current_room.max_level:
                    current_room.level += 1
                    current_room.state = 'waiting'
                    current_room.finish_times = {}
                    current_room.level_seed = random.randint(1000, 99999)
                    for pl in current_room.players.values():
                        pl['ready'] = False
                        pl['finished'] = False
                        pl['x'] = -70 if pl['id'] == 'p1' else 70
                        pl['y'] = 0
                        pl['speed'] = 0
                        pl['nitro'] = 100
                        pl['health'] = 100

                    print(f"[LEVEL] Phòng {current_room.room_id} chuyển sang Level {current_room.level}")

                    await broadcast(current_room, {
                        'type': 'level_changed',
                        'level': current_room.level,
                        'levelSeed': current_room.level_seed,
                        'scores': current_room.scores,
                        'players': current_room.serialize_players()
                    })
                else:
                    current_room.state = 'game_over'
                    await broadcast(current_room, {
                        'type': 'game_completed',
                        'scores': current_room.scores,
                        'winner': 'p1' if current_room.scores.get('p1', 0) > current_room.scores.get('p2', 0) else 'p2'
                    })

            # 7. Khởi động lại toàn bộ game (RESTART GAME)
            elif msg_type == 'restart_game':
                if not current_room:
                    continue
                current_room.level = 1
                current_room.state = 'waiting'
                current_room.scores = {'p1': 0, 'p2': 0}
                current_room.finish_times = {}
                current_room.level_seed = random.randint(1000, 99999)
                for pl in current_room.players.values():
                    pl['ready'] = False
                    pl['finished'] = False
                    pl['x'] = -70 if pl['id'] == 'p1' else 70
                    pl['y'] = 0
                    pl['speed'] = 0
                    pl['nitro'] = 100
                    pl['health'] = 100

                await broadcast(current_room, {
                    'type': 'game_restarted',
                    'level': 1,
                    'levelSeed': current_room.level_seed,
                    'scores': current_room.scores,
                    'players': current_room.serialize_players()
                })

            # 8. Chọn nhanh Level
            elif msg_type == 'jump_level':
                target_lvl = int(data.get('targetLevel', 1))
                if 1 <= target_lvl <= 10 and current_room:
                    current_room.level = target_lvl
                    current_room.state = 'waiting'
                    current_room.finish_times = {}
                    current_room.level_seed = random.randint(1000, 99999)
                    for pl in current_room.players.values():
                        pl['ready'] = False
                        pl['finished'] = False
                    await broadcast(current_room, {
                        'type': 'level_changed',
                        'level': current_room.level,
                        'levelSeed': current_room.level_seed,
                        'scores': current_room.scores,
                        'players': current_room.serialize_players()
                    })

            # 9. Gửi tin nhắn / Emote nhanh
            elif msg_type == 'chat_emote':
                if current_room:
                    await broadcast(current_room, {
                        'type': 'chat_emote',
                        'playerId': player_id,
                        'emote': data.get('emote', '🏁')
                    })

            # 10. Ping đo độ trễ mạng
            elif msg_type == 'ping':
                await ws.send_str(json.dumps({
                    'type': 'pong',
                    'clientTime': data.get('clientTime')
                }))

    except Exception as e:
        print(f"[WS Error]: {e}")
    finally:
        if current_room and ws in current_room.players:
            p = current_room.players.pop(ws)
            print(f"[WS] {p['name']} ({p['id']}) đã rời phòng {current_room.room_id}")

            if current_room.players:
                current_room.state = 'waiting'
                await broadcast(current_room, {
                    'type': 'player_left',
                    'playerId': p['id'],
                    'name': p['name'],
                    'players': current_room.serialize_players()
                })
            else:
                if current_room.room_id in rooms:
                    del rooms[current_room.room_id]

    return ws

# ----------------- HTTP ROUTERS & STATIC FILES -----------------
async def handle_index(request):
    index_file = os.path.join(PUBLIC_DIR, 'index.html')
    return web.FileResponse(index_file)

async def handle_health(request):
    return web.Response(text="OK - Turbo Clash Server Healthy")

async def init_app():
    app = web.Application()

    # WebSocket route
    app.router.add_get('/ws', ws_handler)

    # Health check for cloud deployment (Render, Fly.io, etc.)
    app.router.add_get('/healthz', handle_health)

    # Static routes
    app.router.add_get('/', handle_index)
    app.router.add_static('/', path=PUBLIC_DIR, show_index=True)

    return app

def main():
    lan_ips = get_lan_ips()
    primary_ip = lan_ips[0] if lan_ips else '127.0.0.1'

    print("=" * 65)
    print("  🏎️  TURBO CLASH 2P - MULTIPLAYER RACING SERVER  🏁")
    print("=" * 65)
    print(f"[*] Máy chủ đang hoạt động tại cổng: {PORT}")
    print(f"[*] Hỗ trợ cả Web (HTTP) và Socket (WS) trên CÙNG 1 CỔNG DUY NHẤT!")
    print("-" * 65)
    print("  HƯỚNG DẪN KẾT NỐI:")
    print(f"  • MÁY TÍNH (PC Máy chủ):    http://localhost:{PORT}")
    print(f"  • MÁY 2 / ĐIỆN THOẠI (LAN):  http://{primary_ip}:{PORT}")
    print(f"  • CLOUD (Render.com):        https://turboclash-racing.onrender.com")
    print("=" * 65)

    app = init_app()
    web.run_app(app, host='0.0.0.0', port=PORT)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n[!] Đã tắt máy chủ.")
        sys.exit(0)
    except OSError as err:
        if "10048" in str(err):
            print(f"\n[!] LỖI: Cổng {PORT} đang bị chiếm dụng bởi tiến trình khác!")
        else:
            print(f"\n[!] Lỗi mạng/hệ điều hành: {err}")
        sys.exit(1)
