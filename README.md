# 🏎️ TURBO CLASH 2P - GAME ĐUA XE 2 NGƯỜI QUA LẬP TRÌNH SOCKET

Game đua xe đối kháng 2 người thời gian thực được xây dựng bằng **Lập trình Socket (WebSocket / Python Socket Server)** chạy trong cùng 1 server mạng nội bộ. Trò chơi hỗ trợ đa nền tảng, có thể chơi mượt mà trên **cả Máy tính (PC/Laptop) và Điện thoại thông minh (iOS/Android)** với **10 Levels độ khó tăng dần**.

Máy 1 truy cập vào link: https://turboclash-racing.onrender.com để chơi
Máy 2 truy cập link mời vào phòng hiện trên máy 1 (vd: https://turboclash-racing.onrender.com/?room=ROOM-1 ) hoặc mã QR hiển thị
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

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI LÊN INTERNET (CÓ TÊN MIỀN MIỄN PHÍ)

Game đã được tối ưu hóa thành **Kiến trúc Server hợp nhất (Unified aiohttp)**: Chạy cả Web (HTTP) và Socket (WSS) trên **cùng 1 cổng duy nhất**. Người chơi chỉ cần duy nhất **1 đường link tên miền**, không cần nhập IP, không cần cài đặt gì thêm!

### 🌟 Cơ Chế Tự Động Ưu Tiên Máy Chủ (Host Priority):
- **Người vào bằng Máy tính (PC / Laptop):** Trang web tự động nhận diện thiết bị, ưu tiên cấp quyền **👑 MÁY CHỦ (Host - Xe Đỏ P1)**. Máy tính tự động tạo phòng, sinh mã QR và link mời có gắn mã phòng.
- **Người chơi thứ 2 (Điện thoại hoặc Máy tính khác):** Chỉ cần quét mã QR bằng camera điện thoại hoặc click vào link tên miền (`https://.../?room=ROOM-1`). Trang web tự động nhận diện và kết nối vào phòng với tư cách **⚡ NGƯỜI CHƠI 2 (Khách - Xe Xanh P2)**!

---

### 🚀 CÁCH TRIỂN KHAI LÊN RENDER.COM (100% MIỄN PHÍ, CÓ TÊN MIỀN NGAY):

Render.com cho phép chạy Server Python + WebSocket 24/7 hoàn toàn miễn phí và tự động cấp subdomain theo tên game đua xe (Ví dụ: `https://turboclash-racing.onrender.com`).

#### Bước 1: Đẩy mã nguồn lên GitHub (Miễn phí)
1. Mở trình duyệt, đăng nhập vào [GitHub](https://github.com) và tạo một Repository mới tên là `turboclash-racing` (chọn Public).
2. Mở PowerShell trong thư mục `D:\Game` và chạy lệnh kết nối (thay `username` bằng tài khoản GitHub của bạn):
   ```powershell
   git remote add origin https://github.com/<username>/turboclash-racing.git
   git branch -M main
   git push -u origin main
   ```

#### Bước 2: Tạo Web Service trên Render.com
1. Truy cập [render.com](https://render.com) và đăng nhập bằng tài khoản GitHub của bạn.
2. Bấm nút **New +** ở góc trên bên phải -> Chọn **Web Service**.
3. Chọn Repository `turboclash-racing` bạn vừa tạo.
4. Điền các thông tin:
   - **Name:** `turboclash-racing` (hoặc tên bất kỳ bạn thích liên quan đến đua xe, ví dụ: `dua-xe-toc-do`). Tên này sẽ chính là tên miền: `https://turboclash-racing.onrender.com`.
   - **Language:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python server.py`
   - **Instance Type:** `Free` ($0/month)
5. Bấm **Deploy Web Service**!
6. Đợi khoảng 1-2 phút, Render sẽ hoàn tất và hiển thị đường link tên miền chính thức của bạn (Ví dụ: `https://turboclash-racing.onrender.com`).

#### Bước 3: Vào chơi ngay từ bất kỳ đâu!
1. **Máy tính:** Mở link `https://turboclash-racing.onrender.com` -> Web tự động nhận diện là PC và làm Máy chủ, hiển thị mã QR trên màn hình.
2. **Điện thoại:** Mở camera quét mã QR hoặc mở link `https://turboclash-racing.onrender.com/?room=ROOM-1` -> Vào thẳng phòng đối đầu với PC!
3. Cả 2 bấm **SẴN SÀNG ĐUA !** và bắt đầu tranh tài 10 Levels!

---

## 💻 HOẶC CHẠY TRỰC TIẾP TRÊN MÁY TÍNH (OFFLINE / LAN)

Nếu muốn chơi nhanh trong nhà mà chưa cần đẩy lên Render:
1. Nhấp đúp chuột vào file `run_game.bat` (hoặc chạy lệnh `py server.py`).
2. Mở trình duyệt truy cập: `http://localhost:8000`.
3. Người thứ 2 quét mã QR trên màn hình hoặc nhập `http://<IP-may-tinh>:8000` để vào đua.

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
