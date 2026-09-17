# AIRUN V5.8

- Sửa lỗi `quick` ngoài phạm vi trong `selectWard()` gây promise rejection khi API lỗi.
- Gỡ Service Worker cũ trước khi gọi proxy; nếu tab vẫn bị worker cũ điều khiển, tự reload một lần để giải phóng.
- Weather/Air đổi trạng thái `Đang kết nối…` ngay khi request bắt đầu.
- Parser JSON không còn phụ thuộc Content-Type; phát hiện rõ proxy trả HTML.
- Chuẩn hóa số API bằng `Number()` để chấp nhận giá trị số dạng chuỗi.
- Bọc toàn bộ async event để lỗi map/GPS phụ không làm ứng dụng bị đánh dấu chết.
- GPS refine nền có `.catch()` riêng.
- Cache namespace mới V5.8.
