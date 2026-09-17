# AIRUN V5.2 — GPS QUICK CONNECT

- GPS hai tầng: vị trí nhanh trước, độ chính xác cao sau.
- Kiểm tra secure context và quyền geolocation trước khi chờ GPS.
- Thêm hard timeout để UI không treo vô thời hạn.
- Thông báo lỗi rõ cho các trường hợp: quyền bị chặn, Location Services tắt, thiết bị không trả về vị trí, HTTPS không hợp lệ.
- Chế độ chạy chỉ bắt đầu tính thời gian sau khi đã nhận được vị trí đầu tiên.
- Điểm GPS đầu tiên được đưa vào tracker ngay để người dùng thấy trạng thái kết nối tức thì.
- Nếu điểm đầu tiên còn thô, AIRUN tiếp tục nâng độ chính xác ở nền và không cộng quãng đường cho đến khi tín hiệu đủ tốt.
- Cache PWA tăng lên V5.2 để tránh trình duyệt giữ app.js V5.1.
