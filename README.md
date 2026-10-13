# 🏎️ TURBO CLASH 2P - GAME ĐUA XE 2 NGƯỜI QUA LẬP TRÌNH SOCKET

Game đua xe đối kháng 2 người thời gian thực được xây dựng bằng **Lập trình Socket (WebSocket / Python Socket Server)** chạy trong cùng 1 server mạng nội bộ. Trò chơi hỗ trợ đa nền tảng, có thể chơi mượt mà trên **cả Máy tính (PC/Laptop) và Điện thoại thông minh (iOS/Android)** với **10 Levels độ khó tăng dần**.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Chơi 2 người trên 2 thiết bị khác nhau (Multiplayer qua Socket):**
   - Hoạt động trơn tru trong mạng nội bộ (LAN / Wi-Fi).
   - Máy 1 làm Server kiêm người chơi 1 (Red Phantom - Xe Đỏ).
   - Máy 2 (PC khác hoặc Điện thoại) kết nối vào phòng với tư cách người chơi 2 (Blue Lightning - Xe Xanh).
   - Tự động sinh **Mã QR** ngay trên màn hình phòng chờ để điện thoại chỉ cần quét camera là vào đua ngay!
2. **Hỗ trợ đầy đủ cả Máy tính & Điện thoại:**
   - **Trên Máy tính:** Điều khiển bằng cụm phím Mũi tên (hoặc W/A/S/D) và phím `Space` để kích hoạt Nitro tăng tốc.
   - **Trên Điện thoại:** Giao diện nút cảm ứng đa điểm (Multi-touch) chuyên nghiệp (Rẽ Trái/Phải, Bàn đạp Ga, Phanh, Nút phóng Nitro) và hỗ trợ cảm biến nghiêng điện thoại (Gyroscope).
   - Nút phóng to toàn màn hình (Fullscreen) loại bỏ thanh địa chỉ trình duyệt trên điện thoại.
3. **10 Màn chơi (10 Levels) độ khó tăng dần:**
   - Mỗi Level có cự ly, độ uốn lượn cua, giới hạn tốc độ và thời tiết riêng biệt.
   - Chướng ngại vật được đồng bộ chuẩn xác giữa 2 máy nhờ thuật toán sinh ngẫu nhiên theo Seed chung (`SeededRandom`).
4. **Hệ thống âm thanh & Đồ họa thuần túy (Zero External Assets):**
   - Đồ họa Canvas 2D tốc độ 60 FPS mượt mà với hiệu ứng khói lốp, tia lửa va chạm, lửa phụt bô Nitro, vệt trượt lốp xe và hiệu ứng thời tiết.
   - Âm thanh tổng hợp thời gian thực bằng **Web Audio API** (tiếng rít bô, gầm rú động cơ theo vòng tua RPM, tiếng nổ lốp va chạm, còi đếm ngược 3-2-1-GO).

---

## 🚦 DANH SÁCH 10 LEVELS (ĐỘ KHÓ TĂNG DẦN)

| Level | Tên Màn Chơi | Cự Ly | Số Làn | Chướng Ngại Vật & Cơ Chế Đặc Biệt |
|:---:|:---|:---:|:---:|:---|
| **1** | **Cao Tốc Khởi Động** | 1200m | 4 làn | Đường thẳng, chóp nón giao thông, xe dân sự chạy chậm. |
| **2** | **Đại Lộ Ven Biển** | 1500m | 4 làn | Khúc cua thoai thoải, rào chắn sửa đường, mật độ xe tăng nhẹ. |
| **3** | **Vực Dầu Trơn Trượt** | 1800m | 3 làn | **Vệt dầu loang**: Xe cán phải dầu sẽ bị drift mất lái 1.3s xoay vòng! |
| **4** | **Bão Cát Sa Mạc** | 2000m | 3 làn | **Bão cát & Gò cát lún**: Làm hãm 50% tốc độ, có tấm Boost Pad phóng nhanh. |
| **5** | **Giờ Cao Điểm Đô Thị** | 2200m | 4 làn | Mật độ xe cộ dày đặc, xe dân sự chuyển làn liên tục, cần lạng lách khéo léo. |
| **6** | **Đêm Sương Mù Neon** | 2400m | 3 làn | Tầm nhìn bị che bởi sương mù, hố ga hỏng, dựa vào đèn pha và vạch Neon. |
| **7** | **Đèo Núi Hiểm Trở** | 2600m | **2 làn** | Đường đèo hẹp zíc-zắc, **Đá tảng lăn ngang đường** cực kỳ nguy hiểm. |
| **8** | **Bão Giông Sấm Sét** | 2800m | 3 làn | Mưa to và sấm chớp giật, đường ướt trượt nước (**Aquaplaning**, giảm 30% độ bám). |
| **9** | **Cảnh Sát Truy Cản** | 3000m | 3 làn | **Xe cảnh sát tuần tra** chặn đầu và **Bẫy rải đinh** sắc nhọn làm xịt lốp hãm tốc. |
| **10** | **Chung Kết Hỏa Ngục** | 3500m | 3 làn | Đỉnh cao tốc độ 300 km/h! Kết hợp toàn bộ chướng ngại vật & vệt lửa nham thạch! |

