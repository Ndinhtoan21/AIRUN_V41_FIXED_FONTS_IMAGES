# AIRUN V6.2

- Đổi luồng chính thành Kế hoạch → Cung chạy → Chạy GPS.
- Hero dẫn người dùng vào Kế hoạch thay vì bắt đầu GPS ngay.
- Bản đồ lớn trở thành Cung chạy gợi ý theo số km.
- Mặc định lấy quãng đường từ thời lượng + pace; có nút 3 km / 5 km / 10 km.
- Điểm xuất phát ưu tiên GPS, fallback về khu vực đã chọn.
- Thử tạo cung đi-về theo mạng đường dành cho người đi bộ bằng Valhalla public demo; nếu dịch vụ không phản hồi thì hiển thị phác thảo rõ ràng, không giả là route thật.
- Nút Dùng cung này & chạy đưa cung gợi ý sang GPS Tracker.
- GPS Tracker hiển thị cung dự kiến màu xanh lam và đường chạy thực tế riêng.
- Giải thích pace thân thiện hơn: phút/giây cho mỗi km + tốc độ tương đương.
- Giữ nguyên Weather/Air proxy trên Render.
