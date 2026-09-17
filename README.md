# AIRUN V7.0 — Mapbox + GraphHopper Trial

Luồng chính vẫn giữ đơn giản:

**Lên kế hoạch → Tạo cung chạy → Chọn cung → Chạy GPS**

## Điểm mới
- GraphHopper `round_trip` tạo cung chạy vòng từ đúng điểm xuất phát theo số km mục tiêu.
- Mapbox GL JS v3.30.0 hiển thị bản đồ vector tương tác đẹp, zoom/pan mượt.
- Route được vẽ bằng 3 lớp: casing trắng + xanh AIRUN + lõi lime.
- Marker BẮT ĐẦU/KẾT THÚC và mốc từng kilomet là marker thật trên Mapbox.
- Tự fit toàn bộ route vào khung bản đồ.
- Nút `Kết nối bản đồ nâng cao` cho phép nhập token/key ngay trên website, không cần sửa code.
- Cấu hình được lưu ở localStorage của trình duyệt hiện tại.
- Nếu thiếu key hoặc dịch vụ lỗi, AIRUN tự quay về OpenStreetMap + routing dự phòng như V6.3.

## Bảo mật
- Mapbox: dùng public token (`pk...`) và nên giới hạn theo domain AIRUN trong Mapbox Dashboard.
- GraphHopper: V7.0 gọi trực tiếp từ trình duyệt để tiện demo; key có thể nhìn thấy trong Network. Chỉ dùng cho demo/cuộc thi. Bản production nên đưa GraphHopper qua backend proxy.

## Render
Giữ nguyên Static Site và 2 Rewrite Rule Weather/Air hiện tại. Không cần tạo Web Service mới để thử V7.0.
