# Cấu hình Mapbox + GraphHopper cho AIRUN V7.0

## Mapbox
1. Tạo/đăng nhập tài khoản Mapbox.
2. Tạo một **public access token** riêng cho AIRUN (token bắt đầu bằng `pk.`).
3. Chỉ cấp các public/read scopes cần thiết cho web map.
4. Nên thêm URL restriction cho domain AIRUN, ví dụ `https://airun-da-nang.onrender.com`.
5. Không dùng secret token (`sk.`) ở frontend.

## GraphHopper
1. Tạo/đăng nhập tài khoản GraphHopper.
2. Mở Dashboard → API Keys → Add API Key.
3. Copy key.
4. Trong AIRUN → Cung chạy gợi ý → `Kết nối bản đồ nâng cao` → dán key.

## Kiểm tra
Sau khi lưu cấu hình:
- trạng thái bên dưới nút tạo cung báo Mapbox + GraphHopper đã cấu hình;
- bấm tạo cung;
- pill kết quả phải là `GRAPHHOPPER ROUND TRIP`;
- nền bản đồ chuyển sang Mapbox Outdoors;
- route có mốc kilomet và marker bắt đầu/kết thúc.

## Lưu ý
V7.0 là bản demo Static Site. GraphHopper key vẫn xuất hiện trong Network request của trình duyệt. Nếu đưa AIRUN vào sử dụng thực tế, chuyển GraphHopper sang backend proxy và lưu key trong environment variable của server.
