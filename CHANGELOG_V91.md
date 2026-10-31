# AIRUN V9.1 — giao diện điện thoại mới

## Lộ trình người dùng
- Lộ trình 5 bước thống nhất: **Điều kiện → AI Coach → Cung chạy → Chạy GPS → Đánh giá**.
- Thanh lộ trình dính dưới tiêu đề ở tab Kế hoạch, AI Coach, Chạy; tự sáng đúng bước theo vị trí cuộn, chạm để nhảy tới bước.
- Trang chủ: câu kết luận "có nên chạy" nằm ngay dưới nhiệt độ; danh sách "Lộ trình chạy hôm nay" 5 bước.
- Thẻ "Bước tiếp theo" ở cuối tab Kế hoạch và AI Coach.
- Tab Nhật ký có tiểu mục dính (Hồ sơ · Nhật ký · Góp ý · Tiện ích · Về AIRUN); phần giới thiệu thu gọn trên điện thoại.
- Đường dẫn mới `#/run-gps` mở thẳng phần chạy GPS.

## Thiết kế
- Biến thiết kế từ Open Props (MIT): đường cong chuyển động, thời lượng, bo góc, đổ bóng, cỡ chữ.
- Biểu tượng Lucide (ISC) cho thanh tab, nút Hỏi AI, tài khoản, lộ trình.
- Chữ Be Vietnam Pro, thang cỡ chữ thống nhất, số liệu thẳng cột (tabular-nums).
- Nút bấm cao tối thiểu 44–48 px, hiệu ứng nhấn (thu nhỏ + gợn sóng), rung nhẹ trên Android, viền focus rõ cho bàn phím.
- Thanh tab dưới kiểu "viên thuốc", nút Hỏi AI thu gọn khi cuộn và ẩn ở tab AI Coach.
- Tôn trọng chế độ "giảm chuyển động" của hệ điều hành.

## Kỹ thuật
- Tách `index.html` thành `css/` và `js/`; máy chủ chỉ phục vụ file trong `assets/`, `css/`, `js/` (kiểm tra đường dẫn đã chuẩn hoá).
- Bản đồ nền Google tắt mặc định (`GOOGLE_MAPS_BASEMAP=1` để bật lại) vì Google từ chối Maps cho tài khoản thanh toán ở Việt Nam; dùng OpenFreeMap, không còn thông báo lỗi.
