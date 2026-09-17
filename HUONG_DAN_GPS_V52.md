# AIRUN V5.2 — KIỂM TRA GPS

## Sau khi deploy
1. Mở AIRUN bằng HTTPS: https://airun-da-nang.onrender.com
2. Nên test GPS bằng điện thoại thật.
3. Bấm “Dùng vị trí hiện tại” hoặc “Bắt đầu chạy”.
4. Cho phép Location / Vị trí chính xác khi trình duyệt hỏi.

## Nếu dùng Chrome trên Windows
Máy tính xách tay thường không có chip GPS như điện thoại. Chrome phụ thuộc vào Windows Location Services, Wi‑Fi và mạng.
- Windows Settings > Privacy & security > Location
- Bật Location services
- Trong Chrome, mở biểu tượng cạnh thanh địa chỉ > Site settings > Location > Allow
- Sau đó tải lại AIRUN

## Nếu dùng Android
- Bật GPS/Vị trí trên máy
- Chrome > quyền của trang AIRUN > Location > Allow
- Android > App permissions > Chrome > Location > Allow while using
- Bật Precise location nếu có
- Test ở nơi gần cửa sổ hoặc ngoài trời

## Nếu dùng iPhone
- Settings > Privacy & Security > Location Services > On
- Safari Websites > While Using
- Cho phép Precise Location nếu có

## Trạng thái V5.2
- GPS đã kết nối: AIRUN đã nhận được tọa độ
- GPS đã kết nối nhưng còn yếu: đã có tọa độ nhưng sai số còn lớn, chưa cộng quãng đường
- Chưa kết nối được GPS: AIRUN sẽ kèm nguyên nhân / hướng dẫn