---

## 🕹️ HƯỚNG DẪN ĐIỀU KHIỂN

### Trên Máy Tính (PC / Laptop):
- **Phím Mũi tên Lên (▲) hoặc W:** Tăng tốc (Đạp ga)
- **Phím Mũi tên Xuống (▼) hoặc S:** Hãm phanh / Lùi xe
- **Phím Mũi tên Trái (◄) hoặc A:** Đánh lái sang Trái
- **Phím Mũi tên Phải (►) hoặc D:** Đánh lái sang Phải
- **Phím Cách (Space):** Kích hoạt tăng tốc phản lực **NITRO (N2O)**

### Trên Điện Thoại (iOS / Android):
- **Cụm bên trái:** Nút `◄ TRÁI` và `► PHẢI` để bẻ cua.
- **Cụm bên phải:**
  - Nút `⚡ GA` (Xanh lá): Nhấn giữ để tăng tốc.
  - Nút `🛑 PHANH` (Đỏ): Nhấn để hãm tốc khi gặp chướng ngại vật.
  - Nút `🚀 NITRO` (Tím): Phun lửa bứt tốc vượt đối thủ.
- *Có thể rung phản hồi xúc giác (Haptic Vibration) khi va chạm hoặc phóng Nitro.*

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY GAME

### Bước 1: Khởi động máy chủ Server
Mở thư mục `D:\Game`, bạn có 2 cách khởi động:
- **Cách 1 (Nhanh nhất):** Nhấp đúp chuột vào file `run_game.bat`.
- **Cách 2 (Dùng lệnh Command Prompt / PowerShell):**
  ```powershell
  cd D:\Game
  py server.py
  ```

Khi server khởi chạy, màn hình console sẽ hiển thị thông tin như sau:
```text
=================================================================
  🏎️  TURBO CLASH 2P - MULTIPLAYER SOCKET RACING SERVER  🏁
=================================================================
[*] HTTP Server đang chạy tại:   http://0.0.0.0:8000
[*] WebSocket Server chạy tại:   ws://0.0.0.0:8765
-----------------------------------------------------------------
  HƯỚNG DẪN KẾT NỐI 2 THIẾT BỊ (CÙNG MẠNG WI-FI / LAN):
  • MÁY 1 (PC Máy chủ):       http://localhost:8000
  • MÁY 2 (PC/Laptop khác):   http://192.168.x.x:8000
  • ĐIỆN THOẠI (iOS/Android): http://192.168.x.x:8000
=================================================================
```

### Bước 2: Vào chơi từ 2 thiết bị
1. **Thiết bị 1 (PC máy chủ):**
   - Mở trình duyệt Web (Chrome, Edge, Firefox), truy cập: `http://localhost:8000`
   - Nhập tên của bạn, chọn thiết bị `🖥️ Máy tính`, bấm **VÀO PHÒNG ĐUA**.
2. **Thiết bị 2 (Điện thoại hoặc Laptop khác cùng mạng Wi-Fi):**
   - **Cách A (Quét mã):** Mở camera điện thoại quét mã QR hiển thị trên màn hình PC máy chủ.
   - **Cách B (Nhập link):** Mở trình duyệt trên điện thoại/máy 2 và nhập địa chỉ IP hiển thị (Ví dụ: `http://192.168.0.102:8000`).
   - Nhập tên, bấm **VÀO PHÒNG ĐUA**.
3. **Cả 2 người chơi cùng bấm "SẴN SÀNG ĐUA !"** -> Trò chơi sẽ đếm ngược **3... 2... 1... GO!** và bắt đầu cuộc đua rực lửa!

---

## 📡 KIẾN TRÚC LẬP TRÌNH SOCKET (SOCKET PROTOCOL)

Hệ thống hoạt động dựa trên mô hình Socket Server tập trung:
- **Server:** Chạy trên Python bằng `websockets` (Asyncio) và `http.server` trên luồng song song.
- **Client (Web Cross-platform):** Sử dụng chuẩn `WebSocket (RFC 6455)` giao tiếp song công toàn phần (Full-Duplex) với tần số đồng bộ trạng thái 30 Hz (30 lần/giây), chạy mượt trên cả PC và Mobile qua trình duyệt.

### Định dạng gói tin Socket (JSON Packets):
- `join`: Khởi tạo người chơi vào phòng đua (xác định P1 hoặc P2).
- `toggle_ready`: Báo trạng thái sẵn sàng; khi cả 2 người cùng sẵn sàng, server kích hoạt `countdown_start`.
- `update_state`: Gửi tọa độ `(x, y)`, tốc độ `speed`, góc nghiêng `angle`, lượng `nitro` và độ bền `health`.
- `opponent_state`: Server phát lại (relay) trạng thái cho đối thủ; Client sử dụng thuật toán nội suy làm mượt (Lerp) giúp xe đối thủ chuyển động êm ái kể cả khi mạng Wi-Fi có độ trễ.
- `finish_level`: Ghi nhận thời gian cán đích của từng tay đua, tính điểm xếp hạng Level và mở khóa màn tiếp theo.
- `ping` / `pong`: Đo đạc độ trễ mạng (Ping mili-giây) hiển thị trực tiếp trên góc HUD.
