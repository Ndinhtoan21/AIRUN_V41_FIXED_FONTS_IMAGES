# Báo cáo kiểm tra AIRUN V3.9 → V4.0

## Lỗi quan trọng đã sửa

1. HTML V3.9 có nút đóng thừa, thiếu phần tử mở và sai thứ tự đóng `section/aside/div`; lỗi này có thể làm bố cục khác nhau giữa các trình duyệt.
2. Giao diện buộc người dùng chọn “máy tính/điện thoại” dù CSS có thể tự thích nghi.
3. JavaScript chứa nhiều chức năng cũ không còn phần giao diện tương ứng.
4. Một số nội dung nói “đã kết nối” nhưng số liệu thực tế vẫn là mô phỏng.
5. Ảnh nóng từ website bên ngoài dễ mất, tải chậm hoặc bị chặn.
6. Dự án chưa có luồng rõ ràng để người dùng lưu và xem lại quyết định.

## Cải tiến V4.0

- Làm lại HTML hợp lệ, không có ID trùng và tất cả nút có `type`.
- Tối ưu responsive tại 1050 px, 780 px và 480 px.
- Dung lượng mã chính khoảng 80 KB, không còn phụ thuộc ảnh lớn.
- Kết nối Open-Meteo miễn phí; nhãn rõ dữ liệu trực tiếp, đã lưu hay dự phòng.
- Chấm điểm có thể giải thích, có ngưỡng thận trọng cho nhóm nhạy cảm.
- Thêm khung giờ đề xuất, so sánh khu vực, GPS và bản đồ 23 phường.
- Thêm bộ đồ chạy, tính pace, checklist an toàn, nhật ký và xuất CSV.
- Thêm PWA, service worker và cấu hình Render Static Site.

## Kiểm thử tự động

- Kiểm tra cú pháp JavaScript của ứng dụng và service worker.
- Kiểm tra JSON manifest.
- Kiểm tra cấu trúc HTML, ID trùng và liên kết ID từ JavaScript.
- Kiểm tra 23 phường có mã, tên và tọa độ không trùng.
- Kiểm tra mô hình chấm điểm: điều kiện tốt, xấu và nhóm nhạy cảm.
- Kiểm tra dữ liệu dự phòng đủ 36 giờ.
- Kiểm tra các tệp chính đều trả mã HTTP 200 khi chạy local.
