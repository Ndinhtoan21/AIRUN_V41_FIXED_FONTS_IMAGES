# AIRUN V8.0 — AI Coach & phản hồi người chạy (theo nhận xét BTC)

## Sửa lỗi dữ liệu (quan trọng)
- **Người dùng mới chỉ thấy số liệu dự phòng**: `localGet()` trả `null` khi trình duyệt chưa có dữ liệu → lỗi ở `restorePlanSettings` và `savePersistentCache` làm hỏng bước cập nhật trực tiếp. Đã sửa.
- **AQI/PM2.5/UV theo giờ là số mô phỏng**: proxy cũ chỉ lấy giá trị hiện tại. Máy chủ mới lấy dự báo theo giờ; ứng dụng không còn trộn số mô phỏng vào dữ liệu thật — thiếu dữ liệu thì để trống và không chấm điểm.
- Khả năng mưa hiện tại lấy từ dự báo giờ (V7 gán 100% chỉ vì có vài giọt mưa).
- “Giờ đáng cân nhắc” chỉ xét giờ chưa trôi qua.
- Thông báo “AIRUN chưa khởi động” xuất hiện sai do so sánh phiên bản `v61`.

## Yêu cầu BTC
1. **AI khi chạy**: thẻ AIRUN Coach (OpenAI) đọc toàn bộ số liệu đang hiển thị, mô tả bằng lời, gợi ý giờ chạy/cách chạy/đồ mang theo, có ô hỏi thêm. Khi đang chạy GPS: AI nhắc ngắn bằng giọng nói theo km và khi điều kiện thay đổi. Thang nhiệt hiệu chỉnh cho người quen nắng nóng ở Đà Nẵng.
2. **Phản hồi sau buổi chạy**: “Đúng / Quá khắt khe / Quá dễ dãi” + cảm nhận nóng, khó thở, mệt, cung đường. Phản hồi lưu nhật ký, gửi về máy chủ, AI nhận xét buổi chạy, và điểm các lần sau tự hiệu chỉnh theo phản hồi.
3. **Người chạy thật dùng thử**: ô “Tên/mã người thử”, thống kê phản hồi, xuất CSV (nhật ký trên máy và `/api/feedback/export`), webhook Google Sheet.
4. **Khóa dịch vụ về máy chủ**: bỏ hộp nhập khóa trong trình duyệt; GraphHopper/OpenAI nằm trong biến môi trường Render; xóa khóa cũ đã lưu trong trình duyệt.
